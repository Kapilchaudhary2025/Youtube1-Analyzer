# Deployment & GitHub Guide

## 1. How to Use & Activate "The Bot"

This system is a Python script (`main.py`) that runs one "cycle" of analysis. To make it a "bot" that monitors continuously, you need to schedule it to run automatically.

### Option A: Run Locally (Windows) - Easiest

Since you are on Windows, the best way to "activate" it is using **Windows Task Scheduler**.

1. Open **Task Scheduler** (Search in Start Menu).
2. Click **Create Task** on the right.
3. **General** Tab: Name it "YouTubeTrendBot". Check "Run with highest privileges".
4. **Triggers** Tab: Click New -> Begin the task: "On a schedule" -> Daily.
   - Advanced settings: Repeat task every: **30 minutes**.
   - Duration: **Indefinitely**.
5. **Actions** Tab: Click New -> Action: "Start a program".
   - Program/script: Browse to your python executable (e.g., `C:\Users\hp\AppData\Local\Programs\Python\Python39\python.exe` or type `python` if added to PATH).
   - Add arguments: `main.py`
   - Start in: `C:\Users\hp\OneDrive\Desktop\class\Youtube analyzer\YT_Trend_Intelligence` (CRITICAL: The folder where the script is).
6. Click OK.

**Status:** The bot is now "Active". It will run every 30 mins in the background as long as your PC is on.

### Option B: Cloud Deployment (24/7)

If you want it to run when your PC is off, use a cloud provider. **PythonAnywhere** is a good beginner-friendly option.

1. Sign up for PythonAnywhere.
2. Upload your files (`main.py`, `requirements.txt`, etc.).
3. Run `pip install -r requirements.txt` in their bash console.
4. Set up a "Scheduled Task" in their dashboard to run `python main.py` daily/hourly.

---

## 2. Connect to GitHub

To share this project or "connect" it to GitHub, follow these standard Git commands.

### Prerequisites

- Install **Git** for Windows (https://git-scm.com/download/win).
- Create a new **Empty Repository** on GitHub (do not add README/gitignore yet).

### Initialization Steps

Open your terminal (PowerShell/Command Prompt) in the project folder:
`C:\Users\hp\OneDrive\Desktop\class\Youtube analyzer\YT_Trend_Intelligence`

Run these commands one by one:

1. **Initialize Git:**

   ```powershell
   git init
   ```

2. **Add Files:**

   ```powershell
   git add .
   ```

3. **Commit (Save) Changes:**

   ```powershell
   git commit -m "Initial commit of YT Trend Intelligence System"
   ```

4. **Link to GitHub:**
   (Replace `YOUR_GITHUB_URL` with the URL of the repo you created, e.g., `https://github.com/username/repo.git`)

   ```powershell
   git remote add origin YOUR_GITHUB_URL
   ```

5. **Push to GitHub:**
   ```powershell
   git branch -M main
   git push -u origin main
   ```

### Important Security Note

**NEVER push your `.env` file to GitHub.**

- I have already included logic to load keys from `.env`.
- Create a `.gitignore` file (I will create this for you now) to ensure `.env` is ignored by Git, so your API keys remain private.

---

## 3. Deploy on Railway (Free/Paid)

Railway is cleaner and easier than PythonAnywhere for 24/7 background workers.

### Step 1: Prepare GitHub

**Ensure you have pushed your latest code to GitHub** (follow Section 2 above).
Make sure `worker.py` is included in your push (I just created it).

### Step 2: Create Project on Railway

1. Go to [Railway.app](https://railway.app/) and login/signup.
2. Click **+ New Project** -> **Deploy from GitHub repo**.
3. Select your repository (`YT_Trend_Intelligence` or whatever you named it).
4. Click **Deploy Now**.

### Step 3: Configure Environment Variables

The build might fail or the bot won't work yet because it needs your keys (which we kept out of GitHub).

1. Go to your project dashboard in Railway.
2. Click on the **Variables** tab.
3. Add the following variables (copy values from your local `.env` file):
   - `YOUTUBE_API_KEY`
   - `GEMINI_API_KEY`
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
   - `REGION_CODE` (Value: `IN`)
   - `DB_NAME` (Value: `trends.db`)

### Step 4: Set Start Command

Railway tries to guess how to run your app, but we want the continuous worker.

1. Go to the **Settings** tab.
2. Scroll down to **Deploy** > **Start Command**.
3. Enter:
   ```bash
   python worker.py
   ```
4. Railway will automatically restart the deployment.

### Step 5: Verify

1. Go to the **Logs** tab.
2. You should see "Starting YouTube Trend Intelligence Worker..." and the logs of it fetching videos.
3. Since `worker.py` runs forever (sleeping 30 mins between runs), Railway will keep it alive 24/7.

**Note on Database:**
Railway file systems are ephemeral (reset on redeploy). SQLite (`trends.db`) works fine for temporary memory, but if you redeploy, it forgets which videos it sent.

- **Fix:** For a production bot, we'd usually use a Postgres plugin (available in Railway).
- **For now:** It's acceptable; the worst case is it might resend a couple of emails after a deployment, but duplicate checks within the cycle still work.
