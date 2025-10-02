/**
 * SocraticChat Component
 * 
 * Main conversational interface for Socratic learning
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Lightbulb, CheckCircle, Lock } from 'lucide-react';
import { ConversationState, Message, LearningAnalysis, EvaluationResult, HintLevel } from '@/types';

interface SocraticChatProps {
  conversationState: ConversationState;
  analysis: LearningAnalysis;
  onStateUpdate: (newState: ConversationState) => void;
  onVideoSeek?: (timestamp: number) => void;
}

export function SocraticChat({ 
  conversationState, 
  analysis,
  onStateUpdate,
  onVideoSeek 
}: SocraticChatProps) {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentHintLevel, setCurrentHintLevel] = useState<1 | 2 | 3 | 4>(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationState.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationState,
          userAnswer: userInput.trim(),
          analysis
        })
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate answer');
      }

      const data = await response.json();
      
      // Update conversation state
      onStateUpdate(data.conversationState);
      
      // Reset input
      setUserInput('');
      setCurrentHintLevel(1);
      setShowHints(false);

    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Sorry, something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetHint = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const currentQuestion = conversationState.messages
        .filter(m => m.role === 'ai')
        .pop()?.content || '';

      const response = await fetch('/api/tutor/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationState,
          currentQuestion,
          userAnswer: userInput,
          hintLevel: currentHintLevel,
          analysis
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get hint');
      }

      const data = await response.json();
      
      // Add hint as a message
      const hintMessage: Message = {
        id: `hint_${Date.now()}`,
        role: 'ai',
        content: `💡 Hint ${currentHintLevel}: ${data.hint.content}`,
        timestamp: Date.now(),
        messageType: 'hint'
      };

      const updatedState = {
        ...conversationState,
        messages: [...conversationState.messages, hintMessage],
        userProfile: data.updatedProfile
      };

      onStateUpdate(updatedState);
      
      // Increment hint level for next time
      if (currentHintLevel < 4) {
        setCurrentHintLevel((currentHintLevel + 1) as 1 | 2 | 3 | 4);
      }

    } catch (error) {
      console.error('Error getting hint:', error);
      alert('Sorry, couldn\'t generate a hint right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentChapter = () => {
    if (conversationState.currentChapterIndex < 0) return null;
    return analysis.chapters[conversationState.currentChapterIndex];
  };

  const currentChapter = getCurrentChapter();

  return (
    <div 
      className="flex flex-col h-full"
      style={{
        background: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden'
      }}
    >
      {/* Header - Current Chapter */}
      {currentChapter && (
        <div 
          style={{
            padding: 'var(--space-4)',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-bg-secondary)'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p style={{ 
                fontSize: 'var(--font-size-xs)', 
                color: 'var(--color-text-tertiary)',
                marginBottom: '2px'
              }}>
                Chapter {conversationState.currentChapterIndex + 1} of {analysis.chapters.length}
              </p>
              <h3 style={{ 
                fontSize: 'var(--font-size-base)', 
                fontWeight: 600,
                color: 'var(--color-text-primary)'
              }}>
                {currentChapter.title}
              </h3>
            </div>
            
            {/* Progress indicator */}
            <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
              <span style={{ 
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-tertiary)'
              }}>
                Chapter {conversationState.currentChapterIndex + 1} of {analysis.chapters.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div 
        className="flex-1 overflow-y-auto"
        style={{ 
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)'
        }}
      >
        {conversationState.messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            message={message}
            onVideoSeek={onVideoSeek}
          />
        ))}

        {isLoading && (
          <div className="flex items-center" style={{ gap: 'var(--space-2)', color: 'var(--color-text-tertiary)' }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span style={{ fontSize: 'var(--font-size-sm)' }}>Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div 
        style={{
          padding: 'var(--space-4)',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg-secondary)'
        }}
      >
        {/* Hint Button */}
        {!isLoading && conversationState.phase !== 'checkpoint' && conversationState.phase !== 'complete' && (
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <button
              onClick={handleGetHint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
                padding: 'var(--space-1) var(--space-2)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'var(--transition-base)'
              }}
              className="hover:border-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary)]"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Need a hint? (Level {currentHintLevel})
            </button>
            {conversationState.userProfile.hintsUsedTotal > 0 && (
              <span style={{ 
                marginLeft: 'var(--space-2)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-tertiary)'
              }}>
                {conversationState.userProfile.hintsUsedTotal} hints used total
              </span>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex" style={{ gap: 'var(--space-2)' }}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your answer..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--font-size-base)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
              outline: 'none'
            }}
            className="focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[rgba(239,68,68,0.1)]"
          />
          <button
            type="submit"
            disabled={!userInput.trim() || isLoading}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 600,
              background: (!userInput.trim() || isLoading) ? 'var(--color-border)' : 'var(--color-brand-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: (!userInput.trim() || isLoading) ? 'not-allowed' : 'pointer',
              transition: 'var(--transition-base)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-1)'
            }}
            className={!userInput.trim() || isLoading ? '' : 'hover:brightness-90'}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Individual message bubble
 */
function MessageBubble({ 
  message, 
  onVideoSeek 
}: { 
  message: Message; 
  onVideoSeek?: (timestamp: number) => void;
}) {
  const isAI = message.role === 'ai';
  const isCheckpoint = message.messageType === 'checkpoint';
  const isHint = message.messageType === 'hint';

  // Extract video timestamps from message
  const timestampRegex = /(\d+):(\d+)/g;
  const timestamps = [...message.content.matchAll(timestampRegex)];

  const handleTimestampClick = (match: RegExpMatchArray) => {
    const minutes = parseInt(match[1]);
    const seconds = parseInt(match[2]);
    const totalSeconds = minutes * 60 + seconds;
    onVideoSeek?.(totalSeconds);
  };

  return (
    <div 
      className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
      style={{ maxWidth: '100%' }}
    >
      <div
        style={{
          maxWidth: '85%',
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-lg)',
          background: isCheckpoint ? 'rgba(34, 197, 94, 0.1)' :
                     isHint ? 'rgba(251, 191, 36, 0.1)' :
                     isAI ? 'var(--color-bg-secondary)' : 'var(--color-brand-primary)',
          color: isAI ? 'var(--color-text-primary)' : 'white',
          border: isCheckpoint ? '1px solid rgba(34, 197, 94, 0.3)' :
                  isHint ? '1px solid rgba(251, 191, 36, 0.3)' :
                  isAI ? '1px solid var(--color-border)' : 'none'
        }}
      >
        {/* Checkpoint icon */}
        {isCheckpoint && (
          <div className="flex items-center" style={{ gap: 'var(--space-1)', marginBottom: 'var(--space-2)', color: 'rgb(34, 197, 94)' }}>
            <CheckCircle className="w-4 h-4" />
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Checkpoint Passed!</span>
          </div>
        )}

        {/* Message content */}
        <div 
          style={{ 
            fontSize: 'var(--font-size-base)',
            lineHeight: 'var(--line-height-relaxed)',
            whiteSpace: 'pre-wrap'
          }}
        >
          {message.content}
        </div>

        {/* Clickable timestamps */}
        {timestamps.length > 0 && onVideoSeek && (
          <div style={{ marginTop: 'var(--space-2)', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {timestamps.map((match, idx) => (
              <button
                key={idx}
                onClick={() => handleTimestampClick(match)}
                style={{
                  padding: 'var(--space-1) var(--space-2)',
                  fontSize: 'var(--font-size-xs)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: 'var(--color-brand-primary)',
                  border: '1px solid var(--color-brand-primary)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontFamily: 'monospace'
                }}
                className="hover:bg-[rgba(239,68,68,0.2)]"
              >
                ⏯ {match[0]}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div 
          style={{ 
            marginTop: 'var(--space-2)',
            fontSize: 'var(--font-size-xs)',
            color: isAI ? 'var(--color-text-tertiary)' : 'rgba(255,255,255,0.7)',
            textAlign: 'right'
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
