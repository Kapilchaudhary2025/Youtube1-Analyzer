@echo off
setlocal
echo Starting YouTube Trend Intelligence System...
echo.

:: Change directory to the script's location
pushd "%~dp0"

echo Current Directory: %CD%

:: Start Backend
echo Starting Backend...
start "TrendIntel Backend" cmd /k "python -m uvicorn api:app --reload --host 0.0.0.0 --port 8000"

:: Start Frontend
echo Starting Frontend...
cd frontend
start "TrendIntel Frontend" cmd /k "npm run dev"

echo System started!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
pause
