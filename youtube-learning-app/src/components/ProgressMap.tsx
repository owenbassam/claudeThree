/**
 * ProgressMap Component
 * 
 * Visual learning path showing locked/unlocked chapters
 */

'use client';

import { Lock, Unlock, CheckCircle, Play } from 'lucide-react';
import { ConversationState, LearningAnalysis } from '@/types';

interface ProgressMapProps {
  conversationState: ConversationState;
  analysis: LearningAnalysis;
  onChapterClick?: (chapterIndex: number) => void;
}

export function ProgressMap({ 
  conversationState, 
  analysis,
  onChapterClick 
}: ProgressMapProps) {
  const getChapterStatus = (chapterIndex: number): 'locked' | 'current' | 'unlocked' | 'completed' => {
    // Check completion first - even if it's the current chapter, if it has a score, it's completed
    if (conversationState.chapterScores[chapterIndex] !== undefined) {
      return 'completed';
    }
    
    // Then check if it's the current active chapter
    if (chapterIndex === conversationState.currentChapterIndex) {
      return 'current';
    }
    
    // Then check if it's unlocked but not started
    if (conversationState.unlockedChapters.includes(chapterIndex)) {
      return 'unlocked';
    }
    
    // Otherwise it's locked
    return 'locked';
  };

  const getChapterScore = (chapterIndex: number): number | null => {
    return conversationState.chapterScores[chapterIndex] ?? null;
  };

  const completedChapters = Object.keys(conversationState.chapterScores).length;
  const overallProgress = (completedChapters / analysis.chapters.length) * 100;

  return (
    <div 
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(229, 229, 229, 0.5)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Mountain Background */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/sisyphus-mountain.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.15,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Content with higher z-index */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ 
            fontSize: 'var(--font-size-lg)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)'
          }}>
            Learning Progress
          </h2>
          
          {/* Overall Progress */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-1)' }}>
              <span style={{ 
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)'
              }}>
                {completedChapters} of {analysis.chapters.length} chapters complete
              </span>
              <span style={{ 
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-brand-primary)'
              }}>
                {Math.round(overallProgress)}%
              </span>
            </div>
            <div 
              style={{
                height: '8px',
                background: 'rgba(0, 0, 0, 0.1)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden'
              }}
            >
              <div 
                style={{
                  height: '100%',
                  width: `${overallProgress}%`,
                  background: 'var(--color-brand-primary)',
                  transition: 'width 0.5s ease'
                }}
              />
            </div>
          </div>
        </div>

        {/* Chapter Nodes */}
        <div 
          className="flex flex-col"
          style={{ gap: 'var(--space-3)' }}
        >
          {analysis.chapters.map((chapter, index) => {
            const status = getChapterStatus(index);
            const score = getChapterScore(index);

            return (
              <ChapterNode
                key={index}
                chapter={chapter}
                index={index}
                status={status}
                score={score}
                isClickable={false}
                onClick={() => {}}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div 
          style={{
            marginTop: 'var(--space-6)',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            display: 'flex',
            gap: 'var(--space-4)',
            flexWrap: 'wrap',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-tertiary)'
          }}
        >
          <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
            <CheckCircle className="w-3.5 h-3.5" style={{ color: 'rgb(34, 197, 94)' }} />
            <span>Completed</span>
          </div>
          <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
            <Play className="w-3.5 h-3.5" style={{ color: 'var(--color-brand-primary)' }} />
            <span>Current</span>
          </div>
          <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
            <Unlock className="w-3.5 h-3.5" style={{ color: 'var(--color-text-secondary)' }} />
            <span>Unlocked</span>
          </div>
          <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
            <Lock className="w-3.5 h-3.5" style={{ color: 'var(--color-text-tertiary)' }} />
            <span>Locked</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual chapter node
 */
function ChapterNode({
  chapter,
  index,
  status,
  score,
  isClickable,
  onClick
}: {
  chapter: any;
  index: number;
  status: 'locked' | 'current' | 'unlocked' | 'completed';
  score: number | null;
  isClickable: boolean;
  onClick?: () => void;
}) {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'rgb(34, 197, 94)';
      case 'current':
        return 'var(--color-brand-primary)';
      case 'unlocked':
        return 'var(--color-text-secondary)';
      case 'locked':
        return 'var(--color-text-tertiary)';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'current':
        return <Play className="w-5 h-5" />;
      case 'unlocked':
        return <Unlock className="w-5 h-5" />;
      case 'locked':
        return <Lock className="w-5 h-5" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'rgb(34, 197, 94)';
    if (score >= 70) return 'var(--color-brand-primary)';
    return 'rgb(251, 191, 36)';
  };

  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        background: status === 'current' ? 'rgba(239, 68, 68, 0.05)' : 'var(--color-bg-secondary)',
        border: status === 'current' ? '2px solid var(--color-brand-primary)' : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        cursor: isClickable ? 'pointer' : 'not-allowed',
        opacity: status === 'locked' ? 0.5 : 1,
        transition: 'var(--transition-base)',
        width: '100%',
        textAlign: 'left'
      }}
      className={isClickable ? 'hover:border-[var(--color-brand-primary)]' : ''}
    >
      {/* Status Icon */}
      <div 
        style={{ 
          color: getStatusColor(),
          flexShrink: 0
        }}
      >
        {getStatusIcon()}
      </div>

      {/* Chapter Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: '2px' }}>
          <span style={{ 
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-tertiary)',
            fontWeight: 600
          }}>
            Chapter {index + 1}
          </span>
          {score !== null && (
            <span 
              style={{ 
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: getScoreColor(score),
                padding: '2px 6px',
                background: `${getScoreColor(score)}20`,
                borderRadius: 'var(--radius-sm)'
              }}
            >
              {score}/100
            </span>
          )}
        </div>
        <h3 
          style={{ 
            fontSize: 'var(--font-size-base)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {chapter.title}
        </h3>
        <p 
          style={{ 
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-tertiary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {chapter.summary}
        </p>
      </div>

      {/* Arrow indicator for clickable items */}
      {isClickable && (
        <div style={{ 
          color: 'var(--color-text-tertiary)',
          opacity: 0.5,
          flexShrink: 0
        }}>
          →
        </div>
      )}
    </button>
  );
}
