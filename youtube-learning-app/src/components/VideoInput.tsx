'use client';

import { useState, useEffect } from 'react';
import { Loader2, Sparkles, AlertCircle, FileText, Video } from 'lucide-react';

interface VideoInputProps {
  onAnalyze: (url: string) => void;
  onPDFUpload?: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function VideoInput({ onAnalyze, onPDFUpload, isLoading = false, error }: VideoInputProps) {
  const [inputMode, setInputMode] = useState<'youtube' | 'pdf'>('youtube');
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dots, setDots] = useState('.');

  // Animate dots during loading: . .. ... . .. ...
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMode === 'youtube' && url.trim() && !isLoading) {
      onAnalyze(url.trim());
    } else if (inputMode === 'pdf' && selectedFile && onPDFUpload && !isLoading) {
      onPDFUpload(selectedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    }
  };

  return (
    <div className="animate-fadeIn">
      <form onSubmit={handleSubmit}>
        <div 
          className="flex flex-col md:flex-row items-stretch"
          style={{ gap: 'var(--space-2)' }}
        >
          {/* Input Field - YouTube or PDF */}
          {inputMode === 'youtube' ? (
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
                border: `1px solid ${isFocused ? 'var(--color-border-focus)' : 'rgba(229, 229, 229, 0.5)'}`,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.75)',
                WebkitBackdropFilter: 'blur(8px)',
                backdropFilter: 'blur(8px)',
                color: 'var(--color-text-primary)',
                transition: 'var(--transition-base)',
                boxShadow: isFocused ? '0 0 0 3px rgba(255, 107, 53, 0.1)' : 'none',
                outline: 'none'
              }}
              className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            />
          ) : (
            <div style={{ flex: '1' }}>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={isLoading}
                id="pdf-upload"
                style={{
                  display: 'none'
                }}
              />
              <label
                htmlFor="pdf-upload"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--font-size-base)',
                  lineHeight: 'var(--line-height-base)',
                  border: `2px dashed ${isFocused ? 'var(--color-border-focus)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg-secondary)',
                  color: selectedFile ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'var(--transition-base)',
                  width: '100%'
                }}
                className={isLoading ? 'opacity-50' : ''}
              >
                <FileText className="w-5 h-5" />
                <span>{selectedFile ? selectedFile.name : 'Choose PDF file or drag and drop...'}</span>
              </label>
            </div>
          )}
          
          {/* Primary CTA Button - Anthropic coral style */}
          <button
            type="submit"
            disabled={(inputMode === 'youtube' && !url.trim()) || (inputMode === 'pdf' && !selectedFile) || isLoading}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 600,
              background: ((inputMode === 'youtube' && !url.trim()) || (inputMode === 'pdf' && !selectedFile) || isLoading) 
                ? 'var(--color-border)' 
                : 'var(--color-brand-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              transition: 'var(--transition-base)',
              cursor: ((inputMode === 'youtube' && !url.trim()) || (inputMode === 'pdf' && !selectedFile) || isLoading) 
                ? 'not-allowed' 
                : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              whiteSpace: 'nowrap'
            }}
            className={((inputMode === 'youtube' && !url.trim()) || (inputMode === 'pdf' && !selectedFile) || isLoading) 
              ? '' 
              : 'hover:brightness-90'}
          >
            {isLoading ? (
              <span>Analyzing{dots}</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze {inputMode === 'youtube' ? 'Video' : 'PDF'}</span>
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
            lineHeight: 'var(--line-height-base)',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(2px)',
            padding: '0.5em 1em',
            borderRadius: '8px',
            display: 'inline-block'
          }}
        >
          {inputMode === 'youtube' 
            ? 'Works with educational videos, lectures, tutorials, and documentaries'
            : 'Upload class slides, research papers, study guides, or any educational PDF'
          }
        </p>
      </form>
    </div>
  );
}