import { NextRequest, NextResponse } from 'next/server';
import { extractVideoId } from '@/lib/youtube';
import { extractTranscript } from '@/lib/transcript-extractor';
import { spawn } from 'child_process';

interface TranscriptSegment {
  text: string;
  start: number;
  end: number;
  duration: number;
}

interface VideoInfo {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  channelName?: string;
  url?: string;
  duration?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    const videoInfo = await getVideoInfo(videoId);
    const transcriptResult = await extractTranscript(url);
    
    if (transcriptResult.success && transcriptResult.segments.length > 0) {
      const transcript = transcriptResult.segments.map((segment: { text: string; start: number; end: number }) => ({
        text: segment.text,
        start: segment.start,
        end: segment.end,
        duration: segment.end - segment.start
      }));

      return NextResponse.json({
        videoInfo,
        transcript,
        totalSegments: transcript.length,
        hasTranscript: true,
        error: null,
        method: 'yt-dlp'
      });
    } else {
      return NextResponse.json({
        videoInfo,
        transcript: [],
        totalSegments: 0,
        hasTranscript: false,
        error: transcriptResult.error || 'No transcript available for this video',
        method: 'yt-dlp'
      });
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process video' },
      { status: 500 }
    );
  }
}

async function getVideoInfo(videoId: string): Promise<VideoInfo> {
  try {
    // Use yt-dlp to get video metadata including duration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const videoInfo = await new Promise<any>((resolve, reject) => {
      const ytDlp = spawn('yt-dlp', [
        '--dump-json',
        '--no-warnings',
        `https://www.youtube.com/watch?v=${videoId}`
      ]);

      let stdout = '';
      let stderr = '';

      ytDlp.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      ytDlp.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      ytDlp.on('close', (code: number) => {
        if (code === 0) {
          try {
            const data = JSON.parse(stdout);
            resolve(data);
          } catch (e) {
            reject(new Error('Failed to parse video info'));
          }
        } else {
          reject(new Error(`yt-dlp failed: ${stderr}`));
        }
      });
    });

    return {
      id: videoId,
      title: videoInfo.title || 'Unknown Title',
      description: videoInfo.description || '',
      duration: videoInfo.duration || 0,
      thumbnailUrl: videoInfo.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      channelName: videoInfo.uploader || videoInfo.channel || 'Unknown',
      url: `https://www.youtube.com/watch?v=${videoId}`
    };
  } catch (error) {
    console.error('Error fetching video info:', error);
    return {
      id: videoId,
      title: 'YouTube Video',
      description: '',
      duration: 0,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      channelName: 'Unknown',
      url: `https://www.youtube.com/watch?v=${videoId}`
    };
  }
}