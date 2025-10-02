'use client';

import { useState } from 'react';
import { LearningAnalysis } from '@/types';
import { Brain, Clock, Target, BookOpen, CheckCircle2, AlertCircle, Play } from 'lucide-react';
import { formatTime } from '@/lib/youtube';
import { QuizModal } from './QuizModal';

interface AnalysisResultProps {
  analysis: LearningAnalysis;
  isLoading?: boolean;
  onJumpToTime?: (timestamp: number) => void;
}

export function AnalysisResult({ analysis, isLoading = false, onJumpToTime }: AnalysisResultProps) {
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  if (isLoading) {
    return (
      <div 
        style={{
          background: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div className="flex items-center" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <Brain className="w-6 h-6 animate-pulse" style={{ color: 'var(--color-brand-primary)' }} />
          <h3 
            className="font-semibold"
            style={{ 
              fontSize: 'var(--font-size-xl)', 
              color: 'var(--color-text-primary)' 
            }}
          >
            Analyzing with Claude AI...
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div className="h-4 animate-pulse" style={{ background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)' }}></div>
          <div className="h-4 animate-pulse" style={{ background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)', width: '75%' }}></div>
          <div className="h-4 animate-pulse" style={{ background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)', width: '50%' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Overview */}
      <div 
        style={{
          background: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div className="flex items-center" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <Brain className="w-6 h-6" style={{ color: 'var(--color-brand-primary)' }} />
          <h3 
            className="font-semibold"
            style={{ 
              fontSize: 'var(--font-size-xl)', 
              color: 'var(--color-text-primary)' 
            }}
          >
            AI Analysis Complete
          </h3>
        </div>
        
        <div 
          className="grid md:grid-cols-3"
          style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}
        >
          <div 
            className="text-center"
            style={{
              padding: 'var(--space-4)',
              background: 'rgba(255, 107, 53, 0.1)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div 
              className="font-bold"
              style={{ 
                fontSize: 'var(--font-size-2xl)', 
                color: 'var(--color-brand-primary)' 
              }}
            >
              {analysis.chapters.length}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              Chapters
            </div>
          </div>
          <div 
            className="text-center"
            style={{
              padding: 'var(--space-4)',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div 
              className="font-bold"
              style={{ 
                fontSize: 'var(--font-size-2xl)', 
                color: 'var(--color-success)' 
              }}
            >
              {analysis.keyConcepts.length}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              Key Concepts
            </div>
          </div>
          <div 
            className="text-center"
            style={{
              padding: 'var(--space-4)',
              background: 'rgba(107, 140, 174, 0.1)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div 
              className="font-bold"
              style={{ 
                fontSize: 'var(--font-size-2xl)', 
                color: 'var(--color-accent-blue)' 
              }}
            >
              {analysis.quizQuestions.length}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              Quiz Questions
            </div>
          </div>
        </div>

        <p 
          style={{ 
            fontSize: 'var(--font-size-base)',
            lineHeight: 'var(--line-height-base)',
            color: 'var(--color-text-secondary)', 
            marginBottom: 'var(--space-4)' 
          }}
        >
          {analysis.overallSummary}
        </p>
        
        <div 
          className="flex flex-wrap items-center"
          style={{ 
            gap: 'var(--space-4)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-tertiary)'
          }}
        >
          <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
            <Clock className="w-4 h-4" />
            <span>~{analysis.estimatedReadingTime} min read</span>
          </div>
          <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
            <Target className="w-4 h-4" />
            <span className="capitalize">{analysis.difficultyLevel} level</span>
          </div>
          <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
            <BookOpen className="w-4 h-4" />
            <span>{analysis.topics.join(', ')}</span>
          </div>
        </div>
      </div>

      {/* Quiz Questions Preview */}
      <div 
        style={{
          background: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <h3 
          className="font-semibold flex items-center"
          style={{ 
            fontSize: 'var(--font-size-xl)', 
            color: 'var(--color-text-primary)',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-4)'
          }}
        >
          <Target className="w-5 h-5" style={{ color: 'var(--color-brand-primary)' }} />
          Practice Questions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {analysis.quizQuestions.slice(0, 1).map((question, index) => (
            <div 
              key={index} 
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                transition: 'var(--transition-base)'
              }}
              className="hover:shadow-md"
            >
              <div 
                className="flex justify-between items-start"
                style={{ marginBottom: 'var(--space-3)', gap: 'var(--space-3)' }}
              >
                <h4 
                  className="font-medium"
                  style={{ 
                    fontSize: 'var(--font-size-base)',
                    color: 'var(--color-text-primary)',
                    flex: '1'
                  }}
                >
                  {question.question}
                </h4>
                <div className="flex items-center flex-shrink-0" style={{ gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                  <span className="font-mono" style={{ color: 'var(--color-brand-primary)' }}>
                    {formatTime(question.timestamp)}
                  </span>
                  <span 
                    style={{
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: question.difficulty === 'easy' ? 'rgba(34, 197, 94, 0.1)' :
                                question.difficulty === 'medium' ? 'rgba(251, 191, 36, 0.1)' :
                                'rgba(239, 68, 68, 0.1)',
                      color: question.difficulty === 'easy' ? 'var(--color-success)' :
                             question.difficulty === 'medium' ? 'var(--color-warning)' :
                             'var(--color-error)'
                    }}
                  >
                    {question.difficulty}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                {question.options.map((option, optionIndex) => (
                  <div 
                    key={optionIndex}
                    style={{
                      padding: 'var(--space-2)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-secondary)',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-secondary)',
                      transition: 'var(--transition-fast)',
                      cursor: 'pointer'
                    }}
                    className="hover:border-gray-400"
                  >
                    {String.fromCharCode(65 + optionIndex)}. {option}
                  </div>
                ))}
              </div>
              <div 
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-tertiary)',
                  background: 'var(--color-bg-secondary)',
                  padding: 'var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  lineHeight: 'var(--line-height-base)'
                }}
              >
                <strong>Explanation:</strong> {question.explanation}
              </div>
            </div>
          ))}
          
          {analysis.quizQuestions.length > 1 && (
            <div 
              className="text-center"
              style={{ 
                color: 'var(--color-text-tertiary)',
                fontSize: 'var(--font-size-xs)',
                paddingTop: 'var(--space-2)'
              }}
            >
              ... and {analysis.quizQuestions.length - 1} more questions
            </div>
          )}
          
          <div className="text-center" style={{ paddingTop: 'var(--space-4)' }}>
            <button
              onClick={() => setIsQuizModalOpen(true)}
              className="inline-flex items-center hover:brightness-90"
              style={{
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-4)',
                background: 'var(--color-brand-primary)',
                color: 'white',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                fontSize: 'var(--font-size-base)',
                fontWeight: 600,
                transition: 'var(--transition-base)',
                cursor: 'pointer'
              }}
            >
              <Play className="w-4 h-4" />
              Take Interactive Quiz ({analysis.quizQuestions.length} questions)
            </button>
          </div>
        </div>
      </div>
      
      {/* Quiz Modal */}
      <QuizModal
        questions={analysis.quizQuestions}
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        onJumpToTime={onJumpToTime}
      />
    </div>
  );
}