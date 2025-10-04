'use client';

import { useEffect, useState } from 'react';

export function StreakCounter() {
  const [streak, setStreak] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverOverlay, setHoverOverlay] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    // Load streak from localStorage on mount
    const savedStreak = localStorage.getItem('answerStreak');
    if (savedStreak) {
      setStreak(parseInt(savedStreak, 10));
    }

    // Listen for streak updates
    const handleStreakUpdate = (event: CustomEvent<{ streak: number }>) => {
      setStreak(event.detail.streak);
    };

    window.addEventListener('streakUpdate' as any, handleStreakUpdate);

    return () => {
      window.removeEventListener('streakUpdate' as any, handleStreakUpdate);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    
    // Create hover overlay with blur
    const overlay = document.createElement('div');
    overlay.id = 'streak-hover-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      backdrop-filter: blur(8px);
      z-index: 50000;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);
    setHoverOverlay(overlay);

    // Add hover class to bring PNGs to front
    document.body.classList.add('streak-hover');
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    
    // Remove hover class
    document.body.classList.remove('streak-hover');

    // Remove overlay
    if (hoverOverlay) {
      hoverOverlay.remove();
      setHoverOverlay(null);
    }
  };

  // Calculate elevation (50 meters per correct answer)
  const metersPerAnswer = 50;
  const currentElevation = streak * metersPerAnswer;

  return (
    <div 
      className="mountain-progress"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        padding: '20px 24px',
        borderRadius: '12px',
        border: `2px solid ${isHovered ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
        boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.08)',
        zIndex: 100000,
        fontFamily: 'var(--font-sans)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minWidth: '180px',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {/* Header */}
      <div style={{ 
        marginBottom: '16px'
      }}>
        <span style={{ 
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          letterSpacing: '0.3px'
        }}>
          Current Elevation
        </span>
      </div>

      {/* Main elevation display */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '8px',
        marginBottom: '8px'
      }}>
        <span style={{ 
          fontSize: '40px', 
          fontWeight: '700',
          color: 'var(--color-brand-primary)',
          lineHeight: '1',
          letterSpacing: '-0.02em'
        }}>
          {currentElevation.toLocaleString()}
        </span>
        <span style={{ 
          fontSize: '16px', 
          color: 'var(--color-text-secondary)',
          fontWeight: '500',
          letterSpacing: '0.3px'
        }}>
          m
        </span>
      </div>

      {/* Correct answers count */}
      <div style={{
        fontSize: '13px',
        color: 'var(--color-text-tertiary)',
        marginBottom: '16px',
        fontWeight: '500'
      }}>
        {streak} {streak === 1 ? 'answer' : 'answers'} correct
      </div>

      {/* Divider */}
      <div style={{
        width: '100%',
        height: '1px',
        background: 'var(--color-border)',
        marginBottom: '12px'
      }} />

      {/* Hover hint */}
      <div style={{
        fontSize: '11px',
        color: 'var(--color-text-muted)',
        textAlign: 'center',
        fontWeight: '500',
        letterSpacing: '0.5px',
        opacity: isHovered ? 1 : 0.6,
        transition: 'opacity 0.2s ease'
      }}>
        {isHovered ? 'Watch the climb' : 'Hover to reveal'}
      </div>
    </div>
  );
}

// Helper functions to manage streak
export function incrementStreak() {
  const currentStreak = parseInt(localStorage.getItem('answerStreak') || '0', 10);
  const newStreak = currentStreak + 1;
  localStorage.setItem('answerStreak', newStreak.toString());
  
  // Dispatch custom event to update UI
  window.dispatchEvent(new CustomEvent('streakUpdate', { detail: { streak: newStreak } }));
  
  // Create overlay to blur content
  const overlay = document.createElement('div');
  overlay.id = 'streak-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    backdrop-filter: blur(8px);
    z-index: 50000;
    pointer-events: none;
  `;
  document.body.appendChild(overlay);
  
  // Temporarily play background animations for celebration and bring to front
  document.body.classList.remove('video-loaded');
  document.body.classList.add('streak-celebrating');
  setTimeout(() => {
    document.body.classList.remove('streak-celebrating');
    document.body.classList.add('video-loaded');
    overlay.remove();
  }, 3000); // Play for 3 seconds
  
  return newStreak;
}

export function resetStreak() {
  localStorage.setItem('answerStreak', '0');
  
  // Dispatch custom event to update UI
  window.dispatchEvent(new CustomEvent('streakUpdate', { detail: { streak: 0 } }));
  
  // Create overlay to blur content
  const overlay = document.createElement('div');
  overlay.id = 'streak-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    backdrop-filter: blur(8px);
    z-index: 50000;
    pointer-events: none;
  `;
  document.body.appendChild(overlay);
  
  // Temporarily play reverse animations to show the boulder rolling back down
  document.body.classList.remove('video-loaded');
  document.body.classList.add('streak-reset');
  setTimeout(() => {
    document.body.classList.remove('streak-reset');
    document.body.classList.add('video-loaded');
    overlay.remove();
  }, 3000); // Play reverse for 3 seconds
  
  return 0;
}

export function getStreak() {
  return parseInt(localStorage.getItem('answerStreak') || '0', 10);
}
