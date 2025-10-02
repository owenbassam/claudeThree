'use client';

import { useState, useEffect } from 'react';
import { Flashcard as FlashcardType } from '@/types';

interface FlashcardProps {
  flashcard: FlashcardType;
  onFlip?: (isFlipped: boolean) => void;
  resetFlip?: boolean;
}

export function Flashcard({ flashcard, onFlip, resetFlip }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when resetFlip prop changes
  useEffect(() => {
    if (resetFlip) {
      setIsFlipped(false);
    }
  }, [resetFlip, flashcard.id]);

  const handleFlip = () => {
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    onFlip?.(newFlipped);
  };

  return (
    <div
      onClick={handleFlip}
      style={{
        width: '100%',
        height: '320px',
        perspective: '1000px',
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transition: 'transform 0.6s',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front of card */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 'var(--space-6)',
            background: 'var(--color-bg-primary)',
            border: '2px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 'var(--space-4)',
              fontWeight: 600
            }}
          >
            {flashcard.category}
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              textAlign: 'center',
              lineHeight: 'var(--line-height-tight)',
              marginBottom: 'var(--space-4)'
            }}
          >
            {flashcard.front}
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-tertiary)',
              marginTop: 'auto',
              paddingTop: 'var(--space-4)'
            }}
          >
            Click to reveal →
          </div>
        </div>

        {/* Back of card */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 'var(--space-6)',
            background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, #DC2626 100%)',
            border: '2px solid var(--color-brand-primary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            color: 'white'
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 'var(--space-4)',
              fontWeight: 600,
              opacity: 0.9
            }}
          >
            Answer
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 500,
              textAlign: 'center',
              lineHeight: 'var(--line-height-base)',
              marginBottom: 'var(--space-2)'
            }}
          >
            {flashcard.back}
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              opacity: 0.8,
              marginTop: 'auto',
              paddingTop: 'var(--space-4)'
            }}
          >
            Click to flip back ↻
          </div>
        </div>
      </div>
    </div>
  );
}
