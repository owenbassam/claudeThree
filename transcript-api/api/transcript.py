"""
Vercel serverless function for YouTube transcript extraction
"""
from http.server import BaseHTTPRequestHandler
import json
import urllib.parse
from youtube_transcript_api import YouTubeTranscriptApi


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        """Handle POST requests for transcript extraction"""
        try:
            # Parse request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body) if body else {}
            
            # Get video ID from request
            video_id = data.get('videoId') or data.get('url', '')
            
            if not video_id:
                self.send_error_response(400, 'Missing videoId or url parameter')
                return
            
            # Extract video ID from URL if needed
            if 'youtube.com' in video_id or 'youtu.be' in video_id:
                video_id = self.extract_video_id(video_id)
            
            if not video_id:
                self.send_error_response(400, 'Invalid video URL')
                return
            
            # Fetch transcript
            result = self.get_transcript(video_id)
            
            if result['success']:
                # Return successful response
                response = {
                    'success': True,
                    'transcript': result['segments'],
                    'videoInfo': {
                        'id': video_id,
                        'title': f'Video {video_id}',
                        'description': '',
                        'thumbnailUrl': f'https://img.youtube.com/vi/{video_id}/maxresdefault.jpg',
                        'channelName': 'Unknown',
                        'duration': 0,
                        'url': f'https://www.youtube.com/watch?v={video_id}'
                    }
                }
                self.send_json_response(200, response)
            else:
                self.send_error_response(500, result.get('error', 'Failed to fetch transcript'))
                
        except json.JSONDecodeError:
            self.send_error_response(400, 'Invalid JSON in request body')
        except Exception as e:
            self.send_error_response(500, str(e))
    
    def do_GET(self):
        """Handle GET requests - health check"""
        if self.path == '/api/transcript' or self.path == '/api/transcript/':
            self.send_json_response(200, {
                'status': 'ok',
                'service': 'transcript-api',
                'message': 'Use POST to fetch transcripts'
            })
        else:
            self.send_error_response(404, 'Not found')
    
    def get_transcript(self, video_id):
        """Fetch transcript for a YouTube video"""
        try:
            # Fetch transcript using instance method
            api = YouTubeTranscriptApi()
            transcript = api.fetch(video_id, languages=['en'])
            
            # Format segments (transcript is iterable of dataclass objects)
            formatted_segments = []
            for segment in transcript:
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
            
        except Exception as e:
            error_message = str(e)
            if 'disabled' in error_message.lower():
                error_message = 'Transcripts are disabled for this video'
            elif 'no transcript' in error_message.lower():
                error_message = 'No English transcript found for this video'
            
            return {
                'success': False,
                'error': error_message
            }
    
    def extract_video_id(self, url):
        """Extract video ID from YouTube URL"""
        if 'youtu.be/' in url:
            return url.split('youtu.be/')[1].split('?')[0].split('&')[0]
        elif 'youtube.com/watch' in url:
            parsed = urllib.parse.urlparse(url)
            params = urllib.parse.parse_qs(parsed.query)
            return params.get('v', [''])[0]
        return url
    
    def send_json_response(self, status_code, data):
        """Send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def send_error_response(self, status_code, message):
        """Send error response"""
        self.send_json_response(status_code, {
            'success': False,
            'error': message
        })
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
