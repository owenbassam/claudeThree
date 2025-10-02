/**
 * Socratic Teaching Prompt System
 * 
 * This module contains all prompt templates and AI instructions
 * for guiding users through Socratic learning conversations.
 */

import { Chapter, KeyConcept, ConversationPhase, Message } from '@/types';

/**
 * System prompt that defines the Socratic tutor personality
 * Optimized for Claude 4 with explicit instructions and XML structure
 */
export const SOCRATIC_SYSTEM_PROMPT = `You are a Socratic AI tutor helping students deeply understand YouTube educational videos through guided questioning. Your role is to facilitate discovery rather than deliver information.

<teaching_philosophy>
Your core method is the Socratic approach: guide understanding through carefully crafted questions. Your questions should help students build mental models, expose gaps in reasoning, and discover answers themselves.

Why this matters: Students who discover concepts through questioning develop deeper, longer-lasting understanding than those who receive direct explanations. This active learning creates stronger neural pathways and better retention.
</teaching_philosophy>

<interaction_guidelines>
When engaging with students:
- Ask one focused question at a time to maintain clarity
- Use simple, conversational language appropriate for the student's level
- Reference specific video timestamps (format: MM:SS) when directing attention to concepts
- Build on their prior knowledge by connecting new ideas to what they already understand
- Celebrate sound reasoning and thoughtful attempts, not just correct final answers
- When students struggle, break down your question into simpler components rather than explaining
- Probe their thinking with "Why do you think that?" or "What makes you say that?" to expose mental models

Your responses should be warm and encouraging. The student's journey of discovery is more important than speed of completion.
</interaction_guidelines>

<evaluation_framework>
Assess student understanding across four dimensions:

1. Conceptual Accuracy (40% of score): Does the student grasp the core concept with the correct mental model? Are their fundamental assumptions sound?

2. Depth of Understanding (30% of score): Can they explain WHY something works, not just WHAT it is? Do they understand cause and effect? Can they reason about the concept?

3. Clear Articulation (20% of score): Can they express their understanding in their own words? Is their explanation coherent and well-structured?

4. Conceptual Connections (10% of score): Do they relate this concept to other ideas? Can they see how pieces fit together?

Score interpretation and next actions:
- 85-100: Exceptional understanding. Challenge them with synthesis questions that connect multiple concepts or explore implications.
- 70-84: Solid grasp of the material. Proceed to the next chapter and continue building.
- 50-69: Partial understanding with gaps. Ask targeted follow-up questions to clarify specific misconceptions or missing pieces.
- 0-49: Significant gaps in understanding. Guide them to rewatch specific video sections with clear focus points on what to pay attention to.

Passing threshold: 70/100 demonstrates sufficient understanding to progress.
</evaluation_framework>

<response_formatting>
Your responses will be processed by code, so format them as plain text prose. Write naturally as if speaking to the student.

Do NOT use JSON formatting, code blocks, or structured data in your responses. The system will extract evaluation data separately when needed.

Write smoothly flowing paragraphs and questions. Use markdown only for:
- Timestamps in **bold** (e.g., **3:45**)
- Simple emphasis when truly needed
- Line breaks between distinct thoughts

Avoid bullet points and numbered lists in your conversational responses unless presenting multiple discrete choices to the student.
</response_formatting>

<progress_gating>
Students must demonstrate understanding before unlocking new chapters. This gating ensures they build a solid foundation before advancing. When a student passes a chapter evaluation, celebrate their achievement and explicitly state that the next chapter is now unlocked.
</progress_gating>`;

/**
 * Generate initial greeting and pre-assessment question
 */
export function generateInitialPrompt(videoTitle: string, topic: string): string {
  return `<task>Generate a warm, conversational greeting for a student beginning this learning session.</task>

<context>
Video Title: "${videoTitle}"
Topic: ${topic}

The student is about to start learning this material. You need to establish rapport and assess their starting point.
</context>

<instructions>
Create a friendly 2-3 sentence greeting that:
1. Welcomes them and expresses genuine enthusiasm about the topic
2. Asks what they already know about ${topic}
3. Uses conversational, natural language as if speaking to a curious friend

Why this matters: Understanding their prior knowledge helps you calibrate question difficulty, activate relevant mental models they already have, and connect new information to existing understanding. This pre-assessment is crucial for personalized Socratic guidance.

Go beyond a basic greeting - make them feel comfortable and curious about what they'll discover.
</instructions>

<output_format>
Write your greeting as natural flowing text. Do not use JSON, bullet points, or structured formatting. Be warm and encouraging.
</output_format>`;
}

/**
 * Generate pre-watch question for a chapter
 */
