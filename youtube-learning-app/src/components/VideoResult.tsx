'use client';

import { useState, useRef } from 'react';
import { VideoData } from '@/types';
import { Clock, FileText, AlertTriangle, CheckCircle, Loader2, Brain } from 'lucide-react';
import { formatTime } from '@/lib/youtube';
import { AnalysisResult } from './AnalysisResult';
import { VideoPlayer } from './VideoPlayer';
import { ChapterNavigation } from './ChapterNavigation';
import { KeyConcepts } from './KeyConcepts';

interface VideoResultProps {
  videoData: VideoData;
  onReset: () => void;
}

export function VideoResult({ videoData, onReset }: VideoResultProps) {
  const { videoInfo, transcript, analysis, processingStatus, error } = videoData;
  const [currentTime, setCurrentTime] = useState(0);
  const videoPlayerRef = useRef<any>(null);
  
  const handleJumpToTime = (timestamp: number) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.seekTo(timestamp);
    }
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };
  
  const hasTranscript = transcript && transcript.length > 0;
  const isAnalyzing = processingStatus === 'analyzing';
  const isComplete = processingStatus === 'complete' && analysis;
  const hasChapters = analysis && analysis.chapters && analysis.chapters.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Video Info Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{videoInfo.title}</h2>
          <button
            onClick={onReset}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Try Another Video
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Player Section */}
          <div className="space-y-4">
            <VideoPlayer
              ref={videoPlayerRef}
              url={videoInfo.url}
              transcript={hasTranscript ? transcript : undefined}
              onTimeUpdate={handleTimeUpdate}
              className="w-full"
            />
          </div>
          
          {/* Video Details Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium">Channel:</span>
              <span>{videoInfo.channelName}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Duration: {videoInfo.duration ? formatTime(videoInfo.duration) : 'Loading...'}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {hasTranscript ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Transcript available ({transcript.length} segments)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">No transcript available</span>
                </div>
              )}

              {isAnalyzing && (
                <div className="flex items-center gap-2 text-indigo-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Analyzing with Claude AI...</span>
                </div>
              )}

              {isComplete && (
                <div className="flex items-center gap-2 text-purple-600">
                  <Brain className="w-4 h-4" />
                  <span className="text-sm">AI Analysis Complete</span>
                </div>
              )}
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Learning Features - Show when analysis is complete */}
      {isComplete && analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chapter Navigation */}
          {hasChapters && (
            <div className="lg:col-span-1">
              <ChapterNavigation
                chapters={analysis.chapters}
                currentTime={currentTime}
                onJumpToTime={handleJumpToTime}
              />
            </div>
          )}
          
          {/* Key Concepts */}
          {analysis.keyConcepts && analysis.keyConcepts.length > 0 && (
            <div className={hasChapters ? "lg:col-span-2" : "lg:col-span-3"}>
              <KeyConcepts
                concepts={analysis.keyConcepts}
                onJumpToTime={handleJumpToTime}
              />
            </div>
          )}
        </div>
      )}

      {/* AI Analysis Results */}
      {isComplete && analysis && (
        <AnalysisResult analysis={analysis} onJumpToTime={handleJumpToTime} />
      )}

      {/* Analysis Loading State */}
      {isAnalyzing && (
        <AnalysisResult analysis={{} as any} isLoading={true} onJumpToTime={handleJumpToTime} />
      )}

      {/* Transcript Preview - only show if no analysis yet */}
      {hasTranscript && !isComplete && !isAnalyzing && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xl font-semibold text-gray-900">Transcript Preview</h3>
          </div>
          
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-2">
            {transcript.slice(0, 10).map((segment, index) => (
              <div key={index} className="flex gap-3 text-sm">
                <span className="text-indigo-600 font-mono min-w-[60px]">
                  {formatTime(segment.start)}
                </span>
                <span className="text-gray-700">{segment.text}</span>
              </div>
            ))}
            
            {transcript.length > 10 && (
              <div className="text-center text-gray-500 text-sm py-2">
                ... and {transcript.length - 10} more segments
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Steps - only show if we have transcript but no analysis */}
      {hasTranscript && !isComplete && !isAnalyzing && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-2">
            🎉 Great! We found the transcript
          </h3>
          <p className="text-indigo-700 mb-4">
            Next, we'll analyze this content with Claude AI to create chapters, key concepts, and practice questions.
          </p>
          <div className="text-sm text-indigo-600">
            <strong>Coming in Step 3:</strong> AI-powered content analysis and interactive learning features
          </div>
        </div>
      )}
      
      {!hasTranscript && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            No Transcript Found
          </h3>
          <p className="text-yellow-700 mb-4">
            This video doesn't have captions or transcripts available. Try with a different educational video that has captions enabled.
          </p>
          <div className="text-sm text-yellow-600">
            <strong>Tip:</strong> Most popular educational channels (Khan Academy, MIT OpenCourseWare, TED-Ed) have transcripts available.
          </div>
        </div>
      )}
    </div>
  );
}