#!/usr/bin/env python3
"""
YouTube Transcript Fetcher using youtube-transcript-api
More reliable than yt-dlp for transcript-only extraction
"""

import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound

def get_transcript(video_id):
    """
    Fetch transcript for a YouTube video
    """
    try:
        # Initialize API and fetch transcript
        # This will try to get English transcript (manual or auto-generated)
        api = YouTubeTranscriptApi()
        segments = api.fetch(video_id, languages=['en'])
        
        # Format segments (segments are dataclass objects, not dicts)
        formatted_segments = []
        for segment in segments:
            formatted_segments.append({
                'start': segment.start,
                'duration': segment.duration,
                'end': segment.start + segment.duration,
                'text': segment.text
            })
        
        return {
            'success': True,
            'segments': formatted_segments
        }
    
    except TranscriptsDisabled:
        return {
            'success': False,
            'error': 'Transcripts are disabled for this video'
        }
    except NoTranscriptFound:
        return {
            'success': False,
            'error': 'No English transcript found for this video'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'No video ID provided'}))
        sys.exit(1)
    
    video_id = sys.argv[1]
    result = get_transcript(video_id)
    print(json.dumps(result))
