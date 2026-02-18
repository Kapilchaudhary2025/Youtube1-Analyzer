import time
import datetime
import os
import sys

# Add current directory to path to ensure we can import main
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import database

def run_worker():
    print(f"[{datetime.datetime.now()}] Starting YouTube Trend Intelligence Worker...")
    print("Bot will run every 30 minutes.")
    
    # Initialize DB (ensure settings table exists)
    database.init_db()
    
    while True:
        try:
            if not database.is_bot_active():
                print(f"[{datetime.datetime.now()}] Bot is PAUSED. Skipping cycle.")
            else:
                print(f"\n[{datetime.datetime.now()}] >>> Starting Cycle <<<")
                main.main()
                print(f"[{datetime.datetime.now()}] >>> Cycle Finished <<<")
        except Exception as e:
            print(f"[{datetime.datetime.now()}] CRITICAL ERROR in worker loop: {e}")
            # Don't crash the worker, just wait and retry
        
        print(f"Sleeping for 30 minutes...")
        # Flushes stdout to ensure logs appear in Railway immediately
        sys.stdout.flush() 
        time.sleep(1800) # 30 minutes

if __name__ == "__main__":
    run_worker()
