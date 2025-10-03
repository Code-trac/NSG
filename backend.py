# backend.py
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List
import csv, os, shutil, uuid
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

CSV_PATH = "history.csv"
OVERRIDES_PATH = "overrides.csv"
UPLOAD_DIR = "videos"
os.makedirs("snapshots", exist_ok=True)
os.makedirs("clips", exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="NSG Video Analysis - Alerts API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for serving snapshots and clips
app.mount("/snapshots", StaticFiles(directory="snapshots"), name="snapshots")
app.mount("/clips", StaticFiles(directory="clips"), name="clips")

class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float

class OverrideCreate(BaseModel):
    alert_id: str
    action: str
    operator: Optional[str] = "system"
    notes: Optional[str] = ""

class AlertCreate(BaseModel):
    alert_id: str
    camera_id: str
    source_type: Optional[str] = "video_file"
    timestamp: str
    event_type: str
    severity: Optional[str] = "medium"
    confidence: Optional[float] = 0.0
    track_id: Optional[str] = None
    bounding_boxes: Optional[List[List[float]]] = []  # Changed to accept [x1,y1,x2,y2] format
    area_id: Optional[str] = None
    zone_id: Optional[str] = None
    duration: Optional[float] = None
    snapshot_path: Optional[str] = None
    clip_path: Optional[str] = None
    meta: Optional[dict] = {}
    recommended_action: Optional[str] = None
    escalation_required: Optional[bool] = False
    alert_id: str
    camera_id: str
    source_type: Optional[str] = "video_file"
    timestamp: str
    event_type: str
    severity: Optional[str] = "medium"
    confidence: Optional[float] = 0.0
    track_id: Optional[str] = None
    bounding_boxes: Optional[List[BoundingBox]] = []
    area_id: Optional[str] = None
    zone_id: Optional[str] = None
    duration: Optional[float] = None
    snapshot_path: Optional[str] = None
    clip_path: Optional[str] = None
    meta: Optional[dict] = {}
    recommended_action: Optional[str] = None
    escalation_required: Optional[bool] = False

def init_csv():
    if not os.path.exists(CSV_PATH):
        with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "alert_id","camera_id","timestamp","event_type","severity",
                "confidence","track_id","area_id","zone_id","snapshot_path",
                "clip_path","meta","escalation_required","recommended_action"
            ])
    if not os.path.exists(OVERRIDES_PATH):
        with open(OVERRIDES_PATH, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["override_id","alert_id","operator","timestamp","action","notes"])

init_csv()

@app.post("/alerts", status_code=201)
def create_alert(alert: AlertCreate):
    try:
        # Validate required fields
        if not alert.alert_id or not alert.camera_id or not alert.event_type:
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        # Serialize bounding boxes and meta
        import json
        bboxes_str = json.dumps(alert.bounding_boxes) if alert.bounding_boxes else "[]"
        meta_str = json.dumps(alert.meta) if alert.meta else "{}"
        
        with open(CSV_PATH, "a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                alert.alert_id,
                alert.camera_id,
                alert.timestamp,
                alert.event_type,
                alert.severity or "medium",
                alert.confidence or 0.0,
                alert.track_id or "",
                alert.area_id or "",
                alert.zone_id or "",
                alert.snapshot_path or "",
                alert.clip_path or "",
                meta_str,
                alert.escalation_required or False,
                alert.recommended_action or ""
            ])
        return {"status":"ok","message":"alert stored","alert_id": alert.alert_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error storing alert: {str(e)}")

@app.get("/alerts")
def get_alerts(limit: int = 100, offset: int = 0):
    try:
        out = []
        if not os.path.exists(CSV_PATH):
            return {"alerts": out, "total": 0}
        
        with open(CSV_PATH, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            all_rows = list(reader)
            
        # Apply pagination
        total = len(all_rows)
        paginated_rows = all_rows[offset:offset + limit] if offset < total else []
        
        # Convert string values back to appropriate types
        for row in paginated_rows:
            # Parse meta field back to dict
            try:
                import json
                row['meta'] = json.loads(row['meta']) if row['meta'] else {}
            except:
                row['meta'] = {}
            
            # Convert numeric fields
            try:
                row['confidence'] = float(row['confidence']) if row['confidence'] else 0.0
                row['duration'] = float(row['duration']) if row['duration'] else None
                row['escalation_required'] = row['escalation_required'].lower() == 'true'
            except:
                pass
            
            out.append(row)
        
        return {"alerts": out, "total": total, "limit": limit, "offset": offset}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading alerts: {str(e)}")

@app.post("/override", status_code=201)
def create_override(override: OverrideCreate):
    try:
        override_id = f"OVR-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"
        with open(OVERRIDES_PATH, "a", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([
                override_id,
                override.alert_id,
                override.operator,
                datetime.utcnow().isoformat(),
                override.action,
                override.notes
            ])
        return {"status":"ok","message":"override logged", "override_id": override_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-video", status_code=201)
async def upload_video(file: UploadFile = File(...)):
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Validate file type
        allowed_extensions = {'.mp4', '.avi', '.mov', '.mkv', '.wmv'}
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in allowed_extensions:
            raise HTTPException(status_code=400, detail=f"File type {file_extension} not supported")
        
        # Generate unique filename
        file_id = uuid.uuid4().hex[:8]
        safe_filename = f"{file_id}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "status": "ok",
            "message": "Video uploaded successfully",
            "file_id": file_id,
            "filename": safe_filename,
            "path": file_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {
        "status": "ok",
        "uptime": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "alerts_count": get_alerts_count(),
        "directories": {
            "snapshots": os.path.exists("snapshots"),
            "clips": os.path.exists("clips"),
            "videos": os.path.exists("videos")
        }
    }

@app.get("/stats")
def get_stats():
    """Get system statistics"""
    try:
        total_alerts = get_alerts_count()
        recent_alerts = get_alerts(limit=10)["alerts"]
        
        # Count by event type
        event_types = {}
        severity_counts = {}
        
        if os.path.exists(CSV_PATH):
            with open(CSV_PATH, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    event_type = row.get("event_type", "unknown")
                    severity = row.get("severity", "unknown")
                    event_types[event_type] = event_types.get(event_type, 0) + 1
                    severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        return {
            "total_alerts": total_alerts,
            "recent_alerts": len(recent_alerts),
            "event_types": event_types,
            "severity_distribution": severity_counts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting stats: {str(e)}")

def get_alerts_count():
    """Helper function to count total alerts"""
    if not os.path.exists(CSV_PATH):
        return 0
    try:
        with open(CSV_PATH, "r", encoding="utf-8") as f:
            return sum(1 for line in f) - 1  # Subtract header row
    except:
        return 0

@app.get("/")
def read_root():
    return {"message": "NSG Video Analysis API", "docs": "/docs"}
