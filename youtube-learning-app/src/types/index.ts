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

// ============================================
// SOCRATIC TUTOR - New Types
// ============================================

/**
 * Conversation phase tracking
 */
export enum ConversationPhase {
  INITIAL = 'initial',           // First greeting, assess prior knowledge
  PRE_WATCH = 'pre_watch',        // Activate prior knowledge before watching
  WATCHING = 'watching',          // User is watching assigned video section
  POST_WATCH = 'post_watch',      // Test comprehension after watching
  EVALUATING = 'evaluating',      // AI is evaluating user's response
  FOLLOW_UP = 'follow_up',        // Digging deeper into misconceptions
  CHECKPOINT = 'checkpoint',      // Passed! Unlock next chapter
  REVIEW = 'review',              // Failed checkpoint, need to review
  COMPLETE = 'complete'           // Finished all chapters
}

/**
 * Individual message in conversation
 */
export interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: number;
  chapterId?: string;
  messageType: 'question' | 'answer' | 'followup' | 'checkpoint' | 'hint' | 'instruction';
  metadata?: {
    targetTimestamp?: number;     // For "watch 2:30-5:00" instructions
    endTimestamp?: number;
    conceptsReferenced?: string[];
  };
}

/**
 * Checkpoint when user passes a chapter
 */
export interface Checkpoint {
  id: string;
  chapterId: string;
  chapterIndex: number;
  passed: boolean;
  score: number;
  questionsAsked: number;
  hintsUsed: number;
  timestamp: number;
  feedback: string;
}

/**
 * User's learning profile and performance
 */
export interface UserProfile {
  overallComprehension: number;   // 0-100, running average
  responseQuality: 'struggling' | 'adequate' | 'excellent';
  preferredPacing: 'slow' | 'medium' | 'fast';
  hintsUsedTotal: number;
  misconceptions: string[];       // Track recurring issues
  strongConcepts: string[];       // Concepts they grasp well
}

/**
 * AI's evaluation of user's answer
 */
export interface EvaluationResult {
  score: number;                  // 0-100
  passed: boolean;                // Score >= 70
  strengths: string[];
  weaknesses: string[];
  misconceptions: string[];
  needsFollowUp: boolean;
  nextQuestion?: string;
  nextPhase: ConversationPhase;
  canProceed: boolean;            // Can unlock next chapter?
  feedback: string;               // Encouraging feedback message
  suggestedHint?: string;         // If struggling, suggest a hint
}

/**
 * Progressive hint system
 */
export interface HintLevel {
  level: 1 | 2 | 3 | 4;
  content: string;
  scoreImpact: number;            // How many points deducted
}

/**
 * Chapter lock state
 */
export interface ChapterLock {
  chapterIndex: number;
  isUnlocked: boolean;
  status: 'locked' | 'in_progress' | 'unlocked' | 'completed';
  score?: number;
  unlockRequirements: {
    previousChapterScore: number;
    questionsAnswered: number;
    minimumViewTime: number;
  };
}

/**
 * Complete conversation state
 */
export interface ConversationState {
  // Context
  videoId: string;
  videoTitle: string;
  
  // Current state
  phase: ConversationPhase;
  currentChapterIndex: number;
  currentQuestionId: string | null;
  
  // Progress
  unlockedChapters: number[];
  chapterLocks: ChapterLock[];
  chapterScores: Record<string, number>;
  checkpoints: Checkpoint[];
  
  // User profile
  userProfile: UserProfile;
  
  // Conversation history
  messages: Message[];
  
  // Tracking
  startedAt: number;
  lastActivityAt: number;
  totalTimeSpent: number;
}

/**
 * Updated VideoData to include conversation state
 */
export interface VideoDataWithConversation extends VideoData {
  conversationState?: ConversationState;
}