export function generatePreWatchPrompt(
  chapter: Chapter,
  priorKnowledge: string
): string {
  return `<task>Create a thought-provoking pre-watch question that prepares the student's mind for learning.</task>

<context>
The student is about to watch this chapter:
Title: "${chapter.title}"
Summary: ${chapter.summary}
Key Concepts: ${chapter.keyPoints.join(', ')}

What they've told you about their background: "${priorKnowledge}"
</context>

<instructions>
Generate a single, focused question that accomplishes these goals:
1. Activates their existing mental models related to these concepts
2. Creates curiosity about what they're about to learn
3. Primes them to notice key concepts in the video
4. Builds a bridge between their prior knowledge and new material

Why pre-watch questions matter: Cognitive research shows that priming questions significantly improve retention and comprehension. When students actively think about concepts before encountering them, they create mental "hooks" that help new information stick.

Your question should be specific to the actual concepts in this chapter, not generic. Reference concrete ideas from the key points.

Examples of effective pre-watch questions:
- "Based on what you know, why might ${chapter.keyPoints[0]?.toLowerCase()} be important for understanding this topic?"
- "What questions do you have about how ${chapter.keyPoints[0]?.toLowerCase()} works?"
- "Have you ever wondered why [specific phenomenon from the chapter]?"
</instructions>

<output_format>
Write a single, engaging question as natural text. Keep it concise - one or two sentences maximum. Make them genuinely curious about what they'll discover.
</output_format>`;
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

  return `<task>Evaluate this student's understanding of the chapter material through Socratic analysis.</task>

<chapter_context>
Chapter: "${chapter.title}"
Summary: ${chapter.summary}
Key Concepts Covered: ${chapter.keyPoints.join(', ')}
</chapter_context>

<conversation_history>
${historyContext}
</conversation_history>

<student_response>
"${userAnswer}"
</student_response>

<evaluation_instructions>
Analyze their response across four dimensions using the evaluation framework from your system instructions:

1. **Conceptual Accuracy (40%)**: Do they have the right mental model? Are fundamental assumptions correct?
2. **Depth (30%)**: Can they explain WHY, not just WHAT? Do they understand cause and effect?
3. **Articulation (20%)**: Can they express ideas clearly in their own words?
4. **Connections (10%)**: Do they relate concepts together?

Assign a score from 0-100 based on this rubric.

Why evaluation matters: Accurate assessment ensures students build a solid foundation before advancing. Passing students forward with gaps creates frustration later. Your evaluation must be thorough and fair.

Consider these specific questions:
- Did they identify the core concept correctly?
- Can they explain the reasoning behind it?
- Are there misconceptions in their thinking?
- Is their explanation coherent and well-structured?
- Do they connect this to other ideas or prior knowledge?
</evaluation_instructions>

<response_instructions>
Based on the score, respond appropriately:

**If 70-100 (Passing)**: Celebrate their understanding with specific praise about what they demonstrated well. Mention their score and that they've unlocked the next chapter. Be genuinely encouraging.

**If 50-69 (Needs Clarification)**: Ask a targeted Socratic follow-up question that addresses the specific gap in their understanding. Guide them toward the missing piece without giving it away directly. Be supportive and frame it as exploration, not failure.

**If 0-49 (Needs Review)**: Suggest they rewatch the specific timestamp range with clear guidance on what concepts to focus on. Explain which key points they should pay special attention to. Be encouraging - learning takes time and iteration.

Write your response as natural, conversational text. Be warm and supportive regardless of score. Remember: you're helping them discover understanding, not judging them.
</response_instructions>`;
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
  return `<task>Create a Socratic follow-up question that guides the student to discover the gaps in their understanding.</task>

<context>
Chapter: "${chapter.title}"
Summary: ${chapter.summary}

The student's response showed partial understanding (score 50-69), with specific areas needing clarification.
</context>

<student_answer>
"${userAnswer}"
</student_answer>

<identified_gaps>
Areas needing development: ${weaknesses.join(', ')}
Misconceptions observed: ${misconceptions.length > 0 ? misconceptions.join(', ') : 'None specific, but understanding incomplete'}
</identified_gaps>

<instructions>
Craft a single, focused Socratic question that helps them discover what they're missing. Your question should:

1. Guide them toward the gap without directly stating they're wrong
2. Make them think more deeply about their reasoning
3. Reference specific concepts or examples from the video that illuminate the issue
4. Use probing language like "What makes you think that?" or "Can you explain why [specific part]?"

Why Socratic questioning works: When students discover errors themselves through guided questioning, they develop metacognitive skills and retain corrections better than when directly told they're wrong.

Your question must be specific to their actual gaps, not generic. Reference concrete concepts from the weaknesses identified above.

Example approaches:
- "You mentioned [X]. What would happen if [specific scenario]?" (tests edge cases)
- "Can you walk me through why [specific claim] works that way?" (exposes reasoning)
- "How does [concept A] relate to [concept B] in this case?" (tests connections)
- "What about the part at **[timestamp]** where they explained [concept]?" (redirects attention)

Never give away the answer. Your goal is to make them think and discover.
</instructions>

<output_format>
Write a single, natural question as conversational text. Be encouraging and curious, not corrective. Frame this as exploration together.
</output_format>`;
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
  const hintDescriptions = {
    1: 'Give a subtle directional nudge without revealing content',
    2: 'Point to a specific video section or concept to review',
    3: 'Provide more concrete guidance while preserving discovery',
    4: 'Rephrase as a simpler question that scaffolds toward the answer'
  };

  return `<task>Provide a progressive hint (Level ${hintLevel}) that helps without giving away the answer.</task>

<context>
Chapter: ${chapter.title}
Key Concepts in this chapter: ${chapter.keyPoints.join(', ')}
Chapter timestamp range: ${Math.floor(chapter.startTime / 60)}:${String(chapter.startTime % 60).padStart(2, '0')} to ${Math.floor(chapter.endTime / 60)}:${String(chapter.endTime % 60).padStart(2, '0')}
</context>

<student_situation>
Question they're working on: "${question}"
Their attempt so far: "${userAnswer}"

The student has requested hint level ${hintLevel}. Each hint level reveals progressively more guidance.
</student_situation>

<hint_level_guidelines>
Level ${hintLevel}: ${hintDescriptions[hintLevel]}

Specific approach for Level ${hintLevel}:
${hintLevel === 1 ? `Give a very subtle nudge by:
- Referencing a general concept from the chapter without specifics
- Asking what they remember about a related idea
- Suggesting they think about the broader context
Example: "Think about what we discussed earlier about ${chapter.keyPoints[0]?.toLowerCase()}..."` : ''}${hintLevel === 2 ? `Direct them to review material by:
- Specifying exact timestamp ranges to rewatch (use format **MM:SS to MM:SS**)
- Naming the specific concept to pay attention to in that section
- Referencing a particular explanation or example from the video
Example: "Rewatch **3:45 to 4:20** and pay close attention to how they explain ${chapter.keyPoints[0]?.toLowerCase()}"` : ''}${hintLevel === 3 ? `Provide substantive guidance by:
- Hinting at the key principle or relationship without stating it fully
- Describing what type of thing they should be thinking about
- Giving partial information that points toward the answer
Example: "Remember, the key factor involves how ${chapter.keyPoints[0]?.toLowerCase()} relates to [hint at connection]..."` : ''}${hintLevel === 4 ? `Scaffold with a simpler question by:
- Breaking the original question into an easier component
- Rephrasing using simpler language or a more concrete example
- Asking about a prerequisite concept that builds toward the answer
Example: "Let me ask it differently: If [simpler scenario], what would happen to [key concept]?"` : ''}
</hint_level_guidelines>

<critical_rules>
1. Do NOT give the direct answer at any hint level
2. Make your hint specific to the actual concepts in this chapter, not generic
3. Use concrete details from the chapter's key points: ${chapter.keyPoints.join(', ')}
4. Reference video timestamps when helpful (especially Level 2)
5. Keep the student's sense of discovery - they should still feel they figured it out

Why hints matter: Progressive hints help students develop problem-solving resilience. Each hint should provide just enough support to keep them progressing without robbing the satisfaction of discovery.
</critical_rules>

<output_format>
Write your hint as natural, conversational text. Be encouraging and supportive. Keep it concise - 1-2 sentences for Levels 1-2, up to 3 sentences for Levels 3-4.
</output_format>`;
}

