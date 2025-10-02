# Deployment Guide

## Architecture

Your app is now split into two services:

1. **Next.js App** (`youtube-learning-app/`) - Deploy to Vercel
2. **Transcript API** (`transcript-api/`) - Deploy to Railway/Render/Fly

## Step 1: Deploy Transcript API

### Option A: Railway.app (Recommended - Easiest)

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `claudeThree` repo
4. **Important**: Set Root Directory to `transcript-api`
5. Railway will auto-detect the Dockerfile and deploy
6. Copy the deployed URL (e.g., `https://your-app.railway.app`)

### Option B: Render.com

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `transcript-api`
   - **Build Command**: `npm install && pip install yt-dlp`
   - **Start Command**: `npm start`
5. Deploy and copy the URL

### Option C: Fly.io

```bash
cd transcript-api
fly launch
fly deploy
```

## Step 2: Update Next.js App

Update your main app to use the external transcript API:

In `youtube-learning-app/src/app/api/transcript/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  const { url } = await request.json();
  
  // Call external transcript API
  const response = await fetch(process.env.TRANSCRIPT_API_URL + '/api/transcript', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  
  const data = await response.json();
  return NextResponse.json(data);
}
```

## Step 3: Deploy Next.js App to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import `claudeThree` repo
3. **Root Directory**: `youtube-learning-app`
4. Add Environment Variables:
   ```
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_REGION=us-east-1
   BEDROCK_MODEL_ID=anthropic.claude-sonnet-4-5-20250929-v1:0
   TRANSCRIPT_API_URL=https://your-transcript-api.railway.app
   ```
5. Deploy!

## Testing Locally

Terminal 1 - Transcript API:
```bash
cd transcript-api
npm start
# Runs on http://localhost:3001
```

Terminal 2 - Next.js App:
```bash
cd youtube-learning-app
# Add to .env.local:
# TRANSCRIPT_API_URL=http://localhost:3001
npm run dev
# Runs on http://localhost:3000
```

## Costs

- **Railway**: $5/month for hobby plan (includes 500 hours)
- **Render**: Free tier available (sleeps after inactivity)
- **Fly.io**: Free tier with 3 VMs
- **Vercel**: Free tier (generous limits)

**Recommended**: Railway for transcript API + Vercel for main app = ~$5/month
