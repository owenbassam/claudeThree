import { useState } from 'react';
import { VideoData, VideoInfo, TranscriptSegment } from '@/types';
import { isValidYouTubeUrl } from '@/lib/youtube';
import { apiRequest } from '@/lib/api';

export function useVideoProcessor() {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processVideo = async (url: string) => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoData(null);

    try {
      // Step 1: Extract transcript
      const transcriptResponse = await apiRequest<{
        videoInfo: VideoInfo;
        transcript: TranscriptSegment[];
        totalSegments: number;
        hasTranscript: boolean;
        error?: string;
      }>('/api/transcript', {
        method: 'POST',
        body: JSON.stringify({ url }),
      });

      // Create initial video data
      const initialVideoData: VideoData = {
        videoInfo: transcriptResponse.videoInfo,
        transcript: transcriptResponse.transcript,
        analysis: null,
        processingStatus: transcriptResponse.hasTranscript ? 'loading' : 'complete',
        error: transcriptResponse.error || undefined,
      };

      setVideoData(initialVideoData);

      // If we have a transcript, we can proceed to analysis
      if (transcriptResponse.hasTranscript && transcriptResponse.transcript.length > 0) {
        // Step 2: Analyze with Claude
        try {
          // Update status to analyzing
          setVideoData(prev => prev ? { ...prev, processingStatus: 'analyzing' } : null);

          const analysisResponse = await apiRequest<{
            analysis: any;
            success: boolean;
            warning?: string;
          }>('/api/analyze', {
            method: 'POST',
            body: JSON.stringify({ 
              transcript: transcriptResponse.transcript,
              videoTitle: transcriptResponse.videoInfo.title 
            }),
          });

          // Update with complete analysis
          setVideoData(prev => prev ? {
            ...prev,
            analysis: analysisResponse.analysis,
            processingStatus: 'complete'
          } : null);

        } catch (analysisError) {
          console.error('Analysis failed:', analysisError);
          // Keep the video data but mark analysis as failed
          setVideoData(prev => prev ? {
            ...prev,
            processingStatus: 'error',
            error: 'Failed to analyze content with AI'
          } : null);
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process video';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const processPDF = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setVideoData(null);

    try {
      // Step 1: Extract text from PDF
      const formData = new FormData();
      formData.append('file', file);

      const pdfResponse = await fetch('/api/pdf', {
        method: 'POST',
        body: formData,
      });

      if (!pdfResponse.ok) {
        throw new Error('Failed to process PDF');
      }

      const pdfData = await pdfResponse.json();

      // Create transcript-like structure from PDF text
      const transcript: TranscriptSegment[] = pdfData.content.segments.map((seg: any, index: number) => ({
        text: seg.text,
        start: index * 10, // Fake timestamps for PDF segments
        duration: 10,
      }));

      // Create video-like data structure for PDF
      const initialPDFData: VideoData = {
        videoInfo: {
          id: pdfData.pdf.id,
          title: pdfData.pdf.title,
          description: `PDF Document • ${pdfData.pdf.pageCount} pages`,
          duration: pdfData.pdf.pageCount * 60, // Estimate 1 min per page
          thumbnailUrl: '',
          channelName: 'PDF Upload',
          url: pdfData.pdf.fileName,
        },
        transcript,
        analysis: null,
        processingStatus: 'analyzing',
      };

      setVideoData(initialPDFData);

      // Step 2: Analyze PDF content with Claude
      try {
        const analysisResponse = await apiRequest<{
          analysis: any;
          success: boolean;
          warning?: string;
        }>('/api/analyze', {
          method: 'POST',
          body: JSON.stringify({ 
            transcript,
            videoTitle: pdfData.pdf.title 
          }),
        });

        // Update with complete analysis
        setVideoData(prev => prev ? {
          ...prev,
          analysis: analysisResponse.analysis,
          processingStatus: 'complete'
        } : null);

      } catch (analysisError) {
        console.error('Analysis failed:', analysisError);
        setVideoData(prev => prev ? {
          ...prev,
          processingStatus: 'error',
          error: 'Failed to analyze PDF content with AI'
        } : null);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process PDF';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetVideo = () => {
    setVideoData(null);
    setError(null);
    setIsLoading(false);
  };

  return {
    videoData,
    isLoading,
    error,
    processVideo,
    processPDF,
    resetVideo,
  };
}