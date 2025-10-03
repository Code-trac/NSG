# utils.py
import cv2, os, uuid, requests
from collections import deque
from datetime import datetime

SNAP_DIR = "snapshots"
CLIP_DIR = "clips"
os.makedirs(SNAP_DIR, exist_ok=True)
os.makedirs(CLIP_DIR, exist_ok=True)

def gen_alert_id(prefix="ALERT"):
    return f"{prefix}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"

def save_snapshot(frame, alert_id):
    path = os.path.join(SNAP_DIR, f"{alert_id}.jpg")
    cv2.imwrite(path, frame)
    return path

def save_clip_from_buffer(frame_buffer, fps, alert_id, output_fps=None):
    frames = list(frame_buffer)
    if len(frames) == 0:
        return None
    h, w = frames[0].shape[:2]
    out_path = os.path.join(CLIP_DIR, f"{alert_id}.mp4")
    if output_fps is None:
        output_fps = int(fps or 20)
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(out_path, fourcc, output_fps, (w,h))
    for f in frames:
        writer.write(f)
    writer.release()
    return out_path

def send_alert_to_backend(payload, backend_url="http://localhost:8000/alerts", timeout=3):
    try:
        r = requests.post(backend_url, json=payload, timeout=timeout)
        if r.status_code in (200,201):
            print("Alert sent:", payload.get("event_type"), payload.get("alert_id"))
            return True
        else:
            print("Alert failed:", r.status_code, r.text)
            return False
    except Exception as e:
        print("Alert send exception:", e)
        return False
