'use client';

import { useEffect, useState } from 'react';

export function StreakCounter() {
  const [streak, setStreak] = useState(0);

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

  return (
    <div 
      className="streak-counter"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        padding: '12px 20px',
        borderRadius: '12px',
        border: '2px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <span style={{ fontSize: '24px' }}>🔥</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ 
          fontSize: '24px', 
          fontWeight: 'bold',
          color: 'var(--color-brand-primary)',
          lineHeight: '1'
        }}>
          {streak}
        </span>
        <span style={{ 
          fontSize: '11px', 
          color: 'var(--color-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          lineHeight: '1'
        }}>
          Streak
        </span>
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
  
  // Create overlay to dim content
  const overlay = document.createElement('div');
  overlay.id = 'streak-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.3);
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
  
  // Create overlay to dim content
  const overlay = document.createElement('div');
  overlay.id = 'streak-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.3);
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
