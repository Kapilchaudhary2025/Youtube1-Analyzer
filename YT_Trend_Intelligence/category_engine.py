import re

# Category Mapping (Standard YouTube Category IDs to our definitions)
# 1: Film & Animation, 2: Autos & Vehicles, 10: Music, 15: Pets & Animals, 17: Sports, 
# 18: Short Movies, 19: Travel & Events, 20: Gaming, 21: Videoblogging, 22: People & Blogs, 
# 23: Comedy, 24: Entertainment, 25: News & Politics, 26: Howto & Style, 27: Education, 
# 28: Science & Technology, 29: Nonprofits & Activism, 30: Movies, 31: Anime/Animation, ...

CATEGORY_KEYWORDS = {
    "Gaming": ["gaming", "game", "gameplay", "walkthrough", "ps5", "xbox", "nintendo", "esports", "minecraft", "gta", "bgmi", "valorant", "free fire", "roblox"],
    "Technology": ["tech", "technology", "review", "unboxing", "smartphone", "iphone", "android", "laptop", "pc", "gadget", "software", "ai", "robot"],
    "News & Politics": ["news", "politics", "breaking", "update", "report", "live", "election", "government", "modi", "rahul", "bjp", "congress"],
    "Finance": ["finance", "money", "stock", "market", "invest", "crypto", "bitcoin", "business", "economy", "trading", "bank", "loan", "tax"],
    "Education": ["education", "tutorial", "learn", "how to", "class", "lecture", "study", "exam", "school", "college", "university", "coding", "course"],
    "Entertainment": ["entertainment", "comedy", "funny", "prank", "challenge", "vlog", "movie", "trailer", "song", "dance", "music", "serial", "episode"],
}

GAMING_KEYWORDS = ["gta", "minecraft", "bgmi", "valorant", "free fire"]

def parse_duration(duration_str):
    """Parses ISO 8601 duration string (e.g., PT1H2M10S) to seconds."""
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration_str)
    if not match:
        return 0
    
    hours, minutes, seconds = match.groups()
    total_seconds = 0
    if hours: total_seconds += int(hours) * 3600
    if minutes: total_seconds += int(minutes) * 60
    if seconds: total_seconds += int(seconds)
    
    return total_seconds

def categorize_video(video_data):
    """
    Categorizes video based on title, tags, description, duration, and category ID.
    """
    title = video_data['title'].lower()
    description = video_data['description'].lower()
    tags = [tag.lower() for tag in video_data.get('tags', [])]
    category_id = str(video_data.get('category_id'))
    duration_str = video_data.get('duration', '')
    
    text_content = title + " " + description + " " + " ".join(tags)
    
    # 1. Shorts Detection
    duration_seconds = parse_duration(duration_str)
    if duration_seconds > 0 and duration_seconds < 60:
        return "Shorts"

    # 2. Gaming Sub-Detection
    for keyword in GAMING_KEYWORDS:
        if keyword in text_content:
            return "Gaming"
    
    if category_id == "20": # Gaming
        return "Gaming"

    # 3. Keyword/Category Matching
    # Check Category ID first for strong signals
    if category_id == "28": return "Technology"
    if category_id == "25": return "News & Politics"
    if category_id == "27": return "Education"
    if category_id == "24": return "Entertainment" # Generic
    
    # Keyword based
    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            # Use word boundary check for better accuracy? For now simple inclusion.
            if f" {keyword} " in f" {text_content} ": # simple boundary check
                return category
    
    # Default fallback
    return "Entertainment"
