import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

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
 * Extract transcript using yt-dlp
 */
async function extractTranscript(videoUrl) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'transcript-'));
  
  return new Promise((resolve, reject) => {
    const ytDlp = spawn('yt-dlp', [
      '--write-subs',
      '--write-auto-subs',
      '--sub-lang', 'en',
      '--skip-download',
      '--extractor-args', 'youtube:player_client=android,ios',
      '--user-agent', 'com.google.android.youtube/17.36.4 (Linux; U; Android 12; GB) gzip',
      '--output', path.join(tempDir, '%(title)s.%(ext)s'),
      videoUrl
    ]);

    let stderr = '';

    ytDlp.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ytDlp.on('close', async (code) => {
      try {
        if (code !== 0) {
          throw new Error(`yt-dlp exited with code ${code}: ${stderr}`);
        }

        // Find and parse the subtitle file
        const files = await fs.readdir(tempDir);
        const vttFile = files.find(f => f.endsWith('.vtt'));

        if (!vttFile) {
          throw new Error('No subtitle file found');
        }

        const vttPath = path.join(tempDir, vttFile);
        const vttContent = await fs.readFile(vttPath, 'utf-8');
        const segments = parseVTT(vttContent);

        // Cleanup
        await fs.rm(tempDir, { recursive: true, force: true });

        resolve({ success: true, segments });
      } catch (error) {
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        reject(error);
      }
    });

    ytDlp.on('error', (error) => {
      reject(new Error(`Failed to spawn yt-dlp: ${error.message}`));
    });
  });
}

/**
 * Get video metadata using yt-dlp
 */
async function getVideoInfo(videoId) {
  return new Promise((resolve, reject) => {
    const ytDlp = spawn('yt-dlp', [
      '--dump-json',
      '--no-warnings',
      '--extractor-args', 'youtube:player_client=android,ios',
      '--user-agent', 'com.google.android.youtube/17.36.4 (Linux; U; Android 12; GB) gzip',
      `https://www.youtube.com/watch?v=${videoId}`
    ]);

    let stdout = '';
    let stderr = '';

    ytDlp.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ytDlp.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ytDlp.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`yt-dlp exited with code ${code}: ${stderr}`));
      }

      try {
        const info = JSON.parse(stdout);
        resolve({
          id: videoId,
          title: info.title,
          description: info.description,
          thumbnailUrl: info.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          channelName: info.uploader || info.channel || 'Unknown',
          duration: info.duration,
          url: `https://www.youtube.com/watch?v=${videoId}`
        });
      } catch (error) {
        reject(new Error('Failed to parse video info'));
      }
    });

    ytDlp.on('error', (error) => {
      reject(new Error(`Failed to spawn yt-dlp: ${error.message}`));
    });
  });
}

/**
 * Parse VTT subtitle format
 */
function parseVTT(vttContent) {
  const segments = [];
  const lines = vttContent.split('\n');
  let currentSegment = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Match timestamp lines (e.g., "00:00:00.000 --> 00:00:05.000")
    const timestampMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3})\s+-->\s+(\d{2}:\d{2}:\d{2}\.\d{3})/);
    
    if (timestampMatch) {
      if (currentSegment && currentSegment.text) {
        segments.push(currentSegment);
      }
      
      currentSegment = {
        start: parseTimestamp(timestampMatch[1]),
        end: parseTimestamp(timestampMatch[2]),
        text: ''
      };
    } else if (currentSegment && line && !line.includes('WEBVTT') && !line.match(/^\d+$/)) {
      // Remove VTT formatting tags
      const cleanText = line.replace(/<[^>]*>/g, '').trim();
      if (cleanText) {
        currentSegment.text += (currentSegment.text ? ' ' : '') + cleanText;
      }
    }
  }

  // Add the last segment
  if (currentSegment && currentSegment.text) {
    segments.push(currentSegment);
  }

  // Calculate duration for each segment
  return segments.map(seg => ({
    ...seg,
    duration: seg.end - seg.start
  }));
}

/**
 * Parse VTT timestamp to seconds
 */
function parseTimestamp(timestamp) {
  const [hours, minutes, seconds] = timestamp.split(':');
  return (
    parseInt(hours) * 3600 +
    parseInt(minutes) * 60 +
    parseFloat(seconds)
  );
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
