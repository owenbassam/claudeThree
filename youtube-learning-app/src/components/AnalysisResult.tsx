'use client';

import { useState } from 'react';
import { LearningAnalysis, QuizQuestion, Flashcard as FlashcardType } from '@/types';
import { Brain, Clock, Target, BookOpen, Play } from 'lucide-react';
import { formatTime } from '@/lib/youtube';
import { QuizModal } from './QuizModal';
import { FlashcardModal } from './FlashcardModal';
import { apiRequest } from '@/lib/api';

interface AnalysisResultProps {
  analysis: LearningAnalysis;
  isLoading?: boolean;
  onJumpToTime?: (timestamp: number) => void;
  transcript?: any[];
  videoTitle?: string;
}

export function AnalysisResult({ analysis, isLoading = false, onJumpToTime, transcript, videoTitle }: AnalysisResultProps) {
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);

  const handleGenerateFlashcards = () => {
    // Convert key concepts to flashcards
    const generatedFlashcards: FlashcardType[] = analysis.keyConcepts.map((concept, index) => ({
      id: `flashcard-${index}`,
      front: concept.term,
      back: concept.definition,
      category: 'Key Concept',
      timestamp: concept.timestamp,
      difficulty: 'medium'
    }));

    setFlashcards(generatedFlashcards);
    setIsFlashcardModalOpen(true);
  };

  const handleGenerateQuiz = async () => {
    // If quiz already generated, just open the modal
    if (quizQuestions.length > 0) {
      setIsQuizModalOpen(true);
      return;
    }

    // Generate new quiz
    setIsGeneratingQuiz(true);
    setQuizError(null);

    try {
      const response = await apiRequest<{ questions: QuizQuestion[]; success: boolean }>('/api/generate-quiz', {
        method: 'POST',
        body: JSON.stringify({
          transcript,
          videoTitle,
          chapters: analysis.chapters,
        }),
      });

      setQuizQuestions(response.questions);
      setIsQuizModalOpen(true);
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      setQuizError('Failed to generate quiz. Please try again.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

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

      {/* Practice Options */}
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
            marginBottom: 'var(--space-2)'
          }}
        >
          <Target className="w-5 h-5" style={{ color: 'var(--color-brand-primary)' }} />
          Test Your Knowledge
        </h3>
        
        <p 
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-6)',
            lineHeight: 'var(--line-height-base)'
          }}
        >
          Ready to practice? Choose how you'd like to review what you've learned.
        </p>
        
        <div 
          className="grid md:grid-cols-2"
          style={{ 
            gap: 'var(--space-4)'
          }}
        >
          {/* Quiz Option */}
          <div
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              background: 'var(--color-bg-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)'
            }}
          >
            <div className="flex items-start" style={{ gap: 'var(--space-2)' }}>
              <Target className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-brand-primary)', marginTop: '2px' }} />
              <div>
                <h4 
                  className="font-semibold"
                  style={{
                    fontSize: 'var(--font-size-lg)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-1)'
                  }}
                >
                  Interactive Quiz
                </h4>
                <p 
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 'var(--line-height-base)',
                    marginBottom: 'var(--space-2)'
                  }}
                >
                  Test your understanding with AI-generated questions tailored to the video content and complexity.
                </p>
                <div 
                  className="flex items-center"
                  style={{
                    gap: 'var(--space-2)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-tertiary)',
                    marginBottom: 'var(--space-3)'
                  }}
                >
                  <span>• Multiple choice</span>
                  <span>• Instant feedback</span>
                  <span>• Jump to timestamps</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleGenerateQuiz}
              disabled={isGeneratingQuiz}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                background: isGeneratingQuiz ? 'var(--color-border)' : 'var(--color-brand-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-base)',
                fontWeight: 600,
                cursor: isGeneratingQuiz ? 'not-allowed' : 'pointer',
                transition: 'var(--transition-base)',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)'
              }}
              className="hover:opacity-90"
            >
              {isGeneratingQuiz ? (
                <>
                  <Brain className="w-4 h-4 animate-pulse" />
                  Generating Quiz...
                </>
              ) : (
                'Start Quiz →'
              )}
            </button>
          </div>
          
          {/* Flashcards Option */}
          <div
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              background: 'var(--color-bg-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)'
            }}
          >
            <div className="flex items-start" style={{ gap: 'var(--space-2)' }}>
              <Brain className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-brand-primary)', marginTop: '2px' }} />
              <div>
                <h4 
                  className="font-semibold"
                  style={{
                    fontSize: 'var(--font-size-lg)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-1)'
                  }}
                >
                  Study Flashcards
                </h4>
                <p 
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 'var(--line-height-base)',
                    marginBottom: 'var(--space-2)'
                  }}
                >
                  Review {analysis.keyConcepts.length} key concepts with interactive flashcards for better retention.
                </p>
                <div 
                  className="flex items-center"
                  style={{
                    gap: 'var(--space-2)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-tertiary)',
                    marginBottom: 'var(--space-3)'
                  }}
                >
                  <span>• Flip to reveal</span>
                  <span>• Spaced repetition</span>
                  <span>• Track progress</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleGenerateFlashcards}
              disabled={analysis.keyConcepts.length === 0}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                background: 'transparent',
                color: analysis.keyConcepts.length === 0 ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-base)',
                fontWeight: 600,
                cursor: analysis.keyConcepts.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'var(--transition-base)',
                width: '100%'
              }}
              className="hover:border-gray-400 hover:bg-gray-100"
            >
              Study with Flashcards →
            </button>
          </div>
        </div>
        
        {/* Removed automatic quiz preview - now opt-in via buttons above */}
        <div style={{ display: 'none' }}>
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
        </div>
      </div>
      
      {/* Quiz Modal */}
      {quizQuestions.length > 0 && (
        <QuizModal
          questions={quizQuestions}
          isOpen={isQuizModalOpen}
          onClose={() => setIsQuizModalOpen(false)}
          onJumpToTime={onJumpToTime}
        />
      )}

      {/* Flashcard Modal */}
      <FlashcardModal
        flashcards={flashcards}
        isOpen={isFlashcardModalOpen}
        onClose={() => setIsFlashcardModalOpen(false)}
        onJumpToTime={onJumpToTime}
      />

      {/* Error message */}
      {quizError && (
        <div
          style={{
            position: 'fixed',
            bottom: 'var(--space-4)',
            right: 'var(--space-4)',
            background: 'var(--color-error)',
            color: 'white',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000
          }}
        >
          {quizError}
        </div>
      )}
    </div>
  );
}