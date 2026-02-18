import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel('gemini-pro')

def analyze_video_ai(video):
    """
    Analyzes video using Gemini Pro to generate intelligence report.
    """
    prompt = f"""
    Analyze this trending YouTube video and provide a structured JSON response.
    
    Video Title: {video['title']}
    Channel: {video['channel_title']}
    Views: {video['view_count']}
    Hours Live: {video.get('hours_since_upload')}
    Description: {video.get('description', '')[:300]}...
    Tags: {video.get('tags', [])[:10]}
    
    Return ONLY a JSON object with these exact keys:
    {{
        "why_trending": "3 concise lines explaining why it's viral",
        "emotional_trigger": "e.g., Curiosity, Shock, Nostalgia",
        "target_audience": "Specific demographic",
        "thumbnail_psychology": "Why the thumbnail works (guess based on title/stats)",
        "title_strategy": "Analysis of the title structure",
        "predicted_performance": "Forecast for next 24h",
        "viral_score": 0-100 (numeric)
    }}
    Do not include markdown formatting like ```json or ```. Just the raw JSON string.
    """
    
    try:
        response = model.generate_content(prompt)
        text_response = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(text_response)
    except Exception as e:
        print(f"AI Analysis failed for {video['title']}: {e}")
        return {
            "why_trending": "Analysis failed.",
            "emotional_trigger": "Unknown",
            "target_audience": "General",
            "thumbnail_psychology": "N/A",
            "title_strategy": "N/A",
            "predicted_performance": "Unknown",
            "viral_score": 0
        }
