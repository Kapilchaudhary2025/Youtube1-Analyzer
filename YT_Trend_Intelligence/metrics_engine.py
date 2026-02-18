import datetime

def calculate_hours_since_upload(published_at_str):
    # standard format: 2023-10-27T10:00:00Z
    # python 3.7+ fromisoformat handles 'Z' if replaced by +00:00
    try:
        if published_at_str.endswith('Z'):
            published_at_str = published_at_str[:-1] + '+00:00'
        pub_date = datetime.datetime.fromisoformat(published_at_str)
        now = datetime.datetime.now(datetime.timezone.utc)
        diff = now - pub_date
        return max(diff.total_seconds() / 3600, 0.1) # Avoid division by zero
    except Exception:
        return 1.0

def calculate_engagement_score(views, likes, comments, hours_since_upload):
    # (Views + Likes*2 + Comments*3) / Hours Since Upload
    score = (views + (likes * 2) + (comments * 3)) / hours_since_upload
    return round(score, 2)

def calculate_viral_probability(engagement_score, hours_since_upload, view_count):
    # Simple heuristic based on engagement density
    # Base probability
    prob = 0
    
    # High views in short time
    views_per_hour = view_count / hours_since_upload
    if views_per_hour > 100000: prob += 40
    elif views_per_hour > 50000: prob += 30
    elif views_per_hour > 10000: prob += 20
    
    # Engagement Quality
    if engagement_score > 50000: prob += 40
    elif engagement_score > 10000: prob += 30
    elif engagement_score > 1000: prob += 10
    
    # Cap at 100
    return min(prob + 20, 100) # Base 20

def determine_trend_type(viral_prob, hours):
    if viral_prob >= 90 and hours < 4:
        return "🔥 Exploding"
    elif viral_prob >= 75:
        return "🚀 Fast Rising"
    elif viral_prob >= 50:
        return "📈 Steady Growth"
    elif hours < 24: # Fresh but low score
        return "⚡ Viral Short" if hours < 0.1 else "News" # Placeholder
    else:
        return "Regular"

def analyze_video_metrics(video):
    """
    Enriches video object with metrics.
    """
    hours = calculate_hours_since_upload(video['published_at'])
    score = calculate_engagement_score(
        video['view_count'], 
        video['like_count'], 
        video['comment_count'], 
        hours
    )
    prob = calculate_viral_probability(score, hours, video['view_count'])
    trend = determine_trend_type(prob, hours)
    
    video['hours_since_upload'] = round(hours, 2)
    video['engagement_score'] = score
    video['viral_probability'] = prob
    # trend type logic might need category info, but for now simple
    # Special overrides
    if "Shorts" in str(video.get('category', '')):
        video['trend_type'] = "⚡ Viral Short"
    elif "Gaming" in str(video.get('category', '')) and prob > 70:
        video['trend_type'] = "🎮 Viral Gaming"
    elif "News" in str(video.get('category', '')) and hours < 5:
        video['trend_type'] = "📰 Breaking News"
    else:
        video['trend_type'] = trend
        
    return video
