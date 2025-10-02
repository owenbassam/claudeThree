/**
 * Socratic Teaching Prompt System
 * 
 * This module contains all prompt templates and AI instructions
 * for guiding users through Socratic learning conversations.
 */

import { Chapter, KeyConcept, ConversationPhase, Message } from '@/types';

/**
 * System prompt that defines the Socratic tutor personality
 */
export const SOCRATIC_SYSTEM_PROMPT = `You are a Socratic AI tutor helping students learn from YouTube videos. Your teaching philosophy:

## Core Principles:
1. **Ask, don't tell**: Guide understanding through questions, never give direct explanations
2. **Probe deeply**: Follow up with "Why?" and "How?" to expose mental models
3. **Encourage thinking**: Even wrong answers are opportunities for deeper questions
4. **Be patient and kind**: Never condescending, always encouraging
5. **Gate progress**: Students must demonstrate understanding before proceeding

## Teaching Style:
- Use simple, clear language
- Ask one question at a time
- Reference specific video timestamps when relevant
- Celebrate correct reasoning, not just correct answers
- When students struggle, ask simpler questions rather than explaining
- Connect new concepts to prior knowledge

## Evaluation Criteria:
You assess understanding on:
- **Conceptual accuracy** (40%): Do they have the right mental model?
- **Depth** (30%): Can they explain WHY, not just WHAT?
- **Articulation** (20%): Can they express ideas clearly?
- **Connections** (10%): Do they relate concepts together?

Passing score: 70/100
- 85+: Excellent, challenge them with deeper questions
- 70-84: Good, proceed to next chapter
- 50-69: Needs follow-up, ask clarifying questions
- <50: Review required, guide them to rewatch key sections

## Response Format:
Always respond in JSON:
{
  "message": "Your question or feedback",
  "evaluation": {
    "score": 0-100,
    "passed": boolean,
    "strengths": ["what they got right"],
    "weaknesses": ["what's missing"],
    "misconceptions": ["specific errors in thinking"],
    "needsFollowUp": boolean,
    "feedback": "encouraging message"
  },
  "nextPhase": "pre_watch|post_watch|follow_up|checkpoint|review",
  "instruction": {
    "type": "watch|answer|reflect",
    "startTime": 123,
    "endTime": 456,
    "focusOn": "specific concept to pay attention to"
  }
}`;

/**
 * Generate initial greeting and pre-assessment question
 */
export function generateInitialPrompt(videoTitle: string, topic: string): string {
  return `You're starting a learning session for the video: "${videoTitle}"

Topic: ${topic}

Generate a warm greeting and ask the user what they already know about this topic. This helps you:
1. Assess their prior knowledge
2. Activate relevant mental models
3. Set the right difficulty level

Make it conversational and encouraging. Don't be too formal.`;
}

/**
 * Generate pre-watch question for a chapter
 */
export function generatePreWatchPrompt(
  chapter: Chapter,
  priorKnowledge: string
): string {
  return `The user is about to watch: "${chapter.title}"
Chapter summary: ${chapter.summary}
Key points: ${chapter.keyPoints.join(', ')}

Their prior knowledge: "${priorKnowledge}"

Generate a pre-watch question that:
1. Activates relevant prior knowledge
2. Sets a learning goal
3. Primes them to pay attention to key concepts
4. Makes them curious about what they'll learn

Examples:
- "Why do you think [concept] might be important?"
- "What questions do you have about [topic]?"
- "Have you encountered [term] before? Where?"

Keep it short and engaging.`;
}

/**
 * Generate post-watch evaluation prompt
 */
export function generatePostWatchPrompt(
  chapter: Chapter,
  userAnswer: string,
  conversationHistory: Message[]
): string {
  const historyContext = conversationHistory
    .slice(-6) // Last 3 exchanges
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  return `The user just watched: "${chapter.title}"
Chapter summary: ${chapter.summary}
Key concepts: ${chapter.keyPoints.join(', ')}

Recent conversation:
${historyContext}

User's answer: "${userAnswer}"

Evaluate their understanding:
1. Did they grasp the main concept?
2. Can they explain WHY, not just WHAT?
3. Are there misconceptions?
4. Is their reasoning sound?

Score them 0-100 based on:
- Conceptual accuracy (40%)
- Depth of understanding (30%)  
- Clear articulation (20%)
- Making connections (10%)

If score >= 70: Congratulate and unlock next chapter
If score 50-69: Ask a follow-up question to clarify
If score < 50: Suggest rewatching specific section with focus

Be encouraging even when they're wrong. Guide them to discover the answer.`;
}

/**
 * Generate Socratic follow-up question
 */
export function generateFollowUpPrompt(
  chapter: Chapter,
  userAnswer: string,
  weaknesses: string[],
  misconceptions: string[]
): string {
  return `The user's answer shows some gaps:
Weaknesses: ${weaknesses.join(', ')}
Misconceptions: ${misconceptions.join(', ')}

Their answer: "${userAnswer}"
Context: "${chapter.title}" - ${chapter.summary}

Generate a Socratic follow-up question that:
1. Doesn't point out they're wrong directly
2. Guides them to discover the issue themselves
3. Uses questions like "What makes you say that?" or "Can you explain why?"
4. References specific details from the video if helpful

Never give the answer. Make them think.`;
}

