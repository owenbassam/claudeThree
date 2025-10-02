# Transcript API Service

A standalone Express API for extracting YouTube transcripts using yt-dlp.

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