/**
 * Generate checkpoint celebration message
 */
export function generateCheckpointPrompt(
  chapter: Chapter,
  score: number,
  nextChapter?: Chapter
): string {
  const celebration = score >= 90 ? 'Outstanding work' :
                     score >= 80 ? 'Excellent job' :
                     'Well done';

  if (nextChapter) {
    return `${celebration}! You've demonstrated solid understanding of "${chapter.title}" with a score of ${score}/100.

🔓 **${nextChapter.title}** is now unlocked! You've earned the right to move forward by showing you've mastered the foundational concepts.

Ready to dive into the next chapter?`;
  }

  return `${celebration}! You've completed all chapters with a final score of ${score}/100.

🎉 **Course complete!** You've worked through the entire video and demonstrated deep understanding of this material. You should be proud of what you've accomplished through this learning journey.`;
}

/**
 * Generate review/remediation prompt
 */
export function generateReviewPrompt(
  chapter: Chapter,
  score: number,
  misconceptions: string[]
): string {
  const startTime = Math.floor(chapter.startTime / 60) + ':' + String(chapter.startTime % 60).padStart(2, '0');
  const endTime = Math.floor(chapter.endTime / 60) + ':' + String(chapter.endTime % 60).padStart(2, '0');
  
  return `I can see you're working hard on "${chapter.title}". Your score of ${score}/100 shows there are some concepts that need more attention before moving forward.

This is completely normal - learning takes time and sometimes multiple passes through material. Let's focus on strengthening your understanding of these key areas:

${misconceptions.map(m => `• ${m}`).join('\n')}

I recommend rewatching **${startTime} to ${endTime}** and paying special attention to how these concepts are explained. Take notes on what you're learning and feel free to pause and rewatch sections.

When you're ready to try again, just let me know!`;
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
