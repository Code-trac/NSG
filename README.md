# NSG Video Analysis System - Complete Setup Guide

## 🚀 Quick Start

### 1. Backend Setup
```bash
# Navigate to project root
cd "c:\Users\Satyam\Documents\SIH Project"

# Install Python dependencies
pip install -r requirements.txt

# Start backend server
python -m uvicorn backend:app --reload --port 8000
```

### 2. Frontend Setup
```bash
# Navigate to frontend folder
cd "c:\Users\Satyam\Documents\SIH Project\Frontend"

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

## 🌐 Access Points

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## ✅ What's Fixed

### Backend Issues Resolved:
- ✅ Fixed bounding box format mismatch ([x1,y1,x2,y2])
- ✅ Added missing /upload-video endpoint
- ✅ Added static file serving for snapshots/clips
- ✅ Improved error handling and validation
- ✅ Added pagination support for alerts
- ✅ Added system statistics endpoint
- ✅ Fixed CSV encoding issues
- ✅ Added proper CORS configuration

### Frontend Issues Resolved:
- ✅ Removed all Next.js conflicts
- ✅ Fixed package.json for Vite
- ✅ Removed "use client" directives
- ✅ Added proper React dependencies
- ✅ Fixed API integration
- ✅ Added environment configuration
- ✅ Updated Vite configuration

## 📁 Directory Structure
```
c:\Users\Satyam\Documents\SIH Project\
├── backend.py          # FastAPI backend server
├── main.py            # Video processing main script
├── detection.py       # YOLO object detection
├── decision.py        # Event analysis logic
├── utils.py           # Utility functions
├── requirements.txt   # Python dependencies
├── zones.json         # Zone configurations
├── start-backend.bat  # Backend startup script
├── start-frontend.bat # Frontend startup script
├── snapshots/         # Generated alert snapshots
├── clips/             # Generated video clips
├── videos/            # Uploaded video files
└── Frontend/          # React frontend application
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── .env
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js
        ├── components/
        ├── pages/
        ├── hooks/
        └── state/
```

## 🔧 Environment Variables

### Frontend (.env)
```
VITE_BACKEND=http://localhost:8000
```

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | System health check |
| GET | `/stats` | System statistics |
| GET | `/alerts` | Fetch alerts (paginated) |
| POST | `/alerts` | Create new alert |
| POST | `/override` | Create alert override |
| POST | `/upload-video` | Upload video file |
| GET | `/snapshots/{file}` | Serve snapshot images |
| GET | `/clips/{file}` | Serve video clips |

## 🐛 Troubleshooting

### Backend Issues:
1. **ModuleNotFoundError**: Run `pip install -r requirements.txt`
2. **Port 8000 in use**: Change port in startup command
3. **YOLO model not found**: First run will download yolov8n.pt automatically

### Frontend Issues:
1. **npm install fails**: Delete `node_modules` and `package-lock.json`, then retry
2. **Port 5173 in use**: Vite will automatically use next available port
3. **API connection fails**: Ensure backend is running on port 8000

## 📊 Features

### Backend Features:
- FastAPI with automatic API documentation
- Real-time video analysis with YOLO
- Zone-based event detection
- Alert management with overrides
- File upload and static serving
- Comprehensive error handling

### Frontend Features:
- Real-time alert dashboard
- Interactive zone summary
- Video upload interface
- Alert filtering and search
- Responsive design with dark theme
- Offline/demo mode support

## 🔄 Development Workflow

1. Start backend: `python -m uvicorn backend:app --reload --port 8000`
2. Start frontend: `npm run dev`
3. Make changes to code
4. Backend auto-reloads on Python file changes
5. Frontend auto-reloads on React file changes
6. Check logs in respective terminals for any issues

## 🎯 Ready to Run!

Your application is now fully configured and ready to run. Both backend and frontend have been optimized for smooth operation.