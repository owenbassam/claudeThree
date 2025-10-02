export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnailUrl: string;
  channelName: string;
  url: string;
}

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export interface Chapter {
  title: string;
  startTime: number;
  endTime: number;
  summary: string;
  keyPoints: string[];
}

export interface KeyConcept {
  term: string;
  definition: string;
  context: string;
  timestamp: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  timestamp: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  timestamp: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface LearningAnalysis {
  chapters: Chapter[];
  keyConcepts: KeyConcept[];
  quizQuestions: QuizQuestion[]; // Will be empty initially, loaded on demand
  overallSummary: string;
  estimatedReadingTime: number;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
}

export interface VideoData {
  videoInfo: VideoInfo;
  transcript: TranscriptSegment[];
  analysis: LearningAnalysis | null;
  processingStatus: 'idle' | 'loading' | 'analyzing' | 'complete' | 'error';
  error?: string;
}

export interface UserProgress {
  currentTimestamp: number;
  completedQuestions: number[];
  visitedChapters: number[];
  notesTimestamps: number[];
}