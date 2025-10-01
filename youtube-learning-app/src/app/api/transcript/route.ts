import { NextRequest, NextResponse } from 'next/server';
import { extractVideoId } from '@/lib/youtube';
import { extractTranscript } from '@/lib/transcript-extractor';

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
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error(`oEmbed API failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      id: videoId,
      title: data.title || 'Unknown Title',
      description: '',
      thumbnailUrl: data.thumbnail_url,
      channelName: data.author_name,
      url: `https://www.youtube.com/watch?v=${videoId}`
    };
  } catch (error) {
    return {
      id: videoId,
      title: 'YouTube Video',
      description: '',
      channelName: 'Unknown',
      url: `https://www.youtube.com/watch?v=${videoId}`
    };
  }
}