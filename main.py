# main.py
import cv2, time, os, json
from detection import detect_objects
from decision import analyze_frame
from utils import gen_alert_id, save_snapshot, save_clip_from_buffer, send_alert_to_backend
from collections import deque

VIDEO_PATH = "videos/sample1.mp4"  # change as needed
CAMERA_ID = "CAM-SAMPLE1"
PREBUFFER_SECONDS = 4
POSTBUFFER_SECONDS = 2
ZONES_JSON = "zones.json"

def load_zones(zfile):
    if not os.path.exists(zfile):
        print("Zone file not found:", zfile)
        return []
    with open(zfile, "r") as f:
        zones = json.load(f)
    for z in zones:
        for k in ("x1","y1","x2","y2"):
            z[k] = int(z[k])
    return zones

def draw_zones(frame, zones):
    for z in zones:
        x1,y1,x2,y2 = z['x1'], z['y1'], z['x2'], z['y2']
        cv2.rectangle(frame, (x1,y1), (x2,y2), (255, 200, 0), 2)
        cv2.putText(frame, f"{z['zone_id']}:{z.get('name','')}", (x1+5, y1+15),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,200,0), 1)

def run_video(video_path=VIDEO_PATH, camera_id=CAMERA_ID):
    zones = load_zones(ZONES_JSON)
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Cannot open video:", video_path)
        return
    fps = cap.get(cv2.CAP_PROP_FPS) or 20
    buf_len = int((PREBUFFER_SECONDS + POSTBUFFER_SECONDS) * fps)
    frame_buffer = deque(maxlen=buf_len)

    frame_idx = 0
    post_event_frames_remaining = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame_idx += 1
        frame_buffer.append(frame.copy())

        # detection with fallback
        try:
            detections = detect_objects(frame)
            fallback = False
        except Exception as e:
            print("Detection error, using fallback motion:", e)
            fallback = True
            detections = []
            if len(frame_buffer) >= 2:
                f1 = frame_buffer[-2]
                f2 = frame_buffer[-1]
                gray1 = cv2.cvtColor(f1, cv2.COLOR_BGR2GRAY)
                gray2 = cv2.cvtColor(f2, cv2.COLOR_BGR2GRAY)
                diff = cv2.absdiff(gray1, gray2)
                _, th = cv2.threshold(diff, 30, 255, cv2.THRESH_BINARY)
                cnts, _ = cv2.findContours(th, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                for c in cnts:
                    x,y,w,h = cv2.boundingRect(c)
                    if w*h > 500:
                        detections.append({"box":[x,y,x+w,y+h],"conf":0.5,"cls":"motion"})

        # get events with zones context
        events = analyze_frame(detections, camera_id=camera_id, zones=zones, frame=frame, frame_idx=frame_idx, fps=fps)

        if events:
            for ev in events:
                alert_id = gen_alert_id()
                ev['alert_id'] = alert_id
                ev['timestamp'] = time.strftime("%Y-%m-%dT%H:%M:%S%z")
                snap_frame = frame.copy()
                for bbox in ev.get('bounding_boxes', []):
                    if len(bbox) == 4:
                        x1,y1,x2,y2 = bbox
                        cv2.rectangle(snap_frame, (int(x1),int(y1)), (int(x2),int(y2)), (0,0,255), 2)
                if ev.get('zone_id'):
                    z = next((zz for zz in zones if zz['zone_id']==ev['zone_id']), None)
                    if z:
                        cv2.rectangle(snap_frame, (z['x1'], z['y1']), (z['x2'], z['y2']), (0,128,255), 2)
                        cv2.putText(snap_frame, f"Zone:{z['zone_id']}", (z['x1']+5, z['y1']+30),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,128,255), 2)

                snap_path = save_snapshot(snap_frame, alert_id)
                ev['snapshot_path'] = snap_path
                clip_path = save_clip_from_buffer(frame_buffer, fps, alert_id)
                ev['clip_path'] = clip_path
                ev['meta'] = ev.get('meta', {})
                ev['meta']['fallback'] = fallback
                send_alert_to_backend(ev)

        # draw detections + zones for debug
        for d in detections:
            x1,y1,x2,y2 = map(int, d['box'])
            cv2.rectangle(frame, (x1,y1), (x2,y2), (0,255,0), 1)
            cv2.putText(frame, f"{d['cls']}:{d['conf']:.2f}", (x1, max(10,y1-5)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,255,0), 1)

        draw_zones(frame, zones)

        cv2.imshow("NSG Prototype (zoned)", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("Processing complete.")

if __name__ == "__main__":
    run_video()
