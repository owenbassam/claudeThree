import { NextRequest, NextResponse } from 'next/server';
import { extractVideoId } from '@/lib/youtube';

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

    // Call external transcript API
    const transcriptApiUrl = process.env.TRANSCRIPT_API_URL || 'http://localhost:3001';
    
    const response = await fetch(`${transcriptApiUrl}/api/transcript`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({
        videoInfo: {
          id: videoId,
          title: 'Unknown',
          url: url
        },
        transcript: [],
        totalSegments: 0,
        hasTranscript: false,
        error: errorData.error || 'Failed to fetch transcript from API',
        method: 'external-api'
      }, { status: response.status });
    }

    const data = await response.json();
    
    if (data.success && data.transcript.length > 0) {
      return NextResponse.json({
        videoInfo: data.videoInfo,
        transcript: data.transcript,
        totalSegments: data.transcript.length,
        hasTranscript: true,
        error: null,
        method: 'external-api'
      });
    } else {
      return NextResponse.json({
        videoInfo: data.videoInfo || {
          id: videoId,
          title: 'Unknown',
          url: url
        },
        transcript: [],
        totalSegments: 0,
        hasTranscript: false,
        error: data.error || 'No transcript available for this video',
        method: 'external-api'
      });
    }

  } catch (error) {
    console.error('Transcript API error:', error);
    return NextResponse.json(
      { error: 'Failed to process video' },
      { status: 500 }
    );
  }
}