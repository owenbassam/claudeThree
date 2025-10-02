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
import { generateInitialPrompt } from '@/lib/socraticPrompts';

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

    // Extract main topic from video
    const topic = learningAnalysis.topics?.[0] || 
                  learningAnalysis.chapters[0]?.title || 
                  'this topic';

    // Generate initial greeting and question using Claude
    const prompt = generateInitialPrompt(videoTitle, topic);
    
    const command = new ConverseCommand({
      modelId: process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
      messages: [
        {
          role: 'user',
          content: [{ text: `${prompt}\n\nProvide ONLY your greeting and question as plain conversational text. Your response will be read directly by the student, so write naturally without any JSON, code blocks, or formatting markers.` }]
        }
      ],
      system: [
        {
          text: `You are a warm, enthusiastic Socratic tutor beginning a learning session. Your response will be displayed directly to the student, so write in smooth, flowing prose. Use natural conversational language as if speaking to a curious friend. Your goal is to make them feel welcome and assess their starting knowledge.`
        }
      ],
      inferenceConfig: {
        temperature: 0.7,
        maxTokens: 300,
      }
    });

    const response = await client.send(command);
    let aiMessage = response.output?.message?.content?.[0]?.text || 
                    "Hi! I'm excited to help you learn. What do you already know about this topic?";
    
    // Clean up any JSON artifacts
    aiMessage = aiMessage.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    aiMessage = aiMessage.replace(/^\{\s*/g, '').replace(/\s*\}$/g, '');
    try {
      const parsed = JSON.parse(aiMessage);
      if (parsed.message) aiMessage = parsed.message;
    } catch {
      // Not JSON, use as-is
    }

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

    // Create initial conversation state
    const conversationState: ConversationState = {
      videoId,
      videoTitle,
      phase: ConversationPhase.INITIAL,
      currentChapterIndex: -1, // -1 means in initial assessment
      currentQuestionId: initialMessage.id,
      unlockedChapters: [],
      chapterLocks,
      chapterScores: {},
      checkpoints: [],
      userProfile,
      messages: [initialMessage],
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
