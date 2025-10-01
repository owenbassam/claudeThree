declare module 'youtube-transcript-api' {
  interface TranscriptSegment {
    text: string;
    start: string;
    dur: string;
  }

  interface TranscriptTrack {
    language: string;
    transcript: TranscriptSegment[];
  }

  interface TranscriptResult {
    id: string;
    title: string;
    tracks: TranscriptTrack[];
    isLive: boolean;
    languages: Array<{ label: string; languageCode: string }>;
    isLoginRequired: boolean;
    playabilityStatus: {
      status: string;
      reason?: string;
    };
  }

  class TranscriptClient {
    ready: Promise<void>;
    constructor(options?: any);
    getTranscript(videoId: string): Promise<TranscriptResult>;
  }

  export default TranscriptClient;
}

declare module 'youtube-captions-scraper' {
  interface CaptionSegment {
    text: string;
    start: number;
    dur: number;
  }

  interface GetSubtitlesOptions {
    videoID: string;
    lang?: string;
  }

  export function getSubtitles(options: GetSubtitlesOptions): Promise<CaptionSegment[]>;
}