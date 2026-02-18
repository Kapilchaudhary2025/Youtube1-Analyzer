from googleapiclient.discovery import build
import os
import datetime
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("YOUTUBE_API_KEY")
YOUTUBE = build('youtube', 'v3', developerKey=API_KEY)

def fetch_trending_videos(region_code="IN"):
    """
    Fetches trending videos from YouTube Data API.
    """
    try:
        request = YOUTUBE.videos().list(
            part="snippet,statistics,contentDetails",
            chart="mostPopular",
            regionCode=region_code,
            maxResults=50  # Fetch top 50
        )
        response = request.execute()
        
        videos = []
        for item in response.get('items', []):
            published_at = item['snippet']['publishedAt']
            # Parse published_at to datetime object
            # Format: 2023-10-27T10:00:00Z
            pub_date = datetime.datetime.strptime(published_at, "%Y-%m-%dT%H:%M:%SZ")
            now = datetime.datetime.utcnow()
            
            # Filter: Upload time within last 24 hours
            # OR (implicitly) in trending chart (which they are by definition of the API call)
            # The prompt says: "Upload time within last 24 hours OR Videos currently in trending chart."
            # Since we are fetching from 'mostPopular' chart, they ARE in trending.
            # But usually we want fresh trends. Let's keep all for now and let metrics engine decide viralness?
            # Prompt says: "Fetch ONLY real-time public trending data... Filter: Upload time within last 24 hours OR Videos currently in trending chart."
            # Since the API *is* the trending chart, the second condition is always met for these videos.
            # So we pass them all. 
            
            video_data = {
                'video_id': item['id'],
                'title': item['snippet']['title'],
                'channel_title': item['snippet']['channelTitle'],
                'published_at': published_at,
                'description': item['snippet'].get('description', ''),
                'tags': item['snippet'].get('tags', []),
                'category_id': item['snippet'].get('categoryId'),
                'view_count': int(item['statistics'].get('viewCount', 0)),
                'like_count': int(item['statistics'].get('likeCount', 0)),
                'comment_count': int(item['statistics'].get('commentCount', 0)),
                'duration': item['contentDetails']['duration'],
                'thumbnail_url': item['snippet']['thumbnails']['high']['url']
            }
            videos.append(video_data)
            
        return videos

    except Exception as e:
        print(f"Error fetching trending videos: {e}")
        return []
