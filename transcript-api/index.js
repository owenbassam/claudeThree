import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'transcript-api' });
});

// Extract transcript endpoint
app.post('/api/transcript', async (req, res) => {
  const { videoId, url } = req.body;

  if (!videoId && !url) {
    return res.status(400).json({ 
      error: 'Missing videoId or url parameter' 
    });
  }

  const videoUrl = url || `https://www.youtube.com/watch?v=${videoId}`;

  try {
    console.log(`[${new Date().toISOString()}] Fetching transcript for: ${videoUrl}`);
    
    const transcript = await extractTranscript(videoUrl);
    const videoInfo = await getVideoInfo(videoId || extractVideoIdFromUrl(url));

    res.json({
      success: true,
      transcript: transcript.segments,
      videoInfo
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to extract transcript',
      success: false 
    });
  }
});

/**
 * Extract transcript using Python youtube-transcript-api
 * More reliable than yt-dlp for transcript extraction
 */
async function extractTranscript(videoUrl) {
  const videoId = extractVideoIdFromUrl(videoUrl);
  
  return new Promise((resolve, reject) => {
    // Debug: log directory info
    console.log(`__dirname: ${__dirname}`);
    console.log(`__filename: ${__filename}`);
    console.log(`process.cwd(): ${process.cwd()}`);
    
    // Construct path to Python script (in same directory as this file)
    const pythonScript = path.join(__dirname, 'transcript_fetcher.py');
    
    // Try different Python executable paths
    const pythonCmd = process.env.PYTHON_CMD || 'python3';
    console.log(`Using Python command: ${pythonCmd}`);
    console.log(`Python script path: ${pythonScript}`);
    const python = spawn(pythonCmd, [pythonScript, videoId]);

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python script exited with code ${code}: ${stderr}`));
      }

      try {
        const result = JSON.parse(stdout);
        
        if (!result.success) {
          return reject(new Error(result.error || 'Failed to fetch transcript'));
        }

        resolve({ success: true, segments: result.segments });
      } catch (error) {
        reject(new Error(`Failed to parse transcript: ${error.message}`));
      }
    });

    python.on('error', (error) => {
      reject(new Error(`Failed to spawn Python: ${error.message}. Make sure Python 3 and youtube-transcript-api are installed.`));
    });
  });
}

/**
 * Get video metadata - returns basic info
 * For full metadata, you would need YouTube Data API v3
 */
async function getVideoInfo(videoId) {
  // Return basic video info
  // In production, you could use YouTube Data API v3 for complete metadata
  return {
    id: videoId,
    title: `Video ${videoId}`, // Could be enhanced with API call
    description: '',
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    channelName: 'Unknown',
    duration: 0,
    url: `https://www.youtube.com/watch?v=${videoId}`
  };
}

/**
 * Extract video ID from YouTube URL
 */
function extractVideoIdFromUrl(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  return match ? match[1] : null;
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Transcript API running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Endpoint: POST http://localhost:${PORT}/api/transcript`);
});
