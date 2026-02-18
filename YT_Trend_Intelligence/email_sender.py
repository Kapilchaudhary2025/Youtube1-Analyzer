import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import datetime
from dotenv import load_dotenv

load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

def generate_viral_email_html(categories_data, total_videos):
    """
    Generates structured HTML email for viral trends.
    """
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #121212; color: #ffffff; padding: 20px; }}
            .container {{ max-width: 800px; margin: 0 auto; background-color: #1e1e1e; border-radius: 10px; overflow: hidden; }}
            .header {{ background-color: #ff0000; padding: 20px; text-align: center; }}
            .header h1 {{ margin: 0; color: white; }}
            .stats {{ background-color: #2d2d2d; padding: 10px; text-align: center; font-size: 0.9em; }}
            .category-section {{ padding: 20px; border-bottom: 1px solid #333; }}
            .category-title {{ color: #ff4d4d; border-bottom: 2px solid #ff4d4d; padding-bottom: 5px; margin-bottom: 15px; }}
            .video-card {{ background-color: #252525; margin-bottom: 15px; padding: 15px; border-radius: 8px; display: flex; gap: 15px; }}
            .thumbnail {{ flex: 0 0 160px; }}
            .thumbnail img {{ width: 100%; border-radius: 5px; }}
            .content {{ flex: 1; }}
            .video-title {{ margin: 0 0 5px 0; font-size: 1.1em; color: #4dabf7; text-decoration: none; display: block; }}
            .channel {{ color: #aaa; font-size: 0.85em; margin-bottom: 8px; }}
            .metrics {{ display: flex; gap: 15px; font-size: 0.85em; color: #ccc; margin-bottom: 10px; }}
            .badge {{ padding: 3px 8px; border-radius: 4px; font-size: 0.75em; font-weight: bold; }}
            .badge-exploding {{ background-color: #e03131; color: white; }}
            .badge-rising {{ background-color: #f08c00; color: white; }}
            .badge-steady {{ background-color: #2f9e44; color: white; }}
            .badge-short {{ background-color: #1098ad; color: white; }}
            .badge-news {{ background-color: #5c7cfa; color: white; }}
            .badge-gaming {{ background-color: #be4bdb; color: white; }}
            .ai-insight {{ background-color: #333; padding: 10px; border-radius: 5px; font-size: 0.9em; border-left: 3px solid #ffd43b; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 0.8em; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 YouTube Viral Pulse</h1>
            </div>
            <div class="stats">
                Region: IN | Videos Analyzed: {total_videos} | Time: {timestamp}
            </div>
    """
    
    if not categories_data:
        html += """
        <div style="padding: 40px; text-align: center; color: #888;">
            <h3>No significant viral spikes detected in this cycle.</h3>
            <p>Monitoring continues...</p>
        </div>
        """
    else:
        for category, videos in categories_data.items():
            if not videos: continue
            
            html += f"""
            <div class="category-section">
                <h2 class="category-title">{category}</h2>
            """
            
            for idx, video in enumerate(videos):
                # Badge Logic
                trend_type = video.get('trend_type', 'Regular')
                badge_class = 'badge-steady'
                if 'Exploding' in trend_type: badge_class = 'badge-exploding'
                elif 'Fast' in trend_type: badge_class = 'badge-rising'
                elif 'Short' in trend_type: badge_class = 'badge-short'
                elif 'Gaming' in trend_type: badge_class = 'badge-gaming'
                elif 'News' in trend_type: badge_class = 'badge-news'
                
                # AI Insights
                ai_data = video.get('ai_analysis', {})
                why_trending = ai_data.get('why_trending', 'N/A')
                viral_score = ai_data.get('viral_score', 0)
                
                leader_tag = '<span style="color:#ffd43b;">👑 Category Leader</span><br>' if idx == 0 else ''
                
                html += f"""
                <div class="video-card">
                    <div class="thumbnail">
                        <a href="https://youtu.be/{video['video_id']}">
                            <img src="{video['thumbnail_url']}" alt="Thumbnail">
                        </a>
                    </div>
                    <div class="content">
                        {leader_tag}
                        <a href="https://youtu.be/{video['video_id']}" class="video-title">{video['title']}</a>
                        <div class="channel">{video['channel_title']}</div>
                        
                        <div class="metrics">
                            <span>👀 {video['view_count']:,}</span>
                            <span>👍 {video['like_count']:,}</span>
                            <span>💬 {video['comment_count']:,}</span>
                            <span>⚡ Score: {int(video.get('engagement_score', 0))}</span>
                        </div>
                        
                        <div style="margin-bottom: 8px;">
                            <span class="badge {badge_class}">{trend_type}</span>
                            <span class="badge" style="background-color: #444;">Viral Prob: {viral_score}%</span>
                        </div>
                        
                        <div class="ai-insight">
                            <strong>AI Insight:</strong> {why_trending}<br>
                            <small>Trigger: {ai_data.get('emotional_trigger', 'N/A')} | Audience: {ai_data.get('target_audience', 'N/A')}</small>
                        </div>
                    </div>
                </div>
                """
            html += "</div>"
            
    html += """
            <div class="footer">
                Automated Report by Autonomous Real-Time YouTube Trend Intelligence System
            </div>
        </div>
    </body>
    </html>
    """
    
    return html

def send_email(subject, html_content, recipient_email):
    """
    Sends HTML email using SMTP.
    """
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = EMAIL_USER
    msg['To'] = recipient_email
    
    part = MIMEText(html_content, 'html')
    msg.attach(part)
    
    try:
        # Using Gmail SMTP
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_USER, recipient_email, msg.as_string())
        print(f"Email sent successfully to {recipient_email}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
