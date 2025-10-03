@echo off
echo Installing/Updating backend dependencies...
cd /d "c:\Users\Satyam\Documents\SIH Project"
pip install -r requirements.txt

echo.
echo Starting NSG Video Analysis Backend...
echo Backend will be available at: http://localhost:8000
echo API Documentation at: http://localhost:8000/docs
echo.

python -m uvicorn backend:app --reload --port 8000 --host 0.0.0.0