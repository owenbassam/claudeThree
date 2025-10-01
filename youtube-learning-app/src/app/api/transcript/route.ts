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

    // Extract video ID from URL
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    console.log(`Processing video: ${videoId}`);

    // Get video info first
    const videoInfo = await getVideoInfo(videoId);
    console.log(`Video info:`, videoInfo);

    // Extract transcript using yt-dlp
    console.log('Extracting transcript with yt-dlp...');
    const transcriptResult = await extractTranscript(url);
    
    if (transcriptResult.success && transcriptResult.segments.length > 0) {
      // Convert transcript segments to expected format
      const transcript = transcriptResult.segments.map((segment: { text: string; start: number; end: number }) => ({
        text: segment.text,
        start: segment.start,
        end: segment.end,
        duration: segment.end - segment.start
      }));

      console.log(`Successfully extracted ${transcript.length} transcript segments using yt-dlp`);

      return NextResponse.json({
        videoInfo,
        transcript,
        totalSegments: transcript.length,
        hasTranscript: true,
        error: null,
        method: 'yt-dlp'
      });
    } else {
      console.error('Transcript extraction failed:', transcriptResult.error);
      
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
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to process video' },
      { status: 500 }
    );
  }
}

async function getVideoInfo(videoId: string): Promise<VideoInfo> {
  try {
    // Use YouTube oEmbed API for basic video info
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error(`oEmbed API failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      id: videoId,
      title: data.title || 'Unknown Title',
      description: '', // oEmbed doesn't provide description
      thumbnailUrl: data.thumbnail_url,
      channelName: data.author_name,
      url: `https://www.youtube.com/watch?v=${videoId}`
    };
  } catch (error) {
    console.error('Error fetching video info:', error);
    // Return minimal info if API fails
    return {
      id: videoId,
      title: 'YouTube Video',
      description: '',
      channelName: 'Unknown',
      url: `https://www.youtube.com/watch?v=${videoId}`
    };
  }
}