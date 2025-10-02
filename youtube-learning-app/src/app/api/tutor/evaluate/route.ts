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
  LearningAnalysis,
  Chapter
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

      case ConversationPhase.WATCHING:
        // User says they finished watching - ask them a comprehension question
        const chapterToAsk = analysis.chapters[conversationState.currentChapterIndex];
        
        // Check if user is just saying "done", "continue", or similar (including variations like "done watching")
        const isDoneMessage = /^(done|finished|ready|watched|ok|okay|continue)(\s+(watching|with\s+video|now))?$/i.test(userAnswer.trim());
        
        // Check if user is asking for help/options (not an actual answer attempt)
        const isHelpRequest = /^(hint|skip|help|simpler|easier|no|i don't know|idk)$/i.test(userAnswer.trim());
        
        if (isDoneMessage) {
          // They just said they're done - now ask the comprehension question
          const comprehensionPrompt = `<task>Generate a specific comprehension question that tests the student's understanding of what they just watched.</task>

<chapter_context>
Chapter: "${chapterToAsk.title}"
Timestamp Range: ${formatTime(chapterToAsk.startTime)} to ${formatTime(chapterToAsk.endTime)}
Summary: ${chapterToAsk.summary}
Key Concepts Covered: ${chapterToAsk.keyPoints.join(', ')}
</chapter_context>

<instructions>
The student has just finished watching this chapter. Create a single, focused question that tests genuine understanding of the core concepts.

Your question should require them to:
- Explain a key concept from the chapter in their own words (tests understanding vs memorization)
- Describe why something matters or how it works (tests deeper comprehension)
- Make connections between ideas presented in the chapter (tests synthesis)

Make your question specific to the actual content covered. Use concrete concepts from the key points list above. Avoid generic questions that could apply to any video.

Why this matters: This comprehension check determines whether they understood enough to progress. Your question should test real understanding, not superficial recall.
</instructions>

<output_format>
Write your question as natural conversational text. Be warm and encouraging. Keep it focused - one clear question that tests their grasp of the material.
</output_format>`;

          aiResponse = await callClaude(comprehensionPrompt, updatedMessages);
          
          evaluation = {
            score: 100,
            passed: true,
            strengths: [],
            weaknesses: [],
            misconceptions: [],
            needsFollowUp: false,
            nextPhase: ConversationPhase.POST_WATCH,
            canProceed: false,
            feedback: 'Asking comprehension question'
          };
          
          nextPhase = ConversationPhase.POST_WATCH;
          updatedState = { phase: ConversationPhase.POST_WATCH };
          break;
        }
        
        // They gave an actual answer - evaluate it
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
              consecutiveFailures: 0, // Reset on success
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
              checkpoints: [...conversationState.checkpoints, checkpoint],
              consecutiveFailures: 0 // Reset on completion
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
          // Track failure
          const newConsecutiveFailures = (conversationState.consecutiveFailures || 0) + 1;
          const newTotalFailures = (conversationState.totalFailures || 0) + 1;
          
          // Check for frustration
          const frustrationCheck = checkFrustration(newConsecutiveFailures, chapterToEvaluate);
          
          if (frustrationCheck.isStuck) {
            // User is stuck - offer help options
            aiResponse = frustrationCheck.helpMessage!;
          } else {
            // Normal review message
            const focusPoints = evaluation.weaknesses.length > 0 
              ? evaluation.weaknesses.map(w => `• ${w}`).join('\n')
              : `• ${chapterToEvaluate.keyPoints[0] || 'the main concepts'}`;
            
            aiResponse = `I can see you're working hard, but let's review this section together.

${evaluation.feedback}

Try rewatching ${formatTime(chapterToEvaluate.startTime)} to ${formatTime(chapterToEvaluate.endTime)} and focus on:
${focusPoints}

Let me know when you're ready to try again!`;
          }

          nextPhase = ConversationPhase.REVIEW;
          
          updatedState = {
            phase: ConversationPhase.REVIEW,
            consecutiveFailures: newConsecutiveFailures,
            totalFailures: newTotalFailures
          };
        }
        break;

      case ConversationPhase.POST_WATCH:
        // User answered the comprehension question - now evaluate it
        const postWatchChapter = analysis.chapters[conversationState.currentChapterIndex];
        const evaluatePrompt = generatePostWatchPrompt(
          postWatchChapter,
          userAnswer,
          updatedMessages
        );

        const postWatchEval = await callClaudeForEvaluation(evaluatePrompt, updatedMessages);
        evaluation = postWatchEval;
        
        // Same logic as WATCHING phase after evaluation
        if (evaluation.score >= 70) {
          // PASSED!
          const checkpoint: Checkpoint = {
            id: `cp_${now}`,
            chapterId: postWatchChapter.title,
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
            aiResponse = generateCheckpointPrompt(postWatchChapter, evaluation.score, nextChapter);
            nextPhase = ConversationPhase.CHECKPOINT;
            
            updatedState = {
              phase: ConversationPhase.CHECKPOINT,
              unlockedChapters: [...conversationState.unlockedChapters, nextChapterIndex],
              chapterScores: {
                ...conversationState.chapterScores,
                [conversationState.currentChapterIndex]: evaluation.score
              },
              checkpoints: [...conversationState.checkpoints, checkpoint],
              consecutiveFailures: 0, // Reset on success
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
            // Course complete! Save final chapter score
            aiResponse = generateCheckpointPrompt(postWatchChapter, evaluation.score);
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
            postWatchChapter,
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
          // Needs review - track failure
          const newConsecutiveFailures = (conversationState.consecutiveFailures || 0) + 1;
          const newTotalFailures = (conversationState.totalFailures || 0) + 1;
          
          // Check for frustration
          const frustrationCheck = checkFrustration(newConsecutiveFailures, postWatchChapter);
          
          if (frustrationCheck.isStuck) {
            // User is stuck - offer help options
            aiResponse = frustrationCheck.helpMessage!;
          } else {
            // Normal review message
            const focusPoints = evaluation.weaknesses.length > 0 
              ? evaluation.weaknesses.map(w => `• ${w}`).join('\n')
              : `• ${postWatchChapter.keyPoints[0] || 'the main concepts'}`;
            
            aiResponse = `I can see you're working hard, but let's review this section together.

${evaluation.feedback}

Try rewatching ${formatTime(postWatchChapter.startTime)} to ${formatTime(postWatchChapter.endTime)} and focus on:
${focusPoints}

Let me know when you're ready to try again!`;
          }

          nextPhase = ConversationPhase.REVIEW;
          updatedState = { 
            phase: ConversationPhase.REVIEW,
            consecutiveFailures: newConsecutiveFailures,
            totalFailures: newTotalFailures
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
              checkpoints: [...conversationState.checkpoints, checkpoint],
              consecutiveFailures: 0 // Reset on success
            };
          } else {
            aiResponse = generateCheckpointPrompt(followUpChapter, evaluation.score);
            nextPhase = ConversationPhase.COMPLETE;
            updatedState = { 
              phase: ConversationPhase.COMPLETE,
              consecutiveFailures: 0 // Reset on completion
            };
          }
        } else {
          // Still struggling, suggest review - track failure
          const newConsecutiveFailures = (conversationState.consecutiveFailures || 0) + 1;
          const newTotalFailures = (conversationState.totalFailures || 0) + 1;
          
          // Check for frustration
          const frustrationCheck = checkFrustration(newConsecutiveFailures, followUpChapter);
          
          if (frustrationCheck.isStuck) {
            // User is stuck - offer help options
            aiResponse = frustrationCheck.helpMessage!;
          } else {
            // Normal review message
            aiResponse = `Let's take a step back. ${evaluation.feedback}

Rewatch ${formatTime(followUpChapter.startTime)} to ${formatTime(followUpChapter.endTime)} one more time.

Would you like a hint, or shall we try again after rewatching?`;
          }
          
          nextPhase = ConversationPhase.REVIEW;
          updatedState = { 
            phase: ConversationPhase.REVIEW,
            consecutiveFailures: newConsecutiveFailures,
            totalFailures: newTotalFailures
          };
        }
        break;

      case ConversationPhase.CHECKPOINT:
        // User clicked Continue - move to next chapter
        const nextChapterIndex = conversationState.currentChapterIndex + 1;
        const nextChapter = analysis.chapters[nextChapterIndex];
        
        // Skip pre-watch, go straight to watching instruction with timestamps
        aiResponse = `Great! Now watch "${nextChapter.title}" (${formatTime(nextChapter.startTime)} to ${formatTime(nextChapter.endTime)}).

Pay attention to: ${nextChapter.keyPoints[0] || 'the main concepts'}

When you're done, click the "Continue" button below.`;
        
        evaluation = {
          score: 100,
          passed: true,
          strengths: [],
          weaknesses: [],
          misconceptions: [],
          needsFollowUp: false,
          nextPhase: ConversationPhase.WATCHING,
          canProceed: true,
          feedback: 'Moving forward'
        };

        nextPhase = ConversationPhase.WATCHING;
        updatedState = { 
          phase: ConversationPhase.WATCHING,
          currentChapterIndex: nextChapterIndex
        };
        break;

      case ConversationPhase.REVIEW:
        // Check if user is asking for help
        const reviewChapter = analysis.chapters[conversationState.currentChapterIndex];
        const isReviewHelpRequest = /^(hint|simpler|easier|skip)$/i.test(userAnswer.trim());
        
        if (isReviewHelpRequest) {
          // User wants a simpler question, hint, or rewatch
          if (/simpler|easier/i.test(userAnswer)) {
            // Generate a simpler, more direct question
            aiResponse = `Okay, let's break this down into a simpler question:

**What is the main purpose of having a coordinate system when working with vectors?**

Think about what the video showed - why do we use x, y, z coordinates to describe vectors? What does it allow us to do?`;
            
            nextPhase = ConversationPhase.REVIEW;
            evaluation = {
              score: 0,
              passed: false,
              strengths: [],
              weaknesses: [],
              misconceptions: [],
              needsFollowUp: true,
              nextPhase: ConversationPhase.REVIEW,
              canProceed: false,
              feedback: 'Simplified question'
            };
            updatedState = { phase: ConversationPhase.REVIEW };
            break;
          } else if (/hint/i.test(userAnswer)) {
            // They want a hint - tell them to use the hint button
            aiResponse = `I'd love to give you a hint! Click the 💡 **Hint** button below the input box to get progressive hints that will guide you without giving away the answer.

Try clicking it now, and you'll get your first hint!`;
            
            nextPhase = ConversationPhase.REVIEW;
            evaluation = {
              score: 0,
              passed: false,
              strengths: [],
              weaknesses: [],
              misconceptions: [],
              needsFollowUp: true,
              nextPhase: ConversationPhase.REVIEW,
              canProceed: false,
              feedback: 'Hint button guidance'
            };
            updatedState = { phase: ConversationPhase.REVIEW };
            break;
          } else if (/rewatch|skip/i.test(userAnswer)) {
            // Encourage rewatching with guidance
            aiResponse = `Good idea! Let's rewatch ${formatTime(reviewChapter.startTime)} to ${formatTime(reviewChapter.endTime)}.

This time, focus specifically on: ${reviewChapter.keyPoints[0]}

When you're done watching, try answering the question again. You've got this!`;
            
            nextPhase = ConversationPhase.REVIEW;
            evaluation = {
              score: 0,
              passed: false,
              strengths: [],
              weaknesses: [],
              misconceptions: [],
              needsFollowUp: true,
              nextPhase: ConversationPhase.REVIEW,
              canProceed: false,
              feedback: 'Rewatch guidance'
            };
            updatedState = { phase: ConversationPhase.REVIEW };
            break;
          }
        }
        
        // Normal review path - evaluate their answer
        const reviewPrompt = generatePostWatchPrompt(reviewChapter, userAnswer, updatedMessages);
        const reviewEval = await callClaudeForEvaluation(reviewPrompt, updatedMessages);
        evaluation = reviewEval;
        
        if (evaluation.score >= 70) {
          // PASSED after review!
          const reviewCheckpoint: Checkpoint = {
            id: `cp_${now}`,
            chapterId: reviewChapter.title,
            chapterIndex: conversationState.currentChapterIndex,
            passed: true,
            score: evaluation.score,
            questionsAsked: updatedMessages.filter(m => m.role === 'ai').length,
            hintsUsed: conversationState.userProfile.hintsUsedTotal,
            timestamp: now,
            feedback: 'Improved after review'
          };

          const nextChapterIndex = conversationState.currentChapterIndex + 1;
          const hasMoreChapters = nextChapterIndex < analysis.chapters.length;

          if (hasMoreChapters) {
            const nextChapter = analysis.chapters[nextChapterIndex];
            aiResponse = generateCheckpointPrompt(reviewChapter, evaluation.score, nextChapter);
            nextPhase = ConversationPhase.CHECKPOINT;
            
            updatedState = {
              phase: ConversationPhase.CHECKPOINT,
              unlockedChapters: [...conversationState.unlockedChapters, nextChapterIndex],
              chapterScores: {
                ...conversationState.chapterScores,
                [conversationState.currentChapterIndex]: evaluation.score
              },
              checkpoints: [...conversationState.checkpoints, reviewCheckpoint],
              consecutiveFailures: 0, // Reset on success
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
            // Course complete after review!
            aiResponse = generateCheckpointPrompt(reviewChapter, evaluation.score);
            nextPhase = ConversationPhase.COMPLETE;
            
            updatedState = {
              phase: ConversationPhase.COMPLETE,
              chapterScores: {
                ...conversationState.chapterScores,
                [conversationState.currentChapterIndex]: evaluation.score
              },
              checkpoints: [...conversationState.checkpoints, reviewCheckpoint]
            };
          }
        } else {
          aiResponse = evaluation.nextQuestion || 
                      "Let's try a different approach. " + evaluation.feedback;
          nextPhase = ConversationPhase.FOLLOW_UP;
          updatedState = { phase: nextPhase };
        }
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
      messageType: (nextPhase === ConversationPhase.CHECKPOINT || nextPhase === ConversationPhase.COMPLETE) ? 'checkpoint' : 'question',
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
  const systemPrompt = `You are a warm, encouraging Socratic tutor guiding students through discovery-based learning. 

Your responses will be displayed directly to the student, so write in smooth, natural prose as if having a conversation with a curious learner. Guide them through carefully crafted questions that help them build understanding themselves.

Use conversational language. Reference specific video timestamps in **bold** (format: **MM:SS**) when directing their attention. Be supportive and patient - learning is a journey of discovery.`;
  
  const command = new ConverseCommand({
    modelId: process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
    messages: [
      {
        role: 'user',
        content: [{ text: `${prompt}\n\nWrite your response as natural conversational text. Your message will be shown directly to the student, so be warm and encouraging.` }]
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

<evaluation_output_format>
Begin your response with the score on the first line in this exact format: "Score: X/100"

Then provide your evaluation in natural prose covering:
- What the student demonstrated well (specific strengths)
- What concepts they missed or misunderstood (specific weaknesses)
- Any misconceptions in their reasoning
- Encouraging feedback that motivates continued learning

Write naturally and conversationally. Be specific about what they got right and what needs work. Your evaluation should be thorough yet supportive - this is formative assessment, not judgment.
</evaluation_output_format>`;

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
        text: `You are a Socratic tutor performing careful evaluation of student understanding. Your assessment determines whether they can progress, so accuracy is critical.

Why evaluation matters: Fair assessment ensures students build solid foundations. Passing students forward with gaps causes frustration later, while holding back students who understand prevents progress. Be thorough and calibrated in your scoring.

Use the evaluation rubric from your system instructions: Conceptual Accuracy (40%), Depth (30%), Articulation (20%), Connections (10%). Be specific about strengths and weaknesses. Your feedback should be encouraging yet honest.` 
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
 * Detect if user is frustrated and offer help
 */
function checkFrustration(consecutiveFailures: number, chapter: Chapter): { isStuck: boolean; helpMessage?: string } {
  if (consecutiveFailures >= 2) {
    return {
      isStuck: true,
      helpMessage: `I notice you're having trouble with this section. That's completely normal - this is challenging material! Let me help you out.

Here are your options:

1. **Type "hint"** - I'll guide you toward the key concepts using the hint system (click the 💡 button)
2. **Type "rewatch"** - I'll have you rewatch ${formatTime(chapter.startTime)} to ${formatTime(chapter.endTime)} focusing on: ${chapter.keyPoints[0]}
3. **Type "simpler"** - I'll ask you an easier, more direct question

Just type one of those words, or give the question another try!`
    };
  }
  
  return { isStuck: false };
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
