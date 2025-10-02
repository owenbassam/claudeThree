/**
 * POST /api/tutor/start
 * 
 * Initialize a Socratic learning conversation for a video
 * Returns the initial greeting and first question
 */

import { NextRequest, NextResponse } from 'next/server';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { 
  ConversationState, 
  ConversationPhase, 
  ChapterLock,
  UserProfile,
  Message,
  LearningAnalysis 
} from '@/types';
import { generatePreWatchPrompt } from '@/lib/socraticPrompts';

const client = new BedrockRuntimeClient({ 
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});

export async function POST(request: NextRequest) {
  try {
    const { videoId, videoTitle, analysis } = await request.json();

    if (!videoId || !videoTitle || !analysis) {
      return NextResponse.json(
        { error: 'Missing required fields: videoId, videoTitle, analysis' },
        { status: 400 }
      );
    }

    const learningAnalysis = analysis as LearningAnalysis;

    // Skip PRE_WATCH phase - go straight to watching first chapter
    const firstChapter = learningAnalysis.chapters[0];
    
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    // Generate watching instruction with timestamps
    const aiMessage = `Let's dive in! Watch "${firstChapter.title}" (${formatTime(firstChapter.startTime)} to ${formatTime(firstChapter.endTime)}).

Pay attention to: ${firstChapter.keyPoints[0] || 'the main concepts'}

When you're done, click the "Continue" button below.`;

    // Initialize conversation state
    const now = Date.now();
    const initialMessage: Message = {
      id: `msg_${now}`,
      role: 'ai',
      content: aiMessage,
      timestamp: now,
      messageType: 'question'
    };

    // Initialize chapter locks (all locked except setup)
    const chapterLocks: ChapterLock[] = learningAnalysis.chapters.map((chapter, index) => ({
      chapterIndex: index,
      isUnlocked: false,
      status: 'locked',
      unlockRequirements: {
        previousChapterScore: 70,
        questionsAnswered: 2,
        minimumViewTime: (chapter.endTime - chapter.startTime) * 0.8
      }
    }));

    // Initialize user profile
    const userProfile: UserProfile = {
      overallComprehension: 0,
      responseQuality: 'adequate',
      preferredPacing: 'medium',
      hintsUsedTotal: 0,
      misconceptions: [],
      strongConcepts: []
    };

    // Create initial conversation state - start at WATCHING for chapter 0
    const conversationState: ConversationState = {
      videoId,
      videoTitle,
      phase: ConversationPhase.WATCHING,
      currentChapterIndex: 0, // Start at first chapter
      currentQuestionId: initialMessage.id,
      unlockedChapters: [0], // First chapter is unlocked
      chapterLocks,
      chapterScores: {},
      checkpoints: [],
      userProfile,
      messages: [initialMessage],
      consecutiveFailures: 0,
      totalFailures: 0,
      startedAt: now,
      lastActivityAt: now,
      totalTimeSpent: 0
    };

    return NextResponse.json({
      success: true,
      conversationState,
      message: aiMessage
    });

  } catch (error) {
    console.error('Error starting conversation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to start conversation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
