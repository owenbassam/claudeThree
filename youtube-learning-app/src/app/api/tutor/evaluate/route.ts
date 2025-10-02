/**
 * POST /api/tutor/evaluate
 * 
 * Evaluate user's answer and determine next step in conversation
 * Returns evaluation, score, and next question or checkpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { 
  ConversationState,
  ConversationPhase,
  EvaluationResult,
  Message,
  Checkpoint,
  LearningAnalysis
} from '@/types';
import { 
  SOCRATIC_SYSTEM_PROMPT,
  generatePostWatchPrompt,
  generateFollowUpPrompt,
  generatePreWatchPrompt,
  generateCheckpointPrompt
} from '@/lib/socraticPrompts';

const client = new BedrockRuntimeClient({ 
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});

interface EvaluateRequest {
  conversationState: ConversationState;
  userAnswer: string;
  analysis: LearningAnalysis;
}

export async function POST(request: NextRequest) {
  try {
    const { conversationState, userAnswer, analysis } = await request.json() as EvaluateRequest;

    if (!conversationState || !userAnswer || !analysis) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const now = Date.now();

    // Add user's message to history
    const userMessage: Message = {
      id: `msg_${now}`,
      role: 'user',
      content: userAnswer,
      timestamp: now,
      messageType: 'answer'
    };

    const updatedMessages = [...conversationState.messages, userMessage];

    // Determine what to do based on current phase
    let evaluation: EvaluationResult;
    let aiResponse: string;
    let nextPhase: ConversationPhase;
    let updatedState: Partial<ConversationState> = {};

    switch (conversationState.phase) {
      case ConversationPhase.INITIAL:
        // User answered initial "what do you know" question
        // Move to pre-watch for first chapter
        evaluation = {
          score: 100, // No scoring on initial question
          passed: true,
          strengths: ['Engaged with the material'],
          weaknesses: [],
          misconceptions: [],
          needsFollowUp: false,
          nextPhase: ConversationPhase.PRE_WATCH,
          canProceed: true,
          feedback: 'Great! Let\'s start learning.'
        };

        const firstChapter = analysis.chapters[0];
        const preWatchPrompt = generatePreWatchPrompt(firstChapter, userAnswer);
        
        aiResponse = await callClaude(preWatchPrompt, updatedMessages);
        nextPhase = ConversationPhase.PRE_WATCH;
        
        updatedState = {
          currentChapterIndex: 0,
          phase: ConversationPhase.PRE_WATCH
        };
        break;

      case ConversationPhase.PRE_WATCH:
        // User answered pre-watch question
        // Instruct them to watch the chapter
        const currentChapter = analysis.chapters[conversationState.currentChapterIndex];
        
        evaluation = {
          score: 100,
          passed: true,
          strengths: [],
          weaknesses: [],
          misconceptions: [],
          needsFollowUp: false,
          nextPhase: ConversationPhase.WATCHING,
          canProceed: true,
          feedback: 'Good thinking!'
        };

        aiResponse = `Great! Now let's watch the first section: "${currentChapter.title}"

⏯️ Watch from ${formatTime(currentChapter.startTime)} to ${formatTime(currentChapter.endTime)}

Pay close attention to: ${currentChapter.keyPoints[0] || 'the main concepts'}

Let me know when you're done watching!`;

        nextPhase = ConversationPhase.WATCHING;
        updatedState = {
          phase: ConversationPhase.WATCHING
        };
        break;

      case ConversationPhase.WATCHING:
        // User finished watching, now evaluate their understanding
        const chapterToEvaluate = analysis.chapters[conversationState.currentChapterIndex];
        const postWatchPrompt = generatePostWatchPrompt(
          chapterToEvaluate,
          userAnswer,
          updatedMessages
        );

        const evaluationResponse = await callClaudeForEvaluation(
          postWatchPrompt,
          updatedMessages
        );

        evaluation = evaluationResponse;
        
        if (evaluation.score >= 70) {
          // PASSED! Create checkpoint
          const checkpoint: Checkpoint = {
            id: `cp_${now}`,
            chapterId: chapterToEvaluate.title,
            chapterIndex: conversationState.currentChapterIndex,
            passed: true,
            score: evaluation.score,
            questionsAsked: updatedMessages.filter(m => m.role === 'ai').length,
            hintsUsed: conversationState.userProfile.hintsUsedTotal,
            timestamp: now,
            feedback: evaluation.feedback
          };

          const nextChapterIndex = conversationState.currentChapterIndex + 1;
          const hasMoreChapters = nextChapterIndex < analysis.chapters.length;

          if (hasMoreChapters) {
            const nextChapter = analysis.chapters[nextChapterIndex];
            aiResponse = generateCheckpointPrompt(chapterToEvaluate, evaluation.score, nextChapter);
            nextPhase = ConversationPhase.CHECKPOINT;
            
            updatedState = {
              phase: ConversationPhase.CHECKPOINT,
              unlockedChapters: [...conversationState.unlockedChapters, nextChapterIndex],
              chapterScores: {
                ...conversationState.chapterScores,
                [conversationState.currentChapterIndex]: evaluation.score
              },
              checkpoints: [...conversationState.checkpoints, checkpoint],
              userProfile: {
                ...conversationState.userProfile,
                overallComprehension: calculateAverageScore({
                  ...conversationState.chapterScores,
                  [conversationState.currentChapterIndex]: evaluation.score
                }),
                responseQuality: evaluation.score >= 85 ? 'excellent' : 
                                evaluation.score >= 70 ? 'adequate' : 'struggling'
              }
            };
          } else {
            // Course complete!
            aiResponse = generateCheckpointPrompt(chapterToEvaluate, evaluation.score);
            nextPhase = ConversationPhase.COMPLETE;
            
            updatedState = {
              phase: ConversationPhase.COMPLETE,
              chapterScores: {
                ...conversationState.chapterScores,
                [conversationState.currentChapterIndex]: evaluation.score
              },
              checkpoints: [...conversationState.checkpoints, checkpoint]
            };
          }
        } else if (evaluation.score >= 50) {
          // Needs follow-up
          const followUpPrompt = generateFollowUpPrompt(
            chapterToEvaluate,
            userAnswer,
            evaluation.weaknesses,
            evaluation.misconceptions
          );
          
          aiResponse = await callClaude(followUpPrompt, updatedMessages);
          nextPhase = ConversationPhase.FOLLOW_UP;
          
          updatedState = {
            phase: ConversationPhase.FOLLOW_UP,
            userProfile: {
              ...conversationState.userProfile,
              misconceptions: [
                ...conversationState.userProfile.misconceptions,
                ...evaluation.misconceptions
              ]
            }
          };
        } else {
          // Needs review - rewatch
          aiResponse = `I can see you're working hard, but let's review this section together.

${evaluation.feedback}

Try rewatching ${formatTime(chapterToEvaluate.startTime)} to ${formatTime(chapterToEvaluate.endTime)} and focus on:
${evaluation.weaknesses.map(w => `• ${w}`).join('\n')}

Let me know when you're ready to try again!`;

          nextPhase = ConversationPhase.REVIEW;
          
          updatedState = {
            phase: ConversationPhase.REVIEW
          };
        }
        break;

      case ConversationPhase.FOLLOW_UP:
        // Re-evaluate after follow-up question
        const followUpChapter = analysis.chapters[conversationState.currentChapterIndex];
        const reEvalPrompt = generatePostWatchPrompt(
          followUpChapter,
          userAnswer,
          updatedMessages
        );

        const reEvaluation = await callClaudeForEvaluation(reEvalPrompt, updatedMessages);
        evaluation = reEvaluation;

        if (evaluation.score >= 70) {
          // Now they got it!
          const checkpoint: Checkpoint = {
            id: `cp_${now}`,
            chapterId: followUpChapter.title,
            chapterIndex: conversationState.currentChapterIndex,
            passed: true,
            score: evaluation.score,
            questionsAsked: updatedMessages.filter(m => m.role === 'ai').length,
            hintsUsed: conversationState.userProfile.hintsUsedTotal,
            timestamp: now,
            feedback: 'Showed improvement with guidance'
          };

          const nextChapterIndex = conversationState.currentChapterIndex + 1;
          const hasMoreChapters = nextChapterIndex < analysis.chapters.length;

          if (hasMoreChapters) {
            const nextChapter = analysis.chapters[nextChapterIndex];
            aiResponse = generateCheckpointPrompt(followUpChapter, evaluation.score, nextChapter);
            nextPhase = ConversationPhase.CHECKPOINT;
            
            updatedState = {
              phase: ConversationPhase.CHECKPOINT,
              currentChapterIndex: nextChapterIndex,
              unlockedChapters: [...conversationState.unlockedChapters, nextChapterIndex],
              chapterScores: {
                ...conversationState.chapterScores,
                [conversationState.currentChapterIndex]: evaluation.score
              },
              checkpoints: [...conversationState.checkpoints, checkpoint]
            };
          } else {
            aiResponse = generateCheckpointPrompt(followUpChapter, evaluation.score);
            nextPhase = ConversationPhase.COMPLETE;
            updatedState = { phase: ConversationPhase.COMPLETE };
          }
        } else {
          // Still struggling, suggest review
          aiResponse = `Let's take a step back. ${evaluation.feedback}

Rewatch ${formatTime(followUpChapter.startTime)} to ${formatTime(followUpChapter.endTime)} one more time.

Would you like a hint, or shall we try again after rewatching?`;
          
          nextPhase = ConversationPhase.REVIEW;
          updatedState = { phase: ConversationPhase.REVIEW };
        }
        break;

      case ConversationPhase.CHECKPOINT:
        // User confirmed they're ready for next chapter
        const nextChapterIndex = conversationState.currentChapterIndex;
        const nextChapter = analysis.chapters[nextChapterIndex];
        
        const nextPreWatchPrompt = generatePreWatchPrompt(nextChapter, userAnswer);
        aiResponse = await callClaude(nextPreWatchPrompt, updatedMessages);
        
        evaluation = {
          score: 100,
          passed: true,
          strengths: [],
          weaknesses: [],
          misconceptions: [],
          needsFollowUp: false,
          nextPhase: ConversationPhase.PRE_WATCH,
          canProceed: true,
          feedback: 'Moving forward'
        };

        nextPhase = ConversationPhase.PRE_WATCH;
        updatedState = { phase: ConversationPhase.PRE_WATCH };
        break;

      case ConversationPhase.REVIEW:
        // User says they rewatched, ask comprehension question again
        const reviewChapter = analysis.chapters[conversationState.currentChapterIndex];
        const reviewPrompt = generatePostWatchPrompt(reviewChapter, userAnswer, updatedMessages);
        
        const reviewEval = await callClaudeForEvaluation(reviewPrompt, updatedMessages);
        evaluation = reviewEval;
        
        if (evaluation.score >= 70) {
          aiResponse = `Much better! ${evaluation.feedback}`;
          nextPhase = ConversationPhase.CHECKPOINT;
          // Continue to checkpoint logic...
        } else {
          aiResponse = evaluation.nextQuestion || 
                      "Let's try a different approach. " + evaluation.feedback;
          nextPhase = ConversationPhase.FOLLOW_UP;
        }
        
        updatedState = { phase: nextPhase };
        break;

      default:
        throw new Error(`Unknown phase: ${conversationState.phase}`);
    }

    // Add AI response to messages
    const aiMessage: Message = {
      id: `msg_${Date.now() + 1}`,
      role: 'ai',
      content: aiResponse,
      timestamp: Date.now(),
      messageType: nextPhase === ConversationPhase.CHECKPOINT ? 'checkpoint' : 'question',
      chapterId: conversationState.currentChapterIndex >= 0 ? 
                 analysis.chapters[conversationState.currentChapterIndex]?.title : undefined
    };

    const finalMessages = [...updatedMessages, aiMessage];

    // Build updated conversation state
    const finalConversationState: ConversationState = {
      ...conversationState,
      ...updatedState,
      messages: finalMessages,
      lastActivityAt: Date.now(),
      totalTimeSpent: conversationState.totalTimeSpent + (Date.now() - conversationState.lastActivityAt)
    };

    return NextResponse.json({
      success: true,
      conversationState: finalConversationState,
      evaluation,
      message: aiResponse
    });

  } catch (error) {
    console.error('Error evaluating answer:', error);
    return NextResponse.json(
      { 
        error: 'Failed to evaluate answer',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Call Claude for general responses (returns clean text only)
 */
