'use client';

import { Chapter } from '@/types';
import { Clock, CheckCircle } from 'lucide-react';
import { formatTime } from '@/lib/youtube';

interface ChapterNavigationProps {
  chapters: Chapter[];
  currentTime: number;
  onJumpToTime: (timestamp: number) => void;
  className?: string;
}

export function ChapterNavigation({ 
  chapters, 
  currentTime, 
  onJumpToTime,
  className = ''
}: ChapterNavigationProps) {
  const getCurrentChapterIndex = () => {
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (currentTime >= chapters[i].startTime) {
        return i;
      }
    }
    return 0;
  };

  const currentChapterIndex = getCurrentChapterIndex();

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-indigo-600" />
        <h3 className="text-xl font-semibold text-gray-900">Chapters</h3>
      </div>

      <div className="space-y-2">
        {chapters.map((chapter, index) => {
          const isActive = index === currentChapterIndex;
          const isPast = currentTime > chapter.startTime;
          
          return (
            <button
              key={index}
              onClick={() => onJumpToTime(chapter.startTime)}
              className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-50 border-2 border-indigo-500 shadow-md'
                  : isPast
                  ? 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  : 'border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isPast && !isActive && (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                    <h4 className={`font-semibold ${
                      isActive ? 'text-indigo-900' : 'text-gray-900'
                    }`}>
                      {chapter.title}
                    </h4>
                  </div>
                  <p className={`text-sm ${
                    isActive ? 'text-indigo-700' : 'text-gray-600'
                  }`}>
                    {chapter.summary}
                  </p>
                </div>
                <div className={`text-sm font-mono flex-shrink-0 ${
                  isActive 
                    ? 'text-indigo-600 font-semibold' 
                    : 'text-gray-500'
                }`}>
                  {formatTime(chapter.startTime)}
                </div>
              </div>

              {isActive && (
                <div className="mt-2 h-1 bg-indigo-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{
                      width: `${
                        index < chapters.length - 1
                          ? ((currentTime - chapter.startTime) / 
                             (chapters[index + 1].startTime - chapter.startTime)) * 100
                          : 100
                      }%`
                    }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Chapter Progress Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold text-gray-900">
            Chapter {currentChapterIndex + 1} of {chapters.length}
          </span>
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{
              width: `${((currentChapterIndex + 1) / chapters.length) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}
