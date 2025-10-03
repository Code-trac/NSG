# decision.py
import time, math
from collections import defaultdict

_next_track_id = 1
TRACKS = dict()
MAX_DISAPPEAR_SECONDS = 1.5
DIST_THRESH = 60
DEFAULT_LOITER_DIST_PX = 20
DEFAULT_LOITER_SECONDS = 10

COOLDOWN_SECONDS = {
    "loitering": 60,
    "unattended_object": 120,
    "crowd_formation": 60
}
_last_alert_time = defaultdict(lambda: 0)

def euclid(a,b):
    return math.hypot(a[0]-b[0], a[1]-b[1])

def in_zone(cx, cy, zone):
    return (cx >= zone['x1'] and cx <= zone['x2'] and cy >= zone['y1'] and cy <= zone['y2'])

def find_zone_for_centroid(cx, cy, zones):
    for z in zones:
        if in_zone(cx, cy, z):
            return z
    return None

def _match_detections_to_tracks(detections):
    global _next_track_id, TRACKS
    now = time.time()
    det_centroids = []
    det_boxes = []
    det_classes = []
    for d in detections:
        x1,y1,x2,y2 = d['box']
        cx = (x1 + x2) // 2
        cy = (y1 + y2) // 2
        det_centroids.append((cx,cy))
        det_boxes.append(d['box'])
        det_classes.append(d['cls'])

    assigned = {}
    used_tracks = set()

    for i, c in enumerate(det_centroids):
        best_tid = None
        best_dist = 1e9
        for tid, t in TRACKS.items():
            dist = euclid(c, t['centroid'])
            if dist < best_dist:
                best_dist = dist
                best_tid = tid
        if best_tid is not None and best_dist < DIST_THRESH:
            TRACKS[best_tid]['centroid'] = c
            TRACKS[best_tid]['bbox'] = det_boxes[i]
            TRACKS[best_tid]['last_seen'] = now
            prev_centroid = TRACKS[best_tid].get('prev_centroid', c)
            moved = euclid(prev_centroid, c)
            if moved < DEFAULT_LOITER_DIST_PX:
                if TRACKS[best_tid].get('stationary_since') is None:
                    TRACKS[best_tid]['stationary_since'] = now
            else:
                TRACKS[best_tid]['stationary_since'] = None
            TRACKS[best_tid]['prev_centroid'] = c
            TRACKS[best_tid]['cls'] = det_classes[i]
            assigned[i] = best_tid
            used_tracks.add(best_tid)

    for i in range(len(det_centroids)):
        if i in assigned:
            continue
        tid = f"T{_next_track_id}"
        _next_track_id += 1
        TRACKS[tid] = {
            'centroid': det_centroids[i],
            'prev_centroid': det_centroids[i],
            'first_seen': now,
            'last_seen': now,
            'stationary_since': None,
            'bbox': det_boxes[i],
            'cls': det_classes[i]
        }
        assigned[i] = tid
        used_tracks.add(tid)

    stale = []
    for tid, t in list(TRACKS.items()):
        if now - t['last_seen'] > MAX_DISAPPEAR_SECONDS:
            stale.append(tid)
    for tid in stale:
        TRACKS.pop(tid, None)

    out = []
    for tid, t in TRACKS.items():
        out.append({
            'track_id': tid,
            'bbox': t.get('bbox'),
            'centroid': t.get('centroid'),
            'cls': t.get('cls'),
            'stationary_since': t.get('stationary_since'),
            'first_seen': t.get('first_seen'),
            'last_seen': t.get('last_seen')
        })
    return out

def _in_cooldown(camera_id, zone_id, event_type):
    now = time.time()
    key = f"{camera_id}:{zone_id}:{event_type}"
    last = _last_alert_time.get(key, 0)
    if now - last < COOLDOWN_SECONDS.get(event_type, 30):
        return True
    _last_alert_time[key] = now
    return False

def analyze_frame(detections, camera_id="CAM-1", zones=None, frame=None, frame_idx=None, fps=25):
    events = []
    zones = zones or []
    tracks = _match_detections_to_tracks(detections)

    # group people by zone
    zone_people = {}
    for t in tracks:
        if t['cls'] != 'person':
            continue
        cx, cy = t['centroid']
        z = find_zone_for_centroid(cx, cy, zones)
        zid = z['zone_id'] if z else None
        zone_people.setdefault(zid, []).append(t)

    # crowd per zone
    for zid, people_tracks in zone_people.items():
        z_spec = next((z for z in zones if z['zone_id']==zid), None)
        threshold = z_spec.get('crowd_threshold') if z_spec and z_spec.get('crowd_threshold') else 6
        if len(people_tracks) >= threshold:
            if not _in_cooldown(camera_id, zid, "crowd_formation"):
                events.append({
                    "event_type":"crowd_formation",
                    "severity":"medium",
                    "confidence": min(0.95, len(people_tracks)/max(10,threshold)),
                    "camera_id": camera_id,
                    "area_id": z_spec['name'] if z_spec else None,
                    "zone_id": zid,
                    "bounding_boxes": [list(t['bbox']) for t in people_tracks],  # Ensure list format
                    "meta": {"count": len(people_tracks), "frame_idx": frame_idx}
                })

    # loitering per person
    now = time.time()
    for t in [tr for tr in tracks if tr['cls']=='person']:
        cx,cy = t['centroid']
        z = find_zone_for_centroid(cx, cy, zones)
        zid = z['zone_id'] if z else None
        z_loiter = z.get('loiter_seconds') if z and z.get('loiter_seconds') else DEFAULT_LOITER_SECONDS
        if t['stationary_since'] and now - t['stationary_since'] >= z_loiter:
            if not _in_cooldown(camera_id, zid, "loitering"):
                duration = now - t['first_seen']
                events.append({
                    "event_type":"loitering",
                    "severity":"medium",
                    "confidence":0.8,
                    "camera_id": camera_id,
                    "track_id": t['track_id'],
                    "area_id": z['name'] if z else None,
                    "zone_id": zid,
                    "bounding_boxes": [list(t['bbox'])],  # Ensure list format
                    "duration": duration,
                    "meta": {"stationary_since": t['stationary_since'], "frame_idx": frame_idx}
                })

    # unattended objects per zone
    bag_classes = set(["backpack","handbag","suitcase"])
    bags = [d for d in detections if d['cls'] in bag_classes]
    for b in bags:
        bx1,by1,bx2,by2 = b['box']
        bcx = (bx1+bx2)//2
        bcy = (by1+by2)//2
        z = find_zone_for_centroid(bcx, bcy, zones)
        zid = z['zone_id'] if z else None
        near_person = False
        for p in [tr for tr in tracks if tr['cls']=='person']:
            cx,cy = p['centroid']
            if euclid((cx,cy),(bcx,bcy)) < 80:
                near_person = True
                break
        if not near_person:
            if not _in_cooldown(camera_id, zid, "unattended_object"):
                events.append({
                    "event_type":"unattended_object",
                    "severity":"high",
                    "confidence":0.85,
                    "camera_id": camera_id,
                    "area_id": z['name'] if z else None,
                    "zone_id": zid,
                    "bounding_boxes": [list(b['box'])],  # Ensure list format
                    "meta": {"reason":"no-person-nearby", "frame_idx": frame_idx}
                })

    return events
