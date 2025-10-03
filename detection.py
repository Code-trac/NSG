# detection.py
from ultralytics import YOLO
import numpy as np
import cv2
import os

MODEL_PATH = "yolov8n.pt"  # small model for speed

if not os.path.exists(MODEL_PATH):
    print("yolov8n.pt not found locally; Ultralytics may download weights at first run.")

model = YOLO(MODEL_PATH)

def detect_objects(frame, imgsz=640):
    """
    Run YOLO inference on a frame.
    Returns list of detections: [{'box':[x1,y1,x2,y2], 'conf':0.9, 'cls': 'person'}...]
    """
    results = model(frame, imgsz=imgsz, verbose=False)
    res = results[0]
    detections = []
    if hasattr(res, "boxes") and res.boxes is not None:
        for b in res.boxes:
            xyxy = b.xyxy[0].cpu().numpy()
            conf = float(b.conf[0].cpu().numpy())
            cls_index = int(b.cls[0].cpu().numpy())
            cls_name = model.names.get(cls_index, str(cls_index))
            detections.append({
                "box": [int(xyxy[0]), int(xyxy[1]), int(xyxy[2]), int(xyxy[3])],
                "conf": conf,
                "cls": cls_name
            })
    return detections
