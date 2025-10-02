'use client';

import { useState, useRef } from 'react';
import { VideoData } from '@/types';
import { Clock, FileText, AlertTriangle, CheckCircle, Loader2, Brain } from 'lucide-react';
import { formatTime } from '@/lib/youtube';
import { AnalysisResult } from './AnalysisResult';
import { VideoPlayer } from './VideoPlayer';
import { ChapterNavigation } from './ChapterNavigation';
import { KeyConcepts } from './KeyConcepts';

interface VideoResultProps {
  videoData: VideoData;
  onReset: () => void;
}

export function VideoResult({ videoData, onReset }: VideoResultProps) {
  const { videoInfo, transcript, analysis, processingStatus, error } = videoData;
  const [currentTime, setCurrentTime] = useState(0);
  const videoPlayerRef = useRef<any>(null);
  
  const handleJumpToTime = (timestamp: number) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.seekTo(timestamp);
    }
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };
  
  const hasTranscript = transcript && transcript.length > 0;
  const isAnalyzing = processingStatus === 'analyzing';
  const isComplete = processingStatus === 'complete' && analysis;
  const hasChapters = analysis && analysis.chapters && analysis.chapters.length > 0;

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 'var(--container-max-width)', margin: '0 auto' }}>
      {/* Header with video title - clean, minimal */}
      <div 
        className="flex justify-between items-start flex-wrap"
        style={{ 
          marginBottom: 'var(--space-8)',
          gap: 'var(--space-3)'
        }}
      >
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h2 
            className="font-semibold"
            style={{ 
              fontSize: 'var(--font-size-3xl)',
              lineHeight: 'var(--line-height-tight)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)'
            }}
          >
            {videoInfo.title}
          </h2>
          <div 
            className="flex items-center flex-wrap"
            style={{ 
              gap: 'var(--space-3)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)'
            }}
          >
            <span>{videoInfo.channelName}</span>
            <span>•</span>
            <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
              <Clock className="w-3.5 h-3.5" />
              <span>{videoInfo.duration ? formatTime(videoInfo.duration) : 'Loading...'}</span>
            </div>
            
            {hasTranscript && (
              <>
                <span>•</span>
                <div className="flex items-center" style={{ gap: 'var(--space-1)', color: 'var(--color-success)' }}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Transcript</span>
                </div>
              </>
            )}

            {isAnalyzing && (
              <>
                <span>•</span>
                <div className="flex items-center" style={{ gap: 'var(--space-1)', color: 'var(--color-brand-primary)' }}>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </div>
              </>
            )}

            {isComplete && (
              <>
                <span>•</span>
                <div className="flex items-center" style={{ gap: 'var(--space-1)', color: 'var(--color-brand-primary)' }}>
                  <Brain className="w-3.5 h-3.5" />
                  <span>Analysis Complete</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Secondary CTA button */}
        <button
          onClick={onReset}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            background: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            transition: 'var(--transition-base)',
            cursor: 'pointer'
          }}
          className="hover:border-gray-400"
        >
          Try Another Video
        </button>
      </div>

      {error && (
        <div 
          className="flex items-start"
          style={{
            marginBottom: 'var(--space-6)',
            padding: 'var(--space-3)',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-lg)',
            gap: 'var(--space-2)'
          }}
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-error)' }} />
          <div>
            <p style={{ 
              fontSize: 'var(--font-size-base)', 
              color: 'var(--color-error)',
              fontWeight: 500,
              marginBottom: 'var(--space-1)'
            }}>
              Error
            </p>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-error)' }}>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Video Player Card - prominent, clean */}
      <div 
        style={{
          background: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-8)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <VideoPlayer
          ref={videoPlayerRef}
          url={videoInfo.url}
          transcript={hasTranscript ? transcript : undefined}
          onTimeUpdate={handleTimeUpdate}
          className="w-full"
        />
      </div>

      {/* Interactive Learning Features - Show when analysis is complete */}
      {isComplete && analysis && (
        <div 
          className="grid grid-cols-1 lg:grid-cols-3"
          style={{ 
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-8)'
          }}
        >
          {/* Chapter Navigation */}
          {hasChapters && (
            <div className="lg:col-span-1">
              <ChapterNavigation
                chapters={analysis.chapters}
                currentTime={currentTime}
                onJumpToTime={handleJumpToTime}
              />
            </div>
          )}
          
          {/* Key Concepts */}
          {analysis.keyConcepts && analysis.keyConcepts.length > 0 && (
            <div className={hasChapters ? "lg:col-span-2" : "lg:col-span-3"}>
              <KeyConcepts
                concepts={analysis.keyConcepts}
                onJumpToTime={handleJumpToTime}
              />
            </div>
          )}
        </div>
      )}

      {/* AI Analysis Results */}
      {isComplete && analysis && (
        <AnalysisResult 
          analysis={analysis} 
          onJumpToTime={handleJumpToTime}
          transcript={videoData.transcript}
          videoTitle={videoData.videoInfo.title}
        />
      )}

      {/* Analysis Loading State */}
      {isAnalyzing && (
        <AnalysisResult 
          analysis={{} as any} 
          isLoading={true} 
          onJumpToTime={handleJumpToTime}
        />
      )}

      {/* Transcript Preview - only show if no analysis yet */}
      {hasTranscript && !isComplete && !isAnalyzing && (
        <div 
          style={{
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-6)'
          }}
        >
          <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <FileText className="w-5 h-5" style={{ color: 'var(--color-brand-primary)' }} />
            <h3 
              className="font-semibold"
              style={{ 
                fontSize: 'var(--font-size-xl)', 
                color: 'var(--color-text-primary)' 
              }}
            >
              Transcript Preview
            </h3>
          </div>
          
          <div 
            className="overflow-y-auto"
            style={{
              maxHeight: '256px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3)'
            }}
          >
            {transcript.slice(0, 10).map((segment, index) => (
              <div 
                key={index} 
                className="flex"
                style={{ 
                  gap: 'var(--space-3)',
                  marginBottom: 'var(--space-2)',
                  fontSize: 'var(--font-size-xs)'
                }}
              >
                <span 
                  className="font-mono"
                  style={{ 
                    color: 'var(--color-brand-primary)',
                    minWidth: '60px',
                    fontWeight: 500
                  }}
                >
                  {formatTime(segment.start)}
                </span>
                <span style={{ color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-base)' }}>
                  {segment.text}
                </span>
              </div>
            ))}
            
            {transcript.length > 10 && (
              <div 
                className="text-center"
                style={{ 
                  color: 'var(--color-text-tertiary)',
                  fontSize: 'var(--font-size-xs)',
                  paddingTop: 'var(--space-2)'
                }}
              >
                ... and {transcript.length - 10} more segments
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Transcript Message */}
      {!hasTranscript && (
        <div 
          style={{
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)'
          }}
        >
          <h3 
            className="font-semibold"
            style={{ 
              fontSize: 'var(--font-size-lg)', 
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)'
            }}
          >
            No Transcript Found
          </h3>
          <p style={{ 
            fontSize: 'var(--font-size-base)', 
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--line-height-base)',
            marginBottom: 'var(--space-3)'
          }}>
            This video doesn&apos;t have captions or transcripts available. Try with a different educational video that has captions enabled.
          </p>
          <div style={{ 
            fontSize: 'var(--font-size-xs)', 
            color: 'var(--color-text-tertiary)'
          }}>
            <strong>Tip:</strong> Most popular educational channels (Khan Academy, MIT OpenCourseWare, TED-Ed) have transcripts available.
          </div>
        </div>
      )}
    </div>
  );
}