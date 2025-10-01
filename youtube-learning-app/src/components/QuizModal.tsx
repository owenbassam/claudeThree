'use client';

import { useState } from 'react';
import { QuizQuestion } from '@/types';
import { X, CheckCircle2, XCircle, ChevronRight, ChevronLeft } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {quizState.showResults ? 'Quiz Results' : 'Practice Quiz'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {quizState.showResults ? (
            // Results View
            <div className="space-y-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(quizState.score, questions.length)}`}>
                  {quizState.score}/{questions.length}
                </div>
                <div className="text-gray-600 mt-2">
                  {Math.round((quizState.score / questions.length) * 100)}% Correct
                </div>
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => {
                  const userAnswer = quizState.selectedAnswers[index];
                  const isCorrect = userAnswer === question.correctAnswer;
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-3">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">{question.question}</h4>
                          <div className="text-sm text-gray-600 mb-2">
                            <button
                              onClick={() => onJumpToTime?.(question.timestamp)}
                              className="text-purple-600 hover:text-purple-800 font-mono"
                            >
                              {formatTime(question.timestamp)}
                            </button>
                          </div>
                          
                          <div className="space-y-1">
                            {question.options.map((option, optionIndex) => (
                              <div 
                                key={optionIndex}
                                className={`p-2 rounded text-sm ${
                                  optionIndex === question.correctAnswer
                                    ? 'bg-green-50 border border-green-200 text-green-800'
                                    : optionIndex === userAnswer && !isCorrect
                                    ? 'bg-red-50 border border-red-200 text-red-800'
                                    : 'bg-gray-50 border border-gray-200 text-gray-700'
                                }`}
                              >
                                {String.fromCharCode(65 + optionIndex)}. {option}
                                {optionIndex === question.correctAnswer && (
                                  <span className="ml-2 text-green-600 font-semibold">✓ Correct</span>
                                )}
                                {optionIndex === userAnswer && !isCorrect && (
                                  <span className="ml-2 text-red-600 font-semibold">✗ Your Answer</span>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={resetQuiz}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Retake Quiz
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            // Quiz View
            <div className="space-y-6">
              {/* Progress */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Question {quizState.currentQuestionIndex + 1} of {questions.length}</span>
                <span>
                  <button
                    onClick={() => onJumpToTime?.(currentQuestion.timestamp)}
                    className="text-purple-600 hover:text-purple-800 font-mono"
                  >
                    {formatTime(currentQuestion.timestamp)}
                  </button>
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((quizState.currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {currentQuestion.question}
                </h3>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, optionIndex) => {
                    const isSelected = quizState.selectedAnswers[quizState.currentQuestionIndex] === optionIndex;
                    
                    return (
                      <button
                        key={optionIndex}
                        onClick={() => handleAnswerSelect(optionIndex)}
                        className={`w-full p-3 text-left rounded-lg border transition-colors ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50 text-purple-900'
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        <span className="font-medium mr-3">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={quizState.currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <button
                  onClick={handleNext}
                  disabled={!hasAnsweredCurrent}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLastQuestion ? 'Finish Quiz' : 'Next'}
                  {!isLastQuestion && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}