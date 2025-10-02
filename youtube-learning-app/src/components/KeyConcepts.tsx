'use client';

import { KeyConcept } from '@/types';
import { Lightbulb, Clock } from 'lucide-react';
import { formatTime } from '@/lib/youtube';
import { useState } from 'react';

interface KeyConceptsProps {
  concepts: KeyConcept[];
  onJumpToTime: (timestamp: number) => void;
  className?: string;
}

export function KeyConcepts({ concepts, onJumpToTime, className = '' }: KeyConceptsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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
        <Lightbulb className="w-5 h-5" style={{ color: 'var(--color-brand-primary)' }} />
        <h3 
          className="font-semibold"
          style={{ 
            fontSize: 'var(--font-size-xl)', 
            color: 'var(--color-text-primary)' 
          }}
        >
          Key Concepts
        </h3>
      </div>

      <div 
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ gap: 'var(--space-3)' }}
      >
        {concepts.map((concept, index) => (
          <div
            key={index}
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3)',
              transition: 'var(--transition-base)',
              cursor: 'pointer',
              background: expandedIndex === index ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)'
            }}
            className="hover:shadow-md"
          >
            <div className="flex items-start justify-between" style={{ gap: 'var(--space-2)' }}>
              <h4 
                className="font-semibold"
                style={{
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-primary)',
                  flex: '1'
                }}
              >
                {concept.term}
              </h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onJumpToTime(concept.timestamp);
                }}
                className="font-mono flex items-center flex-shrink-0"
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-brand-primary)',
                  gap: 'var(--space-1)',
                  transition: 'var(--transition-fast)'
                }}
              >
                <Clock className="w-3 h-3" />
                {formatTime(concept.timestamp)}
              </button>
            </div>
            
            <p 
              className={expandedIndex === index ? '' : 'line-clamp-2'}
              style={{
                fontSize: 'var(--font-size-xs)',
                lineHeight: 'var(--line-height-base)',
                color: 'var(--color-text-secondary)',
                marginTop: 'var(--space-2)'
              }}
            >
              {concept.definition}
            </p>

            {expandedIndex === index && concept.context && (
              <div 
                style={{
                  marginTop: 'var(--space-3)',
                  paddingTop: 'var(--space-3)',
                  borderTop: '1px solid var(--color-border)'
                }}
              >
                <p 
                  className="font-medium"
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-tertiary)',
                    marginBottom: 'var(--space-1)'
                  }}
                >
                  Context from video:
                </p>
                <p 
                  className="italic"
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    lineHeight: 'var(--line-height-base)',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  &ldquo;{concept.context}&rdquo;
                </p>
              </div>
            )}

            {expandedIndex !== index && (
              <p style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-brand-primary)',
                marginTop: 'var(--space-2)'
              }}>
                Click to expand
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
