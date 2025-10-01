'use client';

import { useState } from 'react';
import { Loader2, Play, AlertCircle } from 'lucide-react';

interface VideoInputProps {
  onAnalyze: (url: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function VideoInput({ onAnalyze, isLoading = false, error }: VideoInputProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onAnalyze(url.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Get Started with Any YouTube Video
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube URL here... (e.g., https://www.youtube.com/watch?v=...)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!url.trim() || isLoading}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Analyze Video
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <p className="text-sm text-gray-500 text-center">
            Works best with educational content: lectures, tutorials, documentaries
          </p>
        </form>
      </div>
    </div>
  );
}