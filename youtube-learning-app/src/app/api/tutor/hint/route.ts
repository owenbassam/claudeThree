/**
 * POST /api/tutor/hint
 * 
 * Provide progressive hints without giving away the answer
 */

import { NextRequest, NextResponse } from 'next/server';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { ConversationState, HintLevel, LearningAnalysis } from '@/types';
import { generateHintPrompt, SOCRATIC_SYSTEM_PROMPT } from '@/lib/socraticPrompts';

const client = new BedrockRuntimeClient({ 
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});

interface HintRequest {
  conversationState: ConversationState;
  currentQuestion: string;
  userAnswer: string;
  hintLevel: 1 | 2 | 3 | 4;
  analysis: LearningAnalysis;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      conversationState, 
      currentQuestion, 
      userAnswer, 
      hintLevel,
      analysis 
    } = await request.json() as HintRequest;

    if (!conversationState || !currentQuestion || hintLevel < 1 || hintLevel > 4) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    const currentChapter = analysis.chapters[conversationState.currentChapterIndex];
    
    if (!currentChapter) {
      return NextResponse.json(
        { error: 'Invalid chapter index' },
        { status: 400 }
      );
    }

    // Generate hint using Claude
    const hintPrompt = generateHintPrompt(
      currentQuestion,
      userAnswer || '',
      hintLevel,
      currentChapter
    );

    const command = new ConverseCommand({
      modelId: process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
      messages: [
        {
          role: 'user',
          content: [{ text: hintPrompt + '\n\nProvide ONLY the hint text - no JSON, no formatting, just a helpful hint.' }]
        }
      ],
      system: [
        { 
          text: 'You are a Socratic tutor providing hints. Give helpful guidance but NEVER give the direct answer. Respond with ONLY plain text, no JSON formatting.' 
        }
      ],
      inferenceConfig: {
        temperature: 0.7,
        maxTokens: 300,
      }
    });

    const response = await client.send(command);
    let hintContent = response.output?.message?.content?.[0]?.text || 
                      'Think about what we discussed earlier in the video.';
    
    // Clean up any JSON artifacts
    hintContent = cleanJsonArtifacts(hintContent);

    // Calculate score impact based on hint level
    const scoreImpact = hintLevel * 5; // 5, 10, 15, 20 points deducted

    const hint: HintLevel = {
      level: hintLevel,
      content: hintContent,
      scoreImpact
    };

    // Update user profile with hint usage
    const updatedProfile = {
      ...conversationState.userProfile,
      hintsUsedTotal: conversationState.userProfile.hintsUsedTotal + 1
    };

    return NextResponse.json({
      success: true,
      hint,
      updatedProfile,
      warning: hintLevel >= 3 ? 'Using multiple hints will significantly affect your score.' : undefined
    });

  } catch (error) {
    console.error('Error generating hint:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate hint',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Clean up JSON artifacts from Claude's response
 */
function cleanJsonArtifacts(text: string): string {
  // Remove JSON code blocks
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  // Remove stray brackets at start/end
  text = text.replace(/^\{\s*/g, '').replace(/\s*\}$/g, '');
  
  // Try to extract just the message content if it's JSON
  try {
    const parsed = JSON.parse(text);
    if (parsed.message) return parsed.message;
    if (typeof parsed === 'string') return parsed;
  } catch {
    // Not JSON, return as-is
  }
  
  return text.trim();
}
