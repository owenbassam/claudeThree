'use client';

import { useState } from 'react';
import { QuizQuestion } from '@/types';
import { X, CheckCircle2, XCircle, ChevronRight, ChevronLeft, Download } from 'lucide-react';
import { formatTime } from '@/lib/youtube';

interface QuizModalProps {
  questions: QuizQuestion[];
  isOpen: boolean;
  onClose: () => void;
  onJumpToTime?: (timestamp: number) => void;
}

interface QuizState {
  currentQuestionIndex: number;
  selectedAnswers: (number | null)[];
  showResults: boolean;
  score: number;
}

export function QuizModal({ questions, isOpen, onClose, onJumpToTime }: QuizModalProps) {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    selectedAnswers: new Array(questions.length).fill(null),
    showResults: false,
    score: 0
  });

  if (!isOpen) return null;

  const currentQuestion = questions[quizState.currentQuestionIndex];
  const isLastQuestion = quizState.currentQuestionIndex === questions.length - 1;
  const hasAnsweredCurrent = quizState.selectedAnswers[quizState.currentQuestionIndex] !== null;

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...quizState.selectedAnswers];
    newAnswers[quizState.currentQuestionIndex] = answerIndex;
    
    setQuizState(prev => ({
      ...prev,
      selectedAnswers: newAnswers
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Calculate score and show results
      const score = quizState.selectedAnswers.reduce((acc: number, answer, index) => {
        if (answer === null) return acc;
        return acc + (answer === questions[index].correctAnswer ? 1 : 0);
      }, 0);
      
      setQuizState(prev => ({
        ...prev,
        showResults: true,
        score
      }));
    } else {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    }
  };

  const handlePrevious = () => {
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1)
    }));
  };

  const resetQuiz = () => {
    setQuizState({
      currentQuestionIndex: 0,
      selectedAnswers: new Array(questions.length).fill(null),
      showResults: false,
      score: 0
    });
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleExport = () => {
    // Create text content for export
    let content = 'QUIZ QUESTIONS\n\n';
    
    questions.forEach((question, index) => {
      content += `Question ${index + 1}\n\n`;
      content += `${question.question}\n\n`;
      
      question.options.forEach((option, optIndex) => {
        const isCorrect = optIndex === question.correctAnswer;
        const marker = isCorrect ? '✓' : ' ';
        content += `${String.fromCharCode(65 + optIndex)}. [${marker}] ${option}\n`;
      });
      
      content += `\nExplanation: ${question.explanation}\n\n`;
      
      if (question.timestamp !== undefined) {
        content += `Timestamp: ${formatTime(question.timestamp)}\n\n`;
      }
      
      content += '---\n\n';
    });

    // If quiz was completed, add score
    if (quizState.showResults) {
      content += `\nYour Results\n\n`;
      content += `Score: ${quizState.score}/${questions.length} (${Math.round((quizState.score / questions.length) * 100)}%)\n`;
    }

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-${Date.now()}.txt`;
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
            padding: 'var(--space-4)',
            borderBottom: '1px solid var(--color-border)',
            flexShrink: 0
          }}
        >
          <div>
            <h2 
              className="font-bold"
              style={{ 
                fontSize: 'var(--font-size-lg)', 
                color: 'var(--color-text-primary)' 
              }}
            >
              {quizState.showResults ? 'Quiz Results' : 'Practice Quiz'}
            </h2>
            {!quizState.showResults && (
              <p
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  marginTop: '4px'
                }}
              >
                Question {quizState.currentQuestionIndex + 1} of {questions.length}
              </p>
            )}
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
              title="Export quiz"
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
              width: `${quizState.showResults ? 100 : ((quizState.currentQuestionIndex + 1) / questions.length) * 100}%`,
              background: 'var(--color-brand-primary)',
              transition: 'width 0.3s ease'
            }}
          />
        </div>

        {/* Content */}
        <div 
          style={{ 
            padding: 'var(--space-4)',
            overflowY: 'auto',
            flex: 1
          }}
        >
          {quizState.showResults ? (
            // Results View
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div style={{ textAlign: 'center' }}>
                <div 
                  className={getScoreColor(quizState.score, questions.length)}
                  style={{
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 700
                  }}
                >
                  {quizState.score}/{questions.length}
                </div>
                <div 
                  style={{
                    color: 'var(--color-text-secondary)',
                    marginTop: 'var(--space-1)',
                    fontSize: 'var(--font-size-sm)'
                  }}
                >
                  {Math.round((quizState.score / questions.length) * 100)}% Correct
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {questions.map((question, index) => {
                  const userAnswer = quizState.selectedAnswers[index];
                  const isCorrect = userAnswer === question.correctAnswer;
                  
                  return (
                    <div 
                      key={index} 
                      style={{
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-3)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                        {isCorrect ? (
                          <CheckCircle2 
                            className="w-4 h-4 flex-shrink-0" 
                            style={{ color: 'var(--color-success)', marginTop: '2px' }}
                          />
                        ) : (
                          <XCircle 
                            className="w-4 h-4 flex-shrink-0" 
                            style={{ color: 'var(--color-error)', marginTop: '2px' }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <h4 
                            style={{
                              fontWeight: 500,
                              color: 'var(--color-text-primary)',
                              marginBottom: 'var(--space-1)',
                              fontSize: 'var(--font-size-sm)'
                            }}
                          >
                            {question.question}
                          </h4>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                            <button
                              onClick={() => onJumpToTime?.(question.timestamp)}
                              style={{
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
                              {formatTime(question.timestamp)}
                            </button>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {question.options.map((option, optionIndex) => (
                              <div 
                                key={optionIndex}
                                style={{
                                  padding: 'var(--space-2)',
                                  borderRadius: 'var(--radius-md)',
                                  fontSize: 'var(--font-size-xs)',
                                  border: `1px solid ${
                                    optionIndex === question.correctAnswer
                                      ? 'rgba(34, 197, 94, 0.3)'
                                      : optionIndex === userAnswer && !isCorrect
                                      ? 'rgba(239, 68, 68, 0.3)'
                                      : 'var(--color-border)'
                                  }`,
                                  background: optionIndex === question.correctAnswer
                                    ? 'rgba(34, 197, 94, 0.05)'
                                    : optionIndex === userAnswer && !isCorrect
                                    ? 'rgba(239, 68, 68, 0.05)'
                                    : 'var(--color-bg-secondary)',
                                  color: optionIndex === question.correctAnswer
                                    ? 'var(--color-success)'
                                    : optionIndex === userAnswer && !isCorrect
                                    ? 'var(--color-error)'
                                    : 'var(--color-text-primary)'
                                }}
                              >
                                {String.fromCharCode(65 + optionIndex)}. {option}
                                {optionIndex === question.correctAnswer && (
                                  <span style={{ marginLeft: 'var(--space-2)', fontWeight: 600 }}>✓ Correct</span>
                                )}
                                {optionIndex === userAnswer && !isCorrect && (
                                  <span style={{ marginLeft: 'var(--space-2)', fontWeight: 600 }}>✗ Your Answer</span>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          <div 
                            style={{
                              marginTop: 'var(--space-2)',
                              fontSize: '11px',
                              color: 'var(--color-text-secondary)',
                              background: 'var(--color-bg-secondary)',
                              padding: 'var(--space-2)',
                              borderRadius: 'var(--radius-sm)'
                            }}
                          >
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center' }}>
                <button
                  onClick={resetQuiz}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'var(--color-brand-primary)',
                    color: 'white',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'var(--transition-base)',
                    fontSize: 'var(--font-size-sm)'
                  }}
                  className="hover:opacity-90"
                >
                  Retake Quiz
                </button>
                <button
                  onClick={onClose}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'var(--transition-base)',
                    fontSize: 'var(--font-size-sm)'
                  }}
                  className="hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            // Quiz View
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Difficulty Badge */}
              <div style={{ marginBottom: 'var(--space-1)' }}>
                <span 
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    background: currentQuestion.difficulty === 'easy' ? 'rgba(34, 197, 94, 0.1)' :
                                currentQuestion.difficulty === 'medium' ? 'rgba(245, 158, 11, 0.1)' :
                                'rgba(239, 68, 68, 0.1)',
                    color: currentQuestion.difficulty === 'easy' ? 'var(--color-success)' :
                           currentQuestion.difficulty === 'medium' ? 'var(--color-warning)' :
                           'var(--color-error)'
                  }}
                >
                  {currentQuestion.difficulty}
                </span>
                </div>

                {/* Question Text */}
                <h3 
                  style={{
                    fontSize: 'var(--font-size-base)',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.4,
                    marginBottom: 'var(--space-3)'
                  }}
                >
                  {currentQuestion.question}
                </h3>

                {/* Answer Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {currentQuestion.options.map((option, optionIndex) => {
                    const isSelected = quizState.selectedAnswers[quizState.currentQuestionIndex] === optionIndex;
                    const optionLetter = String.fromCharCode(65 + optionIndex);
                    
                    return (
                      <button
                        key={optionIndex}
                        onClick={() => handleAnswerSelect(optionIndex)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          padding: 'var(--space-3)',
                          textAlign: 'left',
                          borderRadius: 'var(--radius-md)',
                          border: `2px solid ${isSelected ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
                          background: isSelected ? 'rgba(239, 68, 68, 0.05)' : 'white',
                          color: 'var(--color-text-primary)',
                          transition: 'var(--transition-base)',
                          cursor: 'pointer',
                          fontSize: 'var(--font-size-sm)'
                        }}
                        className="hover:border-red-400 hover:shadow-sm"
                      >
                        <span 
                          style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 700,
                            fontSize: 'var(--font-size-sm)',
                            flexShrink: 0,
                            background: isSelected ? 'var(--color-brand-primary)' : 'var(--color-bg-tertiary)',
                            color: isSelected ? 'white' : 'var(--color-text-secondary)',
                            transition: 'var(--transition-base)'
                          }}
                        >
                          {optionLetter}
                        </span>
                        <span style={{ flex: 1, lineHeight: 1.5 }}>
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>
            </div>
          )}
        </div>

        {/* Sticky Footer Navigation */}
        {!quizState.showResults && (
          <div
            style={{
              flexShrink: 0,
              padding: 'var(--space-4)',
              borderTop: '1px solid var(--color-border)',
              background: 'var(--color-bg-primary)'
            }}
          >
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={quizState.currentQuestionIndex === 0}
                className="flex items-center"
                style={{
                  gap: 'var(--space-1)',
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'var(--transition-base)',
                  cursor: quizState.currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                  opacity: quizState.currentQuestionIndex === 0 ? 0.5 : 1
                }}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={!hasAnsweredCurrent}
                className="flex items-center"
                style={{
                  gap: 'var(--space-1)',
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  color: 'white',
                  background: !hasAnsweredCurrent ? 'var(--color-border)' : 'var(--color-brand-primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  transition: 'var(--transition-base)',
                  cursor: !hasAnsweredCurrent ? 'not-allowed' : 'pointer'
                }}
              >
                {isLastQuestion ? 'Finish Quiz' : 'Next'}
                {!isLastQuestion && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}