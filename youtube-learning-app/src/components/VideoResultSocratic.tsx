/**
 * VideoResultSocratic Component
 * 
 * New version with Socratic learning interface
 * Replaces old VideoResult with conversation-first experience
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { VideoData, ConversationState, VideoDataWithConversation } from '@/types';
import { Clock, FileText, AlertTriangle, CheckCircle, Loader2, Brain, ArrowLeft } from 'lucide-react';
import { formatTime } from '@/lib/youtube';
import { VideoPlayer } from './VideoPlayer';
import { SocraticChat } from './SocraticChat';
import { ProgressMap } from './ProgressMap';

interface VideoResultSocraticProps {
  videoData: VideoDataWithConversation;
  onReset: () => void;
}

export function VideoResultSocratic({ videoData, onReset }: VideoResultSocraticProps) {
  const { videoInfo, transcript, analysis, processingStatus, error } = videoData;
  const [currentTime, setCurrentTime] = useState(0);
  const [conversationState, setConversationState] = useState<ConversationState | null>(
    videoData.conversationState || null
  );
  const [isInitializing, setIsInitializing] = useState(false);
  const [showProgressMap, setShowProgressMap] = useState(false);
  const videoPlayerRef = useRef<any>(null);
  
  const hasTranscript = transcript && transcript.length > 0;
  const isAnalyzing = processingStatus === 'analyzing';
  const isComplete = processingStatus === 'complete' && analysis;

  // Initialize conversation when analysis is complete
  useEffect(() => {
    if (isComplete && !conversationState && !isInitializing) {
      initializeConversation();
    }
  }, [isComplete, conversationState]);

  const initializeConversation = async () => {
    setIsInitializing(true);
    
    try {
      const response = await fetch('/api/tutor/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: videoInfo.id,
          videoTitle: videoInfo.title,
          analysis
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }

      const data = await response.json();
      setConversationState(data.conversationState);

    } catch (error) {
      console.error('Error initializing conversation:', error);
      alert('Sorry, couldn\'t start the conversation. Please try again.');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleJumpToTime = (timestamp: number) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.seekTo(timestamp);
    }
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleConversationUpdate = (newState: ConversationState) => {
    setConversationState(newState);
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem(
        `conversation_${videoInfo.id}`,
        JSON.stringify(newState)
      );
    } catch (err) {
      console.error('Failed to save conversation state:', err);
    }
  };

  // Show loading state while analyzing
  if (isAnalyzing) {
    return (
      <div 
        className="animate-fadeIn flex items-center justify-center min-h-screen"
        style={{ 
          textAlign: 'center',
          padding: 'var(--space-4)'
        }}
      >
        <div>
          <Brain className="w-16 h-16 mx-auto mb-4 animate-pulse" style={{ color: 'var(--color-brand-primary)' }} />
          <h2 style={{ 
            fontSize: 'var(--font-size-xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)'
          }}>
            Analyzing video...
          </h2>
          <p style={{ 
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)'
          }}>
            Preparing your personalized learning experience
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div 
        className="animate-fadeIn" 
        style={{ 
          maxWidth: 'var(--container-max-width)', 
          margin: '0 auto'
        }}
      >
        <div 
          style={{
            padding: 'var(--space-6)',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center'
          }}
        >
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-error)' }} />
          <h2 style={{ 
            fontSize: 'var(--font-size-xl)',
            fontWeight: 700,
            color: 'var(--color-error)',
            marginBottom: 'var(--space-2)'
          }}>
            Something went wrong
          </h2>
          <p style={{ 
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-4)'
          }}>
            {error}
          </p>
          <button
            onClick={onReset}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 600,
              background: 'var(--color-brand-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer'
            }}
          >
            Try Another Video
          </button>
        </div>
      </div>
    );
  }

  // Main Socratic learning interface
  return (
    <div className="animate-fadeIn" style={{ maxWidth: '100%', margin: '0 auto' }}>
      {/* Header */}
      <div 
        className="flex justify-between items-center"
        style={{ 
          maxWidth: 'var(--container-max-width)',
          margin: '0 auto var(--space-6)',
          padding: '0 var(--space-4)',
          gap: 'var(--space-3)'
        }}
      >
        <button
          onClick={onReset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            background: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'var(--transition-base)'
          }}
          className="hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]"
        >
          <ArrowLeft className="w-4 h-4" />
          New Video
        </button>

        <button
          onClick={() => setShowProgressMap(!showProgressMap)}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            background: showProgressMap ? 'var(--color-brand-primary)' : 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'var(--transition-base)'
          }}
          className={showProgressMap ? 'text-white' : 'hover:border-[var(--color-brand-primary)]'}
        >
          {showProgressMap ? 'Hide' : 'Show'} Progress
        </button>
      </div>

      {/* Video Title */}
      <div 
        style={{ 
          maxWidth: 'var(--container-max-width)',
          margin: '0 auto var(--space-6)',
          padding: '0 var(--space-4)'
        }}
      >
        <h1 style={{ 
          fontSize: 'var(--font-size-xl)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-2)'
        }}>
          {videoInfo.title}
        </h1>
        <div className="flex items-center flex-wrap" style={{ gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(videoInfo.duration)}</span>
          </div>
          {hasTranscript && (
            <>
              <span>•</span>
              <div className="flex items-center" style={{ gap: 'var(--space-1)', color: 'var(--color-success)' }}>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Transcript available</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress Map (collapsible) */}
      {showProgressMap && conversationState && analysis && (
        <div 
          style={{ 
            maxWidth: 'var(--container-max-width)',
            margin: '0 auto var(--space-6)',
            padding: '0 var(--space-4)'
          }}
        >
          <ProgressMap
            conversationState={conversationState}
            analysis={analysis}
            onChapterClick={(index) => {
              // Optional: jump to chapter start time
              const chapter = analysis.chapters[index];
              if (chapter) {
                handleJumpToTime(chapter.startTime);
              }
            }}
          />
        </div>
      )}

      {/* Main Content: Video + Chat Split Screen */}
      <div 
        style={{
          maxWidth: 'var(--container-max-width)',
          margin: '0 auto',
          padding: '0 var(--space-4)'
        }}
      >
        <div 
          className="grid gap-6"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            alignItems: 'start'
          }}
        >
          {/* Video Player */}
          <div style={{ position: 'sticky', top: 'var(--space-4)' }}>
            <VideoPlayer
              ref={videoPlayerRef}
              url={videoInfo.url}
              transcript={hasTranscript ? transcript : undefined}
              onTimeUpdate={handleTimeUpdate}
              className="w-full"
            />
          </div>

          {/* Socratic Chat */}
          <div style={{ minHeight: '600px', display: 'flex' }}>
            {conversationState && analysis ? (
              <SocraticChat
                conversationState={conversationState}
                analysis={analysis}
                onStateUpdate={handleConversationUpdate}
                onVideoSeek={handleJumpToTime}
              />
            ) : isInitializing ? (
              <div 
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                <Loader2 className="w-8 h-8 animate-spin" />
                <p>Starting your learning journey...</p>
              </div>
            ) : (
              <div 
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-secondary)'
                }}
              >
                <p>Loading conversation...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
