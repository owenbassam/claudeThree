# YouTube Transcript API - Vercel Deployment

A serverless API for extracting YouTube video transcripts using Vercel Python functions.

## Deployment to Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy from the transcript-api folder**:
   ```bash
   cd transcript-api
   vercel
   ```

3. **Set Root Directory in Vercel Dashboard**:
   - Go to your project settings in Vercel
   - Set "Root Directory" to `transcript-api`
   - Click "Save"

4. **Redeploy**:
   ```bash
   vercel --prod
   ```

## API Endpoint

Once deployed, your API will be available at:
```
https://your-project.vercel.app/api/transcript
```

## Usage

**POST Request:**
```bash
curl -X POST https://your-project.vercel.app/api/transcript \
  -H "Content-Type: application/json" \
  -d '{"videoId": "dQw4w9WgXcQ"}'
```

**Or with URL:**
```bash
curl -X POST https://your-project.vercel.app/api/transcript \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

**Response:**
```json
{
  "success": true,
  "transcript": [
    {
      "start": 1.36,
      "duration": 1.68,
      "end": 3.04,
      "text": "[♪♪♪]"
    }
  ],
  "videoInfo": {
    "id": "dQw4w9WgXcQ",
    "title": "Video dQw4w9WgXcQ",
    "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
}
```

## Local Development

Vercel CLI can run the serverless function locally:

```bash
cd transcript-api
vercel dev
```

Then test at `http://localhost:3000/api/transcript`

## Project Structure

```
transcript-api/
├── api/
│   └── transcript.py      # Serverless function
├── requirements.txt        # Python dependencies
├── vercel.json            # Vercel configuration
└── README.md              # This file
```

## Tech Stack

- **Vercel**: Serverless hosting
- **Python 3.9**: Runtime
- **youtube-transcript-api**: Transcript extraction library

## Requirements

- Node.js 18+
- yt-dlp installed on the system (`brew install yt-dlp` on macOS)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Start the server:
```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Extract Transcript
```
POST /api/transcript
Content-Type: application/json

{
  "videoId": "dQw4w9WgXcQ"
  // OR
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

Response:
```json
{
  "success": true,
  "transcript": [
    {
      "text": "...",
      "start": 0.0,
      "end": 5.5,
      "duration": 5.5
    }
  ],
  "videoInfo": {
    "id": "...",
    "title": "...",
    "description": "...",
    "thumbnailUrl": "...",
    "channelName": "...",
    "duration": 123
  }
}
```

## Deployment Options

### Option 1: Railway.app
1. Create new project on Railway
2. Connect this directory
3. Railway will auto-detect and deploy
4. Add environment variable: `PORT=3001`

### Option 2: Render.com
1. Create new Web Service
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Add yt-dlp in render.yaml (see below)

### Option 3: Fly.io
1. Install flyctl: `brew install flyctl`
2. Run: `fly launch`
3. Deploy: `fly deploy`

## render.yaml (for Render.com)

```yaml
services:
  - type: web
    name: transcript-api
    env: node
    buildCommand: |
      npm install
      apt-get update
      apt-get install -y python3 python3-pip
      pip3 install yt-dlp
    startCommand: npm start
```

## Dockerfile (for Docker deployment)

```dockerfile
FROM node:18-slim

# Install yt-dlp
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    pip3 install yt-dlp && \
    apt-get clean

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3001
CMD ["npm", "start"]
```
