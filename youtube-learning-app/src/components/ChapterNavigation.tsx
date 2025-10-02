'use client';

import { Chapter } from '@/types';
import { Clock, CheckCircle } from 'lucide-react';
import { formatTime } from '@/lib/youtube';

interface ChapterNavigationProps {
  chapters: Chapter[];
  currentTime: number;
  onJumpToTime: (timestamp: number) => void;
  className?: string;
}

export function ChapterNavigation({ 
  chapters, 
  currentTime, 
  onJumpToTime,
  className = ''
}: ChapterNavigationProps) {
  const getCurrentChapterIndex = () => {
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (currentTime >= chapters[i].startTime) {
        return i;
      }
    }
    return 0;
  };

  const currentChapterIndex = getCurrentChapterIndex();

  return (
    <div 
      className={className}
      style={{
        background: 'var(--color-bg-primary)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        <Clock className="w-5 h-5" style={{ color: 'var(--color-brand-primary)' }} />
        <h3 
          className="font-semibold"
          style={{ 
            fontSize: 'var(--font-size-xl)', 
            color: 'var(--color-text-primary)' 
          }}
        >
          Chapters
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {chapters.map((chapter, index) => {
          const isActive = index === currentChapterIndex;
          const isPast = currentTime > chapter.startTime;
          
          return (
            <button
              key={index}
              onClick={() => onJumpToTime(chapter.startTime)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: isActive 
                  ? '2px solid var(--color-brand-primary)' 
                  : '1px solid var(--color-border)',
                background: isActive 
                  ? 'rgba(255, 107, 53, 0.05)' 
                  : isPast 
                  ? 'var(--color-bg-secondary)' 
                  : 'var(--color-bg-primary)',
                transition: 'var(--transition-base)',
                cursor: 'pointer'
              }}
              className="hover:shadow-md"
            >
              <div className="flex items-start justify-between" style={{ gap: 'var(--space-3)' }}>
                <div style={{ flex: '1' }}>
                  <div className="flex items-center" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                    {isPast && !isActive && (
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-success)' }} />
                    )}
                    <h4 
                      className="font-semibold"
                      style={{
                        fontSize: 'var(--font-size-base)',
                        color: isActive ? 'var(--color-brand-primary)' : 'var(--color-text-primary)'
                      }}
                    >
                      {chapter.title}
                    </h4>
                  </div>
                  <p style={{
                    fontSize: 'var(--font-size-xs)',
                    lineHeight: 'var(--line-height-base)',
                    color: isActive ? 'var(--color-text-secondary)' : 'var(--color-text-tertiary)'
                  }}>
                    {chapter.summary}
                  </p>
                </div>
                <div 
                  className="font-mono flex-shrink-0"
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--color-brand-primary)' : 'var(--color-text-tertiary)'
                  }}
                >
                  {formatTime(chapter.startTime)}
                </div>
              </div>

              {isActive && (
                <div 
                  className="overflow-hidden"
                  style={{
                    marginTop: 'var(--space-2)',
                    height: '4px',
                    background: 'rgba(255, 107, 53, 0.2)',
                    borderRadius: '2px'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      background: 'var(--color-brand-primary)',
                      transition: 'var(--transition-base)',
                      width: `${
                        index < chapters.length - 1
                          ? ((currentTime - chapter.startTime) / 
                             (chapters[index + 1].startTime - chapter.startTime)) * 100
                          : 100
                      }%`
                    }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Chapter Progress Summary */}
      <div 
        style={{
          marginTop: 'var(--space-6)',
          paddingTop: 'var(--space-4)',
          borderTop: '1px solid var(--color-border)'
        }}
      >
        <div className="flex items-center justify-between" style={{ fontSize: 'var(--font-size-xs)' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>Progress</span>
          <span 
            className="font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Chapter {currentChapterIndex + 1} of {chapters.length}
          </span>
        </div>
        <div 
          className="overflow-hidden"
          style={{
            marginTop: 'var(--space-2)',
            height: '6px',
            background: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'var(--color-brand-primary)',
              transition: 'var(--transition-base)',
              width: `${((currentChapterIndex + 1) / chapters.length) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}
