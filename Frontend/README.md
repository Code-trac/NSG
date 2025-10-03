# AI Surveillance Dashboard (Frontend)

Dark-themed AI-powered surveillance dashboard built with Vite + React 18 + Tailwind CSS.

## Tech Stack
- React 18 + Vite
- Tailwind CSS
- SWR for polling/caching
- React Router for sections
- Plain fetch (no axios)

## Environment
Backend base URL is read from:
- `VITE_BACKEND` (preferred for Vite)
- `REACT_APP_BACKEND` (for compatibility)
- Defaults to `http://localhost:8000`

Example (Vite):
- Create a `.env.local` with: `VITE_BACKEND=http://localhost:8000`

## Scripts
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview production build

## Features
- Upload Video (POST /upload-video) with preview
- Alerts List (GET /alerts?limit=100), polls every 3s
- Alert Modal: snapshot, video clip, JSON metadata, Accept/Reject → POST /override
- Zone Summary: per-zone counts, click to filter alerts
- System Health: GET /health (every 5s), with offline banner and auto fallback to demo data
- Stats Sidebar: Active cameras (unique camera_id), Alerts Today, Storage Used (mock)
- Demo Mode toggle (top right): load data entirely from local mock JSON
- Mock-only modules: Face Recognition, License Plates, Audio Events, Watchlist
- Filters persisted in localStorage; Demo mode persisted as well
- Accessible modal (Escape to close), mobile responsive, collapsible sidebar
- Toast notifications for override actions

## File Structure
\`\`\`
src/
  api.js
  index.css
  App.jsx
  main.jsx
  state/AppContext.jsx
  hooks/useAlertsData.js
  components/
    Sidebar.jsx
    Topbar.jsx
    UploadVideo.jsx
    AlertsList.jsx
    AlertModal.jsx
    ZoneSummary.jsx
  pages/
    Dashboard.jsx
    FaceRecognition.jsx
    LicensePlates.jsx
    AudioEvents.jsx
    Watchlist.jsx
  mock/
    mock_alerts.json
    mock_faces.json
    mock_plates.json
    mock_audio.json
    mock_watchlist.json
\`\`\`

## Backend Contract
Each alert:
\`\`\`json
{
  "alert_id": "ALERT-202509300001",
  "camera_id": "CAM-SAMPLE1",
  "timestamp": "2025-09-30T07:05:12+05:30",
  "event_type": "loitering",
  "severity": "medium",
  "confidence": 0.82,
  "track_id": "T12",
  "area_id": "Entrance",
  "zone_id": "Z1",
  "bounding_boxes": [[10,10,120,120]],
  "snapshot_path": "snapshots/ALERT-202509300001.jpg",
  "clip_path": "clips/ALERT-202509300001.mp4",
  "meta": {"frame_idx": 1234, "fallback": false}
}
\`\`\`

## Notes
- Backend media URLs are built as `{BASE}/{snapshot_path}` or `{BASE}/{clip_path}`.
- When backend is offline, the app shows a banner and uses `mock_alerts.json`.
- Where mock data is used vs. backend:
  - Backend: `/alerts`, `/health`, `/override`, `/upload-video`
  - Mock: faces, plates, audio, watchlist, and alerts when Demo Mode is enabled or backend is offline
