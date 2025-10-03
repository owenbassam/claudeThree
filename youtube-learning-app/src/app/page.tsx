'use client';

import { Sparkles, Brain, Zap, Target, GraduationCap } from 'lucide-react';
import { VideoInput } from '@/components/VideoInput';
import { VideoResultSocratic } from '@/components/VideoResultSocratic';
import { useVideoProcessor } from '@/hooks/useVideoProcessor';

export default function Home() {
  const { videoData, isLoading, error, processVideo, processPDF, resetVideo } = useVideoProcessor();

  // Show Socratic learning interface if we have processed data
  if (videoData) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-bg-secondary)' }}>
        <div style={{ padding: 'var(--space-8) 0' }}>
          <VideoResultSocratic videoData={videoData} onReset={resetVideo} />
        </div>
      </div>
    );
  }

  // Show landing page with video input - Anthropic style
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      {/* Hero Section - Large, centered, generous whitespace */}
      <div className="container mx-auto" style={{ padding: 'var(--space-12) var(--space-4) var(--space-8)' }}>
        
        {/* Hero Header - Anthropic style: large, bold, minimal */}
        <div className="text-center animate-fadeIn" style={{ marginBottom: 'var(--space-12)' }}>
          <div className="flex items-center justify-center" style={{ marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '64px' }}>🪨</span>
          </div>
          
          <h1 
            className="font-bold"
            style={{ 
              fontSize: 'clamp(40px, 8vw, 72px)',
              lineHeight: 'var(--line-height-tight)',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
              maxWidth: '900px',
              margin: '0 auto',
              marginBottom: 'var(--space-6)'
            }}
          >
            Learn with your{' '}
            <span style={{ color: 'var(--color-brand-primary)' }}>
              AI Socratic tutor
            </span>
          </h1>
          
          <p 
            style={{
              fontSize: 'var(--font-size-lg)',
              lineHeight: 'var(--line-height-loose)',
              color: 'var(--color-text-secondary)',
              maxWidth: '720px',
              marginBottom: 'var(--space-8)',
              marginLeft: 'auto',
              marginRight: 'auto',
              textAlign: 'center'
            }}
          >
            An AI tutor that guides through questions, not answers. Like Sisyphus pushing the boulder, 
            every correct answer rolls you higher—but you'll never reach the top.
          </p>

          {/* Video Input - Primary CTA */}
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <VideoInput 
              onAnalyze={processVideo}
              onPDFUpload={processPDF}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>

        {/* Features - Clean 3-column grid with generous spacing */}
        <div 
          className="grid md:grid-cols-3 gap-4"
          style={{ 
            marginTop: 'var(--space-12)',
            marginBottom: 'var(--space-8)',
            maxWidth: '1100px',
            margin: 'var(--space-12) auto 0'
          }}
        >
          <div 
            className="card"
            style={{
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              transition: 'var(--transition-base)',
              height: 'fit-content'
            }}
          >
            <div 
              className="inline-flex items-center justify-center rounded-lg"
              style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 107, 53, 0.1)',
                marginBottom: 'var(--space-4)'
              }}
            >
              <Brain className="h-6 w-6" style={{ color: 'var(--color-brand-primary)' }} />
            </div>
            <h3 
              className="font-semibold"
              style={{ 
                fontSize: 'var(--font-size-xl)', 
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)'
              }}
            >
              Socratic Dialogue
            </h3>
            <p style={{ 
              fontSize: 'var(--font-size-base)', 
              lineHeight: 'var(--line-height-base)',
              color: 'var(--color-text-secondary)' 
            }}>
              The AI asks you questions, not the other way around. 
              Answer correctly to push your boulder higher. Fail, and it rolls back down.
            </p>
          </div>
          
          <div 
            className="card"
            style={{
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              transition: 'var(--transition-base)',
              height: 'fit-content'
            }}
          >
            <div 
              className="inline-flex items-center justify-center rounded-lg"
              style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 107, 53, 0.1)',
                marginBottom: 'var(--space-4)'
              }}
            >
              <Zap className="h-6 w-6" style={{ color: 'var(--color-brand-primary)' }} />
            </div>
            <h3 
              className="font-semibold"
              style={{ 
                fontSize: 'var(--font-size-xl)', 
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)'
              }}
            >
              Endless Ascent
            </h3>
            <p style={{ 
              fontSize: 'var(--font-size-base)', 
              lineHeight: 'var(--line-height-base)',
              color: 'var(--color-text-secondary)' 
            }}>
              You'll never reach the top—there's always more to learn. 
              Each correct answer pushes you higher, but perfection remains out of reach.
            </p>
          </div>
          
          <div 
            className="card"
            style={{
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              transition: 'var(--transition-base)',
              height: 'fit-content'
            }}
          >
            <div 
              className="inline-flex items-center justify-center rounded-lg"
              style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 107, 53, 0.1)',
                marginBottom: 'var(--space-4)'
              }}
            >
              <Target className="h-6 w-6" style={{ color: 'var(--color-brand-primary)' }} />
            </div>
            <h3 
              className="font-semibold"
              style={{ 
                fontSize: 'var(--font-size-xl)', 
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)'
              }}
            >
              Adaptive Challenge
            </h3>
            <p style={{ 
              fontSize: 'var(--font-size-base)', 
              lineHeight: 'var(--line-height-base)',
              color: 'var(--color-text-secondary)' 
            }}>
              The hill grows steeper as you climb. AI adjusts difficulty based on performance—
              easier when you struggle, harder when you excel.
            </p>
          </div>
        </div>

        {/* Footer - Subtle, clean */}
        <div 
          className="text-center"
          style={{ 
            marginTop: 'var(--space-12)',
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--color-border)'
          }}
        >
          <p style={{ 
            fontSize: 'var(--font-size-xs)', 
            color: 'var(--color-text-tertiary)' 
          }}>
            Powered by Claude 4.5 Sonnet
          </p>
        </div>
      </div>
    </div>
  );
}
