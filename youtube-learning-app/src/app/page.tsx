'use client';

import { Youtube, Brain, Clock, Target } from 'lucide-react';
import { VideoInput } from '@/components/VideoInput';
import { VideoResult } from '@/components/VideoResult';
import { useVideoProcessor } from '@/hooks/useVideoProcessor';

export default function Home() {
  const { videoData, isLoading, error, processVideo, resetVideo } = useVideoProcessor();

  // Show video result if we have processed data
  if (videoData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <VideoResult videoData={videoData} onReset={resetVideo} />
        </div>
      </div>
    );
  }

  // Show landing page with video input
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Youtube className="h-12 w-12 text-red-500 mr-3" />
            <Brain className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            YouTube Learning
            <span className="text-indigo-600"> Enhanced</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform any educational YouTube video into an interactive learning experience 
            with AI-generated chapters, key concepts, and practice questions.
          </p>
        </div>

        {/* Video Input */}
        <VideoInput 
          onAnalyze={processVideo}
          isLoading={isLoading}
          error={error}
        />

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <Brain className="h-10 w-10 text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
            <p className="text-gray-600">
              Claude 4.5 analyzes video transcripts to extract key concepts and generate practice questions.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <Clock className="h-10 w-10 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Interactive Timeline</h3>
            <p className="text-gray-600">
              Click timestamps to jump to specific moments. Hover over terms for instant definitions.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <Target className="h-10 w-10 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Practice Questions</h3>
            <p className="text-gray-600">
              Test understanding with strategically placed quizzes and immediate feedback.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>Powered by Claude 4.5 AI • Built for better learning experiences</p>
        </div>
      </div>
    </div>
  );
}
