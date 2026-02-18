# Autonomous Real-Time YouTube Trend Intelligence System

## Overview

This system continuously monitors YouTube for viral trends in India using the YouTube Data API. It analyzes engagement metrics and uses Gemini Pro AI to provide insights into why a video is trending. It then sends a structured HTML email report.

## Setup

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
2. **Configuration:**
   - Ensure the `.env` file is present in the project root with the following keys:
     - `YOUTUBE_API_KEY`
     - `GEMINI_API_KEY`
     - `EMAIL_USER`
     - `EMAIL_PASSWORD`
     - `REGION_CODE` (Default: IN)

## Usage

### One-Click Start (Recommended)

Double-click **`start_app.bat`** to launch both the Backend and Frontend.

- **Frontend UI**: http://localhost:5173
- **Backend API**: http://localhost:8000

### Manual Run

**1. Backend (API & Worker)**

```bash
# Start API
uvicorn api:app --reload

# Start Background Worker
python worker.py
```

**2. Frontend (UI)**

```bash
cd frontend
npm run dev
```

### Automation (Windows Task Scheduler)

To run the analysis bot (without UI) in the background:

1. Open **Task Scheduler**.
2. Create a new task "YouTubeTrendBot".
3. **Trigger**: "On a schedule", Daily, repeat every 30 minutes.
4. **Action**: "Start a program".
   - Program/script: `path\to\python.exe`
   - Add arguments: `worker.py`
   - Start in: `C:\Users\hp\OneDrive\Desktop\class\Youtube analyzer\YT_Trend_Intelligence`

## Features

- **Modern UI**: React + Tailwind dashboard for real-time visualization.
- **Live Data**: Fetches real-time trending videos.
- **AI Analysis**: Uses Gemini Pro to explain viral factors.
- **Smart Metrics**: Calculates Engagement Score and Viral Probability.
- **Email Reports**: Beautiful HTML emails with "Exploding" and "Fast Rising" badges.
- **Duplicate Prevention**: Tracks sent videos in SQLite (`trends.db`) to avoid spam.

## Troubleshooting

- **Email not sending**: Ensure "Less secure app access" or App Passwords are configured for the Gmail account.
- **API Errors**: Check quota limits for YouTube/Gemini APIs in Google Cloud Console.
