'use client';

import { useState } from 'react';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface VideoInputProps {
  onAnalyze: (url: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function VideoInput({ onAnalyze, isLoading = false, error }: VideoInputProps) {
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onAnalyze(url.trim());
    }
  };

  return (
    <div className="animate-fadeIn">
      <form onSubmit={handleSubmit}>
        <div 
          className="flex flex-col md:flex-row items-stretch"
          style={{ gap: 'var(--space-2)' }}
        >
          {/* Input Field - Anthropic style */}
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Paste any YouTube URL..."
            disabled={isLoading}
            style={{
              flex: '1',
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--font-size-base)',
              lineHeight: 'var(--line-height-base)',
              border: `1px solid ${isFocused ? 'var(--color-border-focus)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
              transition: 'var(--transition-base)',
              boxShadow: isFocused ? '0 0 0 3px rgba(255, 107, 53, 0.1)' : 'none',
              outline: 'none'
            }}
            className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          />
          
          {/* Primary CTA Button - Anthropic coral style */}
          <button
            type="submit"
            disabled={!url.trim() || isLoading}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 600,
              background: (!url.trim() || isLoading) ? 'var(--color-border)' : 'var(--color-brand-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              transition: 'var(--transition-base)',
              cursor: (!url.trim() || isLoading) ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              whiteSpace: 'nowrap'
            }}
            className={!url.trim() || isLoading ? '' : 'hover:brightness-90'}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Video</span>
              </>
            )}
          </button>
        </div>
        
        {/* Error Message */}
        {error && (
          <div 
            className="flex items-start"
            style={{
              marginTop: 'var(--space-2)',
              padding: 'var(--space-2)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-md)',
              gap: 'var(--space-2)'
            }}
          >
            <AlertCircle 
              className="w-4 h-4 flex-shrink-0 mt-0.5" 
              style={{ color: 'var(--color-error)' }}
            />
            <span style={{ 
              fontSize: 'var(--font-size-xs)', 
              color: 'var(--color-error)',
              lineHeight: 'var(--line-height-base)'
            }}>
              {error}
            </span>
          </div>
        )}
        
        {/* Helper Text */}
        <p 
          className="text-center"
          style={{ 
            marginTop: 'var(--space-2)',
            fontSize: 'var(--font-size-xs)', 
            color: 'var(--color-text-tertiary)',
            lineHeight: 'var(--line-height-base)'
          }}
        >
          Works with educational content, lectures, tutorials, and documentaries
        </p>
      </form>
    </div>
  );
}