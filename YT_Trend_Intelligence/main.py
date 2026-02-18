import time
import os
import datetime
from dotenv import load_dotenv

# Import modules
import database
import youtube_client
import category_engine
import metrics_engine
import ai_analyzer
import email_sender

load_dotenv()

def main():
    print(f"[{datetime.datetime.now()}] Starting Trend Intelligence System...")
    
    # 1. Initialize Database
    database.init_db()
    
    # 2. Fetch Live Data
    print("Fetching trending videos...")
    raw_videos = youtube_client.fetch_trending_videos(region_code=os.getenv("REGION_CODE", "IN"))
    print(f"Fetched {len(raw_videos)} videos.")
    
    analyzed_count = 0
    categories = {
        "Gaming": [],
        "Technology": [],
        "News & Politics": [],
        "Entertainment": [],
        "Education": [],
        "Finance": [],
        "Shorts": [] # Separate container
    }
    
    # 3. Process Videos
    processed_videos = []
    
    for video in raw_videos:
        vid_id = video['video_id']
        
        # Categorize (Must be done before saving)
        category = category_engine.categorize_video(video)
        video['category'] = category

        # Calculate Metrics
        video = metrics_engine.analyze_video_metrics(video)
        
        # SAVE TO DB IMMEDIATELY (Update stats for UI)
        database.save_video(video)
        
        # Check if already sent for EMAIL purpose only
        if database.is_video_sent(vid_id):
            processed_videos.append(video) # Track it but don't re-email
            continue

        # Add to list for ranking (candidates for email)
        if category in categories:
            categories[category].append(video)
        else:
            categories["Entertainment"].append(video) # Default
            
        processed_videos.append(video)
        analyzed_count += 1

    print(f"New videos to analyze: {analyzed_count}")
    
    # 4. Rank and Select (Top 5 per category)
    final_selection = {}
    videos_to_email = []
    
    for cat, vids in categories.items():
        if not vids: continue
        
        # Sort by Engagement Score Descending
        sorted_vids = sorted(vids, key=lambda x: x['engagement_score'], reverse=True)
        
        # Select Top 5
        top_vids = sorted_vids[:5]
        final_selection[cat] = top_vids
        videos_to_email.extend(top_vids)

    # 5. AI Analysis (Only for selected videos)
    print(f"Running AI Analysis on {len(videos_to_email)} videos...")
    for video in videos_to_email:
        print(f"Analyzing: {video['title'][:30]}...")
        ai_data = ai_analyzer.analyze_video_ai(video)
        video['ai_analysis'] = ai_data
        
        # Update metrics with AI viral score if available? 
        # For now, keep as is or average it.
        # The prompt says: "Viral Probability Score (0-100) based on... AI analysis"
        # We calculated a heuristic one in metrics_engine. 
        # Let's trust the AI one more if valid? Or display both?
        # The prompt says: "Viral Probability Score (0-100 numeric)" in AI output.
        # Let's update the video object's viral score to be the AI one for the report.
        if isinstance(ai_data.get('viral_score'), (int, float)):
             # weighted average? 
             # Let's take max of heuristic and AI
             video['viral_probability'] = max(video['viral_probability'], ai_data['viral_score'])

    # 6. Generate & Send Email
    if videos_to_email:
        print("Generating email report...")
        html_body = email_sender.generate_viral_email_html(final_selection, analyzed_count)
        
        recipient = os.getenv("EMAIL_USER") # Sending to self as per prompt instructions imply owner
        # Wait, prompt says "gmail for sending notification = kapilchaud2234@gmail.com"
        # It doesn't specify a different recipient. Assuming sending to self.
        
        subject = f"🔥 Viral Trend Alert - {datetime.datetime.now().strftime('%H:%M %p')}"
        if email_sender.send_email(subject, html_body, recipient):
            # 7. Mark as sent
            print("Marking videos as sent...")
            for video in videos_to_email:
                database.save_video(video) # Update DB with metrics
                database.mark_video_as_sent(video['video_id'])
    else:
        print("No new significant trends to report.")
        # Optional: Send "No trends" email if configured, prompt says "If no major spike detected: Send summary email"
        # So we should send it.
        html_body = email_sender.generate_viral_email_html({}, analyzed_count)
        email_sender.send_email("Viral Trend Update - No Spikes", html_body, os.getenv("EMAIL_USER"))

    print("Cycle Completed.")

if __name__ == "__main__":
    main()
