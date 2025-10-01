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
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-indigo-600 animate-pulse" />
          <h3 className="text-xl font-semibold text-gray-900">Analyzing with Claude AI...</h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-semibold text-gray-900">AI Analysis Complete</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{analysis.chapters.length}</div>
            <div className="text-sm text-indigo-700">Chapters</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{analysis.keyConcepts.length}</div>
            <div className="text-sm text-green-700">Key Concepts</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{analysis.quizQuestions.length}</div>
            <div className="text-sm text-purple-700">Quiz Questions</div>
          </div>
        </div>

        <p className="text-gray-700 mb-4">{analysis.overallSummary}</p>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>~{analysis.estimatedReadingTime} min read</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span className="capitalize">{analysis.difficultyLevel} level</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{analysis.topics.join(', ')}</span>
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Chapters
        </h3>
        <div className="space-y-4">
          {analysis.chapters.map((chapter, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{chapter.title}</h4>
                <span className="text-sm text-indigo-600 font-mono">
                  {formatTime(chapter.startTime)} - {formatTime(chapter.endTime)}
                </span>
              </div>
              <p className="text-gray-700 text-sm mb-3">{chapter.summary}</p>
              <div className="flex flex-wrap gap-2">
                {chapter.keyPoints.map((point, pointIndex) => (
                  <span 
                    key={pointIndex}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {point}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Concepts */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-green-600" />
          Key Concepts
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {analysis.keyConcepts.map((concept, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{concept.term}</h4>
                <span className="text-sm text-green-600 font-mono">
                  {formatTime(concept.timestamp)}
                </span>
              </div>
              <p className="text-gray-700 text-sm mb-2">{concept.definition}</p>
              <p className="text-gray-600 text-xs italic">{concept.context}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quiz Questions Preview */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Practice Questions
        </h3>
        <div className="space-y-4">
          {analysis.quizQuestions.slice(0, 1).map((question, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-900">{question.question}</h4>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-purple-600 font-mono">{formatTime(question.timestamp)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                    question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {question.difficulty}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 mb-3">
                {question.options.map((option, optionIndex) => (
                  <div 
                    key={optionIndex}
                    className="p-2 rounded border text-sm border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300 transition-colors cursor-pointer"
                  >
                    {String.fromCharCode(65 + optionIndex)}. {option}
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <strong>Explanation:</strong> {question.explanation}
              </div>
            </div>
          ))}
          
          {analysis.quizQuestions.length > 1 && (
            <div className="text-center text-gray-500 text-sm py-2">
              ... and {analysis.quizQuestions.length - 1} more questions in the full interactive experience
            </div>
          )}
          
          <div className="text-center pt-4">
            <button
              onClick={() => setIsQuizModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              Take Interactive Quiz ({analysis.quizQuestions.length} questions)
            </button>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-indigo-900 mb-2">
          🎉 Analysis Complete!
        </h3>
        <p className="text-indigo-700 mb-4">
          Your video has been transformed into an interactive learning experience with AI-generated chapters, key concepts, and practice questions.
        </p>
        <div className="text-sm text-indigo-600">
          <strong>Coming next:</strong> Interactive video player with timestamp navigation, hover definitions, and quiz integration!
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