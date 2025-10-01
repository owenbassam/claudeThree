'use client';

import { KeyConcept } from '@/types';
import { Lightbulb, Clock } from 'lucide-react';
import { formatTime } from '@/lib/youtube';
import { useState } from 'react';

interface KeyConceptsProps {
  concepts: KeyConcept[];
  onJumpToTime: (timestamp: number) => void;
  className?: string;
}

export function KeyConcepts({ concepts, onJumpToTime, className = '' }: KeyConceptsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-600" />
        <h3 className="text-xl font-semibold text-gray-900">Key Concepts</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {concepts.map((concept, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-gray-900">{concept.term}</h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onJumpToTime(concept.timestamp);
                }}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-mono flex items-center gap-1 flex-shrink-0"
              >
                <Clock className="w-3 h-3" />
                {formatTime(concept.timestamp)}
              </button>
            </div>
            
            <p className={`text-gray-700 text-sm mt-2 ${
              expandedIndex === index ? '' : 'line-clamp-2'
            }`}>
              {concept.definition}
            </p>

            {expandedIndex === index && concept.context && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-1">Context from video:</p>
                <p className="text-sm text-gray-600 italic">"{concept.context}"</p>
              </div>
            )}

            {expandedIndex !== index && (
              <p className="text-xs text-indigo-600 mt-2">Click to expand</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