async function callClaude(prompt: string, conversationHistory: Message[]): Promise<string> {
  const systemPrompt = `You are a friendly Socratic tutor. Respond ONLY with your question or message - NO JSON, NO formatting, just natural conversational text. Be warm, encouraging, and guide the student through questions.`;
  
  const command = new ConverseCommand({
    modelId: process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
    messages: [
      {
        role: 'user',
        content: [{ text: prompt }]
      }
    ],
    system: [{ text: systemPrompt }],
    inferenceConfig: {
      temperature: 0.7,
      maxTokens: 500,
    }
  });

  const response = await client.send(command);
  const text = response.output?.message?.content?.[0]?.text || 'I understand. Let\'s continue.';
  
  // Clean up any JSON artifacts
  return cleanJsonArtifacts(text);
}

/**
 * Call Claude for evaluation with structured output
 */
async function callClaudeForEvaluation(
  prompt: string,
  conversationHistory: Message[]
): Promise<EvaluationResult> {
  const evaluationPrompt = `${prompt}

Evaluate the student's answer and provide:
1. A score from 0-100
2. What they got right (strengths)
3. What they missed (weaknesses)
4. Any misconceptions
5. Encouraging feedback

Format: Start with "Score: X/100" then explain your evaluation naturally. Be encouraging!`;

  const command = new ConverseCommand({
    modelId: process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
    messages: [
      {
        role: 'user',
        content: [{ text: evaluationPrompt }]
      }
    ],
    system: [
      { 
        text: 'You are a Socratic tutor evaluating student understanding. Provide clear scores and feedback. Be specific about what they got right and wrong. Always be encouraging.' 
      }
    ],
    inferenceConfig: {
      temperature: 0.3,
      maxTokens: 800,
    }
  });

  const response = await client.send(command);
  const text = response.output?.message?.content?.[0]?.text || '';

  // Parse Claude's response to extract evaluation
  const evaluation = parseEvaluationFromText(text);
  
  return evaluation;
}

