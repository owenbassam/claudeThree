'use client';

import { useState } from 'react';
import { Flashcard as FlashcardType } from '@/types';
import { X, ChevronLeft, ChevronRight, CheckCircle2, Download } from 'lucide-react';
import { Flashcard } from './Flashcard';
import { formatTime } from '@/lib/youtube';

interface FlashcardModalProps {
  flashcards: FlashcardType[];
  isOpen: boolean;
  onClose: () => void;
  onJumpToTime?: (timestamp: number) => void;
}

export function FlashcardModal({ flashcards, isOpen, onClose, onJumpToTime }: FlashcardModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resetFlip, setResetFlip] = useState(false);

  if (!isOpen || flashcards.length === 0) return null;

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setResetFlip(true);
      setTimeout(() => setResetFlip(false), 50);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setResetFlip(true);
      setTimeout(() => setResetFlip(false), 50);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleExport = () => {
    // Create text content for export
    let content = '# Flashcards\n\n';
    flashcards.forEach((card, index) => {
      content += `## Card ${index + 1}\n\n`;
      content += `**Front:** ${card.front}\n\n`;
      content += `**Back:** ${card.back}\n\n`;
      if (card.timestamp !== undefined) {
        content += `**Timestamp:** ${formatTime(card.timestamp)}\n\n`;
      }
      content += '---\n\n';
    });

    // Create and download file
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        padding: 'var(--space-4)',
        backdropFilter: 'blur(4px)',
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          maxWidth: '700px',
          width: '100%',
          margin: 'var(--space-8) auto',
          maxHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: 'var(--space-6)',
            borderBottom: '1px solid var(--color-border)',
            flexShrink: 0
          }}
        >
          <div>
            <h2
              className="font-bold"
              style={{
                fontSize: 'var(--font-size-2xl)',
                color: 'var(--color-text-primary)'
              }}
            >
              Study Flashcards
            </h2>
            <p
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                marginTop: 'var(--space-1)'
              }}
            >
              Card {currentIndex + 1} of {flashcards.length}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              onClick={handleExport}
              style={{
                color: 'var(--color-text-secondary)',
                transition: 'var(--transition-fast)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 'var(--space-1)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-1)'
              }}
              className="hover:text-[var(--color-brand-primary)]"
              title="Export flashcards"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              style={{
                color: 'var(--color-text-tertiary)',
                transition: 'var(--transition-fast)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 'var(--space-1)'
              }}
              className="hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            height: '4px',
            background: 'var(--color-bg-tertiary)'
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--color-brand-primary)',
              transition: 'width 0.3s ease'
            }}
          />
        </div>

        {/* Content - Scrollable */}
        <div 
          style={{ 
            padding: 'var(--space-6)',
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Flashcard */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <Flashcard flashcard={currentCard} resetFlip={resetFlip} />
          </div>

          {/* Card info */}
          <div
            className="flex items-center justify-between"
            style={{
              marginBottom: 'var(--space-4)',
              padding: 'var(--space-3)',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <button
              onClick={() => onJumpToTime?.(currentCard.timestamp)}
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-brand-primary)',
                fontFamily: 'monospace',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'var(--transition-fast)'
              }}
              className="hover:opacity-80"
            >
              ⏱ {formatTime(currentCard.timestamp)}
            </button>

          </div>
        </div>

        {/* Footer - Navigation (Sticky) */}
        <div 
          style={{
            padding: 'var(--space-6)',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-bg-primary)',
            flexShrink: 0
          }}
        >
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center"
              style={{
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--font-size-base)',
                color: currentIndex === 0 ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                transition: 'var(--transition-base)',
                cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                opacity: currentIndex === 0 ? 0.5 : 1
              }}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
              className="flex items-center"
              style={{
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 'var(--font-size-base)',
                fontWeight: 600,
                color: 'white',
                background: currentIndex === flashcards.length - 1 
                  ? 'var(--color-border)' 
                  : 'var(--color-brand-primary)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                transition: 'var(--transition-base)',
                cursor: currentIndex === flashcards.length - 1 ? 'not-allowed' : 'pointer'
              }}
            >
              {currentIndex === flashcards.length - 1 ? 'Complete!' : 'Next'}
              {currentIndex < flashcards.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
