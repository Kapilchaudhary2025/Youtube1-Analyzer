import sqlite3
import os
import datetime

DB_NAME = os.getenv("DB_NAME", "trends.db")

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    
    # Create videos table with NEW columns
    c.execute('''
        CREATE TABLE IF NOT EXISTS videos (
            video_id TEXT PRIMARY KEY,
            title TEXT,
            channel_title TEXT,
            published_at TEXT,
            view_count INTEGER,
            like_count INTEGER,
            comment_count INTEGER,
            engagement_score REAL,
            viral_probability INTEGER,
            trend_type TEXT,
            thumbnail_url TEXT,
            duration TEXT,
            category TEXT,
            hours_since_upload REAL,
            is_sent INTEGER DEFAULT 0,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create Settings Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    ''')
    
    # Initialize default settings if not exists
    c.execute('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', ('bot_active', '1'))
    
    conn.commit()
    conn.close()

def get_setting(key, default=None):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT value FROM settings WHERE key = ?', (key,))
    result = c.fetchone()
    conn.close()
    return result['value'] if result else default

def set_setting(key, value):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', (key, str(value)))
    conn.commit()
    conn.close()

def is_bot_active():
    val = get_setting('bot_active', '1')
    return val == '1'

def video_exists(video_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT 1 FROM videos WHERE video_id = ?', (video_id,))
    exists = c.fetchone() is not None
    conn.close()
    return exists

def is_video_sent(video_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT is_sent FROM videos WHERE video_id = ?', (video_id,))
    result = c.fetchone()
    conn.close()
    
    if result:
        return bool(result['is_sent'])
    return False

def mark_video_as_sent(video_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('UPDATE videos SET is_sent = 1 WHERE video_id = ?', (video_id,))
    conn.commit()
    conn.close()

def save_video(video_data):
    conn = get_db_connection()
    c = conn.cursor()
    
    # Check if exists to update or insert
    # Using REPLACE or INSERT OR REPLACE
    # COALESCE for is_sent to preserve it if exists
    c.execute('''
        INSERT OR REPLACE INTO videos (
            video_id, title, channel_title, published_at, 
            view_count, like_count, comment_count, 
            engagement_score, viral_probability, trend_type,
            thumbnail_url, duration, hours_since_upload, category,
            is_sent, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT is_sent FROM videos WHERE video_id = ?), 0), CURRENT_TIMESTAMP)
    ''', (
        video_data['video_id'], video_data['title'], video_data['channel_title'], 
        video_data['published_at'], video_data['view_count'], video_data['like_count'], 
        video_data['comment_count'], video_data.get('engagement_score', 0), 
        video_data.get('viral_probability', 0), video_data.get('trend_type', ''),
        video_data.get('thumbnail_url', ''), video_data.get('duration', ''), 
        video_data.get('hours_since_upload', 0.0), video_data.get('category', 'Entertainment'),
        video_data['video_id']
    ))
    
    conn.commit()
    conn.close()