/**
 * Parse evaluation from Claude's text response
 */
function parseEvaluationFromText(text: string): EvaluationResult {
  // Extract score (look for numbers 0-100)
  const scoreMatch = text.match(/score[:\s]+(\d+)/i) || 
                     text.match(/(\d+)\/100/) ||
                     text.match(/(\d+)\s*out of\s*100/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;

  // Determine if passed
  const passed = score >= 70;

  // Extract sections (strengths, weaknesses, misconceptions)
  const strengths = extractBulletPoints(text, 'strength|correct|good|well');
  const weaknesses = extractBulletPoints(text, 'weakness|missing|unclear|incomplete');
  const misconceptions = extractBulletPoints(text, 'misconception|incorrect|error|wrong');

  // Get feedback
  const feedback = text.split('\n')[0] || 'Keep working on this concept.';

  return {
    score,
    passed,
    strengths: strengths.length > 0 ? strengths : ['Engaged with the material'],
    weaknesses: weaknesses.length > 0 ? weaknesses : [],
    misconceptions: misconceptions.length > 0 ? misconceptions : [],
    needsFollowUp: !passed && score >= 50,
    nextPhase: passed ? ConversationPhase.CHECKPOINT : 
               score >= 50 ? ConversationPhase.FOLLOW_UP : ConversationPhase.REVIEW,
    canProceed: passed,
    feedback
  };
}

/**
 * Extract bullet points from text
 */
function extractBulletPoints(text: string, keywords: string): string[] {
  const regex = new RegExp(`(${keywords})[^\\n]*\\n([^\\n]+)`, 'gi');
  const matches = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[2].trim());
  }
  
  return matches;
}

/**
 * Calculate average score
 */
function calculateAverageScore(scores: Record<string, number>): number {
  const values = Object.values(scores);
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Format seconds to MM:SS
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
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
