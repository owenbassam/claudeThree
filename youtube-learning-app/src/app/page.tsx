'use client';

import { Sparkles, Brain, Zap, Target, GraduationCap } from 'lucide-react';
import { VideoInput } from '@/components/VideoInput';
import { VideoResultSocratic } from '@/components/VideoResultSocratic';
import { useVideoProcessor } from '@/hooks/useVideoProcessor';

export default function Home() {
  const { videoData, isLoading, error, processVideo, resetVideo } = useVideoProcessor();

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
      <div className="container mx-auto" style={{ padding: 'var(--space-16) var(--space-4)' }}>
        
        {/* Hero Header - Anthropic style: large, bold, minimal */}
        <div className="text-center animate-fadeIn" style={{ marginBottom: 'var(--space-16)' }}>
          <div className="flex items-center justify-center mb-8">
            <GraduationCap 
              className="h-12 w-12" 
              style={{ color: 'var(--color-brand-primary)' }}
            />
          </div>
          
          <h1 
            className="font-bold mb-6"
            style={{ 
              fontSize: 'clamp(40px, 8vw, 72px)',
              lineHeight: 'var(--line-height-tight)',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
              maxWidth: '900px',
              margin: '0 auto 32px'
            }}
          >
            Learn from YouTube with your{' '}
            <span style={{ color: 'var(--color-brand-primary)' }}>
              AI Socratic tutor
            </span>
          </h1>
          
          <p 
            style={{
              fontSize: 'var(--font-size-lg)',
              lineHeight: 'var(--line-height-loose)',
              color: 'var(--color-text-secondary)',
              maxWidth: '680px',
              marginBottom: 'var(--space-12)',
              marginLeft: 'auto',
              marginRight: 'auto',
              textAlign: 'center'
            }}
          >
            An AI tutor that asks <em>you</em> questions, not the other way around. 
            Prove your understanding through Socratic dialogue. Progress is earned, not given.
          </p>

          {/* Video Input - Primary CTA */}
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <VideoInput 
              onAnalyze={processVideo}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>

        {/* Features - Clean 3-column grid with generous spacing */}
        <div 
          className="grid md:grid-cols-3"
          style={{ 
            gap: 'var(--space-8)', 
            marginBottom: 'var(--space-16)',
            maxWidth: '1100px',
            margin: '0 auto var(--space-16)'
          }}
        >
          <div 
            className="card"
            style={{
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              transition: 'var(--transition-base)'
            }}
          >
            <div 
              className="inline-flex items-center justify-center rounded-lg mb-4"
              style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 107, 53, 0.1)'
              }}
            >
              <Brain className="h-6 w-6" style={{ color: 'var(--color-brand-primary)' }} />
            </div>
            <h3 
              className="font-semibold mb-3"
              style={{ 
                fontSize: 'var(--font-size-xl)', 
                color: 'var(--color-text-primary)' 
              }}
            >
              Socratic Teaching
            </h3>
            <p style={{ 
              fontSize: 'var(--font-size-base)', 
              lineHeight: 'var(--line-height-base)',
              color: 'var(--color-text-secondary)' 
            }}>
              An AI tutor that guides you through questions, not lectures. 
              Discover concepts through dialogue and critical thinking.
            </p>
          </div>
          
          <div 
            className="card"
            style={{
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              transition: 'var(--transition-base)'
            }}
          >
            <div 
              className="inline-flex items-center justify-center rounded-lg mb-4"
              style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 107, 53, 0.1)'
              }}
            >
              <Zap className="h-6 w-6" style={{ color: 'var(--color-brand-primary)' }} />
            </div>
            <h3 
              className="font-semibold mb-3"
              style={{ 
                fontSize: 'var(--font-size-xl)', 
                color: 'var(--color-text-primary)' 
              }}
            >
              Progress Gating
            </h3>
            <p style={{ 
              fontSize: 'var(--font-size-base)', 
              lineHeight: 'var(--line-height-base)',
              color: 'var(--color-text-secondary)' 
            }}>
              Can't skip ahead until you prove understanding. Each chapter unlocks only 
              when you demonstrate mastery of the previous one.
            </p>
          </div>
          
          <div 
            className="card"
            style={{
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              transition: 'var(--transition-base)'
            }}
          >
            <div 
              className="inline-flex items-center justify-center rounded-lg mb-4"
              style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255, 107, 53, 0.1)'
              }}
            >
              <Target className="h-6 w-6" style={{ color: 'var(--color-brand-primary)' }} />
            </div>
            <h3 
              className="font-semibold mb-3"
              style={{ 
                fontSize: 'var(--font-size-xl)', 
                color: 'var(--color-text-primary)' 
              }}
            >
              Adaptive Difficulty
            </h3>
            <p style={{ 
              fontSize: 'var(--font-size-base)', 
              lineHeight: 'var(--line-height-base)',
              color: 'var(--color-text-secondary)' 
            }}>
              The AI adjusts question difficulty based on your performance. 
              Struggling? Get hints. Excelling? Face deeper challenges.
            </p>
          </div>
        </div>

        {/* Footer - Subtle, clean */}
        <div 
          className="text-center"
          style={{ 
            marginTop: 'var(--space-16)',
            paddingTop: 'var(--space-8)',
            borderTop: '1px solid var(--color-border)'
          }}
        >
          <p style={{ 
            fontSize: 'var(--font-size-xs)', 
            color: 'var(--color-text-tertiary)' 
          }}>
            Powered by Claude 4.5 Sonnet • Built for effective learning
          </p>
        </div>
      </div>
    </div>
  );
}
