/**
 * VideoResultSocratic Component
 * 
 * New version with Socratic learning interface
 * Replaces old VideoResult with conversation-first experience
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { VideoData, ConversationState, VideoDataWithConversation } from '@/types';
import { Clock, FileText, AlertTriangle, CheckCircle, Loader2, ArrowLeft, BookOpen, GraduationCap, Layers } from 'lucide-react';
import { formatTime } from '@/lib/youtube';
import { VideoPlayer } from './VideoPlayer';
import { SocraticChat } from './SocraticChat';
import { KeyConcepts } from './KeyConcepts';
import { QuizModal } from './QuizModal';
import { FlashcardModal } from './FlashcardModal';

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
  const [showKeyConcepts, setShowKeyConcepts] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState(analysis?.quizQuestions || []);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [dots, setDots] = useState('.');
  const [quizDots, setQuizDots] = useState('.');
  const [videoMetadata, setVideoMetadata] = useState(videoInfo);
  const videoPlayerRef = useRef<any>(null);
  
  const hasTranscript = transcript && transcript.length > 0;
  const isAnalyzing = processingStatus === 'analyzing';

  // Animate dots during analyzing: . .. ... . .. ...
  useEffect(() => {
    if (!isAnalyzing) return;
    
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Animate dots during quiz generation
  useEffect(() => {
    if (!isLoadingQuiz) return;
    
    const interval = setInterval(() => {
      setQuizDots(prev => {
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isLoadingQuiz]);

  // Fetch video metadata from YouTube oEmbed API if title is placeholder
  useEffect(() => {
    const fetchVideoMetadata = async () => {
      // Check if title looks like a placeholder (e.g., "Video k7RM-ot2NWY")
      if (videoInfo.title.startsWith('Video ') && videoInfo.title.includes(videoInfo.id)) {
        try {
          const response = await fetch(
            `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoInfo.id}&format=json`
          );
          
          if (response.ok) {
            const data = await response.json();
            setVideoMetadata({
              ...videoInfo,
              title: data.title || videoInfo.title,
              channelName: data.author_name || videoInfo.channelName,
              thumbnailUrl: data.thumbnail_url || videoInfo.thumbnailUrl
            });
          }
        } catch (error) {
          console.error('Error fetching video metadata:', error);
          // Keep original videoInfo if fetch fails
        }
      }
    };

    fetchVideoMetadata();
  }, [videoInfo]);
  
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

  const handleDurationChange = (duration: number) => {
    // Update videoMetadata with the actual duration from the player
    setVideoMetadata(prev => ({
      ...prev,
      duration
    }));
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

  const handleShowQuiz = async () => {
    // If quiz questions already exist, just show them
    if (quizQuestions.length > 0) {
      setShowQuiz(true);
      return;
    }

    // Otherwise, generate them
    setIsLoadingQuiz(true);
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: videoInfo.id,
          transcript,
          analysis
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await response.json();
      setQuizQuestions(data.questions);
      setShowQuiz(true);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Sorry, couldn\'t generate the quiz. Please try again.');
    } finally {
      setIsLoadingQuiz(false);
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
          <h2 style={{ 
            fontSize: 'var(--font-size-xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)'
          }}>
            Analyzing video{dots}
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

      </div>

      {/* Video Title */}
      <div 
        style={{ 
          maxWidth: 'var(--container-max-width)',
          margin: '0 auto var(--space-6)',
          padding: '0 var(--space-4)'
        }}
      >
        <div className="flex items-start justify-between" style={{ marginBottom: 'var(--space-2)' }}>
          <h1 style={{ 
            fontSize: 'var(--font-size-xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            flex: 1
          }}>
            {videoMetadata.title}
          </h1>
          
          {/* Quiz and Flashcard buttons */}
          <div className="flex items-center" style={{ gap: 'var(--space-2)', marginLeft: 'var(--space-4)' }}>
            <button
              onClick={handleShowQuiz}
              disabled={isLoadingQuiz}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--font-size-sm)',
                color: isLoadingQuiz ? 'var(--color-text-secondary)' : 'var(--color-brand-primary)',
                background: 'transparent',
                border: isLoadingQuiz ? '1px solid var(--color-border)' : '1px solid var(--color-brand-primary)',
                borderRadius: 'var(--radius-md)',
                cursor: isLoadingQuiz ? 'wait' : 'pointer',
                transition: 'var(--transition-base)',
                opacity: isLoadingQuiz ? 0.6 : 1
              }}
              className="hover:opacity-80"
            >
              {!isLoadingQuiz && <GraduationCap className="w-4 h-4" />}
              {isLoadingQuiz ? `Generating${quizDots}` : 'Quiz'}
            </button>

            <button
              onClick={() => setShowFlashcards(true)}
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
              <Layers className="w-4 h-4" />
              Flashcards
            </button>
          </div>
        </div>
        
        <div className="flex items-center flex-wrap" style={{ gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(videoMetadata.duration)}</span>
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
          {/* Video Player + Key Concepts */}
          <div style={{ position: 'sticky', top: 'var(--space-4)' }}>
            <VideoPlayer
              ref={videoPlayerRef}
              url={videoInfo.url}
              transcript={hasTranscript ? transcript : undefined}
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={handleDurationChange}
              className="w-full"
            />
            
            {/* Key Concepts below video */}
            {analysis && analysis.keyConcepts.length > 0 && (
              <div style={{ marginTop: 'var(--space-4)' }}>
                <KeyConcepts 
                  concepts={analysis.keyConcepts}
                  onJumpToTime={handleJumpToTime}
                />
              </div>
            )}
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

      {/* Modals */}
      {analysis && (
        <>
          {showKeyConcepts && (
            <div 
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
                padding: 'var(--space-4)'
              }}
              onClick={() => setShowKeyConcepts(false)}
            >
              <div 
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'var(--color-bg-primary)',
                  borderRadius: 'var(--radius-lg)',
                  maxWidth: '800px',
                  maxHeight: '80vh',
                  overflow: 'auto',
                  width: '100%'
                }}
              >
                <div style={{ 
                  padding: 'var(--space-6)',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
                    Key Concepts
                  </h2>
                  <button
                    onClick={() => setShowKeyConcepts(false)}
                    style={{
                      fontSize: 'var(--font-size-xl)',
                      color: 'var(--color-text-tertiary)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                </div>
                <KeyConcepts 
                  concepts={analysis.keyConcepts}
                  onJumpToTime={handleJumpToTime}
                />
              </div>
            </div>
          )}

          {showQuiz && quizQuestions.length > 0 && (
            <QuizModal
              questions={quizQuestions}
              isOpen={showQuiz}
              onClose={() => setShowQuiz(false)}
              onJumpToTime={handleJumpToTime}
            />
          )}

          {showFlashcards && analysis.keyConcepts && (
            <FlashcardModal
              flashcards={analysis.keyConcepts.map((concept, idx) => ({
                id: `flashcard-${idx}`,
                front: concept.term,
                back: `${concept.definition}\n\nContext: ${concept.context}`,
                category: 'Key Concept',
                timestamp: concept.timestamp
              }))}
              isOpen={showFlashcards}
              onClose={() => setShowFlashcards(false)}
              onJumpToTime={handleJumpToTime}
            />
          )}
        </>
      )}
    </div>
  );
}