/**
 * Generate hint without revealing answer
 */
export function generateHintPrompt(
  question: string,
  userAnswer: string,
  hintLevel: 1 | 2 | 3 | 4,
  chapter: Chapter
): string {
  const hintGuidance = {
    1: 'Very vague nudge - just point them in the right direction',
    2: 'Point to relevant video section or concept to review',
    3: 'Give more specific guidance but still no answer',
    4: 'Rephrase as an easier question, but don\'t give the answer'
  };

  return `User is struggling with this question: "${question}"
Their answer: "${userAnswer}"
Context: ${chapter.title}

Generate hint level ${hintLevel}: ${hintGuidance[hintLevel]}

Examples by level:
Level 1: "Think about what we discussed earlier about..."
Level 2: "Rewatch 3:45-4:20 and pay attention to [concept]"
Level 3: "Remember, the key factor is [hint at concept]"
Level 4: "Let me ask it differently: [easier version of question]"

Make it helpful but not answer-giving.`;
}

/**
 * Generate checkpoint celebration message
 */
export function generateCheckpointPrompt(
  chapter: Chapter,
  score: number,
  nextChapter?: Chapter
): string {
  const celebration = score >= 90 ? 'Outstanding' :
                     score >= 80 ? 'Excellent' :
                     'Good job';

  if (nextChapter) {
    return `${celebration}! You've demonstrated solid understanding of "${chapter.title}" (${score}/100).

🔓 Chapter ${nextChapter.title} is now unlocked!

Ready to continue?`;
  }

  return `${celebration}! You've completed all chapters with a score of ${score}/100.

🎉 Course complete! You've demonstrated deep understanding of this material.`;
}

/**
 * Generate review/remediation prompt
 */
export function generateReviewPrompt(
  chapter: Chapter,
  score: number,
  misconceptions: string[]
): string {
  return `Let's review "${chapter.title}". Your score was ${score}/100, which shows you need a bit more time with this material.

Key areas to focus on:
${misconceptions.map(m => `- ${m}`).join('\n')}

I recommend rewatching ${chapter.startTime}-${chapter.endTime} and paying special attention to these concepts.

Let me know when you're ready to try again!`;
}

/**
 * Helper: Extract key concepts from chapter for context
 */
export function extractKeyConceptsContext(
  chapter: Chapter,
  keyConcepts: KeyConcept[]
): string {
  const chapterConcepts = keyConcepts.filter(
    kc => kc.timestamp >= chapter.startTime && kc.timestamp <= chapter.endTime
  );

  if (chapterConcepts.length === 0) {
    return `Main points: ${chapter.keyPoints.join(', ')}`;
  }

  return chapterConcepts
    .map(kc => `${kc.term}: ${kc.definition}`)
    .join('\n');
}

/**
 * Helper: Format conversation history for Claude
 */
export function formatConversationHistory(messages: Message[]): string {
  return messages
    .map(m => {
      const role = m.role === 'ai' ? 'Assistant' : 'User';
      return `${role}: ${m.content}`;
    })
    .join('\n\n');
}

/**
 * Helper: Determine appropriate question difficulty
 */
export function getQuestionDifficulty(
  userProfile: { 
    overallComprehension: number;
    responseQuality: 'struggling' | 'adequate' | 'excellent';
  }
): 'recall' | 'application' | 'synthesis' {
  if (userProfile.responseQuality === 'excellent' && userProfile.overallComprehension >= 85) {
    return 'synthesis'; // Ask about connections and implications
  } else if (userProfile.responseQuality === 'adequate' || userProfile.overallComprehension >= 70) {
    return 'application'; // Ask them to apply concepts
  } else {
    return 'recall'; // Simpler questions about what they learned
  }
}

/**
 * Build complete Claude API request for Socratic tutoring
 */
export function buildSocraticRequest(
  promptType: 'initial' | 'pre_watch' | 'post_watch' | 'follow_up' | 'hint',
  context: {
    videoTitle?: string;
    topic?: string;
    chapter?: Chapter;
    userAnswer?: string;
    conversationHistory?: Message[];
    priorKnowledge?: string;
    weaknesses?: string[];
    misconceptions?: string[];
    hintLevel?: 1 | 2 | 3 | 4;
    question?: string;
  }
) {
  let userPrompt = '';

  switch (promptType) {
    case 'initial':
      userPrompt = generateInitialPrompt(context.videoTitle!, context.topic!);
      break;
    case 'pre_watch':
      userPrompt = generatePreWatchPrompt(context.chapter!, context.priorKnowledge!);
      break;
    case 'post_watch':
      userPrompt = generatePostWatchPrompt(
        context.chapter!,
        context.userAnswer!,
        context.conversationHistory!
      );
      break;
    case 'follow_up':
      userPrompt = generateFollowUpPrompt(
        context.chapter!,
        context.userAnswer!,
        context.weaknesses!,
        context.misconceptions!
      );
      break;
    case 'hint':
      userPrompt = generateHintPrompt(
        context.question!,
        context.userAnswer!,
        context.hintLevel!,
        context.chapter!
      );
      break;
  }

  return {
    system: SOCRATIC_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userPrompt
      }
    ]
  };
}
