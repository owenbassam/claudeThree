# YouTube Transcript API

A production-ready serverless API for extracting YouTube video transcripts with bot detection bypass using Webshare residential rotating proxies.

## Overview

This API provides reliable YouTube transcript extraction for the YouTube Learning Platform. It uses the `youtube-transcript-api` Python library with Webshare residential proxies to bypass YouTube's cloud provider IP blocking.

## Features

- ✅ **Reliable Extraction**: Bypasses YouTube bot detection using residential proxies
- ✅ **Serverless Architecture**: Deployed on Vercel for automatic scaling
- ✅ **Error Handling**: Comprehensive error messages and fallback logic
- ✅ **CORS Support**: Ready for cross-origin requests from web applications
- ✅ **Multiple Input Formats**: Accepts video IDs or full YouTube URLs
- ✅ **Structured Output**: Returns formatted transcript with timestamps

## API Endpoint

**Production:** `https://claude-three-59c2.vercel.app/api/transcript`

## Usage

### POST Request

```bash
curl -X POST https://claude-three-59c2.vercel.app/api/transcript \
  -H "Content-Type: application/json" \
  -d '{"videoId": "dQw4w9WgXcQ"}'
```

**Or with full URL:**

```bash
curl -X POST https://claude-three-59c2.vercel.app/api/transcript \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

### GET Request (Health Check)

```bash
curl https://claude-three-59c2.vercel.app/api/transcript
```

Response:
```json
{
  "status": "ok",
  "service": "transcript-api",
  "message": "Use POST to fetch transcripts"
}
```

### Success Response

```json
{
  "success": true,
  "transcript": [
    {
      "start": 1.36,
      "duration": 1.68,
      "end": 3.04,
      "text": "[♪♪♪]"
    },
    {
      "start": 18.64,
      "duration": 3.24,
      "end": 21.88,
      "text": "We're no strangers to love"
    }
  ],
  "videoInfo": {
    "id": "dQw4w9WgXcQ",
    "title": "Video dQw4w9WgXcQ",
    "description": "",
    "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    "channelName": "Unknown",
    "duration": 0,
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Transcripts are disabled for this video"
}
```

## Local Development

### Prerequisites

- Python 3.8 or higher
- pip package manager
- Webshare account with residential proxies

### Setup

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment variables**
   
   Create `.env` file:
   ```env
   WEBSHARE_PROXY_USERNAME=your_username
   WEBSHARE_PROXY_PASSWORD=your_password
   ```

3. **Test locally with Vercel CLI**
   ```bash
   vercel dev
   ```

4. **Test the endpoint**
   ```bash
   curl -X POST http://localhost:3000/api/transcript \
     -H "Content-Type: application/json" \
     -d '{"videoId": "dQw4w9WgXcQ"}'
   ```

## Deployment

### Vercel (Production)

1. **Configure Vercel Project**
   - Framework Preset: **Other**
   - Root Directory: `transcript-api`

2. **Add Environment Variables in Vercel Dashboard**
   - `WEBSHARE_PROXY_USERNAME`: Your Webshare username
   - `WEBSHARE_PROXY_PASSWORD`: Your Webshare password

3. **Deploy**
   ```bash
   # From root directory
   git push origin main
   ```
   
   Vercel automatically deploys on push to main branch.

4. **Manual Deployment (if needed)**
   ```bash
   cd transcript-api
   vercel --prod
   ```

## Project Structure

```
transcript-api/
├── api/
│   └── transcript.py          # Main serverless function
├── requirements.txt            # Python dependencies
├── .env                        # Local environment variables (gitignored)
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules
├── .vercelignore               # Vercel deployment exclusions
└── README.md                   # This file
```

## Technology Stack

- **Python 3.9**: Runtime environment
- **Vercel**: Serverless hosting platform
- **youtube-transcript-api**: Transcript extraction library
- **Webshare**: Residential rotating proxy service
- **BaseHTTPRequestHandler**: HTTP request handling

## Dependencies

```txt
youtube-transcript-api>=1.2.0
python-dotenv>=1.0.0
```

## How It Works

1. **Request Handling**: API receives POST request with video ID or URL
2. **Video ID Extraction**: Parses YouTube URLs to extract video ID
3. **Proxy Configuration**: Loads Webshare credentials from environment variables
4. **API Initialization**: Creates YouTubeTranscriptApi instance with proxy config
5. **Transcript Fetch**: Retrieves transcript using residential proxies
6. **Data Formatting**: Converts transcript to JSON with timestamps
7. **Response**: Returns formatted transcript with video metadata

## Proxy Configuration

The API uses **Webshare residential rotating proxies** to bypass YouTube's bot detection:

- **Residential IPs**: Uses real residential IP addresses
- **Automatic Rotation**: Rotates IPs with each request
- **High Reliability**: Avoids cloud provider IP blocks
- **Fallback**: Works without proxies in local development

### Why Proxies?

YouTube blocks most cloud provider IPs (AWS, GCP, Azure, Vercel) from accessing transcripts. Residential rotating proxies provide:

- Real residential IP addresses
- Automatic rotation per request
- Geographic distribution
- Reliable transcript access

## Error Handling

The API handles various error scenarios:

| Error | Description | Response |
|-------|-------------|----------|
| Missing videoId | No video ID in request | 400 Bad Request |
| Invalid URL | Malformed YouTube URL | 400 Bad Request |
| Transcripts Disabled | Video has no transcripts | 500 with error message |
| No English Transcript | English transcript not available | 500 with error message |
| YouTube Blocked | IP temporarily blocked | 500 with error message |
| Rate Limiting | Too many requests | 500 with error message |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `WEBSHARE_PROXY_USERNAME` | Webshare account username | Yes (production) |
| `WEBSHARE_PROXY_PASSWORD` | Webshare account password | Yes (production) |

**Note**: Proxies are optional for local development but required for production deployment.

## Performance

- **Cold Start**: ~2-5 seconds (first request)
- **Warm Requests**: ~1-3 seconds
- **Transcript Size**: Scales with video length
- **Concurrent Requests**: Unlimited (serverless auto-scaling)

## Limitations

- Only supports English transcripts by default
- Requires videos to have captions enabled
- Some videos may have auto-generated transcripts disabled
- Rate limiting may occur with excessive requests

## Troubleshooting

### "Transcripts are disabled for this video"
- Video has no captions/subtitles enabled
- Try another video with confirmed transcripts

### "YouTube is blocking requests"
- Proxy credentials may be incorrect
- Check environment variables in Vercel
- Verify Webshare account is active

### "Invalid JSON in request body"
- Ensure Content-Type header is set to `application/json`
- Verify JSON syntax in request body

### Deployment Issues
- Verify root directory is set to `transcript-api`
- Check that all environment variables are configured
- Review Vercel deployment logs for errors

## Security

- ✅ Environment variables stored securely in Vercel
- ✅ No credentials exposed in code
- ✅ CORS configured for specific origins
- ✅ Input validation on all requests
- ✅ Error messages sanitized

## Cost Considerations

### Vercel
- **Free Tier**: 100GB bandwidth, 100 serverless function hours
- **Pro Tier**: $20/month for higher limits

### Webshare Proxies
- **Residential Rotating**: ~$5-50/month depending on bandwidth
- **1GB Bandwidth**: ~$5/month (sufficient for moderate usage)
- **10GB Bandwidth**: ~$45/month (high-volume usage)

## API Rate Limits

No rate limits imposed by the API itself, but consider:
- Webshare bandwidth limits
- Vercel function execution limits
- YouTube's rate limiting (handled by proxies)

## Support

For issues or questions:
- Check Vercel deployment logs
- Verify environment variables are set
- Test with known working video IDs
- Review Webshare proxy status

## License

Private and proprietary.

## Author

Owen Bassam

## Acknowledgments

- **youtube-transcript-api**: Core transcript extraction library
- **Webshare**: Reliable residential proxy service
- **Vercel**: Serverless hosting platform