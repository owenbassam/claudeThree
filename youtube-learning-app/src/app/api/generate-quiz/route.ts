import { NextRequest, NextResponse } from 'next/server';
import { invokeClaude } from '@/lib/bedrock';
import { TranscriptSegment, QuizQuestion } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { transcript, videoTitle, chapters } = await request.json();

    if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
      return NextResponse.json(
        { error: 'Valid transcript is required' },
        { status: 400 }
      );
    }

    // Prepare transcript text
    const transcriptText = transcript
      .map((segment: TranscriptSegment) => 
        `[${Math.floor(segment.start)}s] ${segment.text}`
      )
      .join('\n');

    const chapterContext = chapters 
      ? `\n\nChapters:\n${chapters.map((ch: any) => `- ${ch.title}: ${ch.summary}`).join('\n')}`
      : '';

    const prompt = `You are an expert educator creating quiz questions for students learning from educational videos.

Video Title: ${videoTitle}

Transcript:
${transcriptText}
${chapterContext}

Generate an appropriate number of high-quality multiple-choice quiz questions to comprehensively test understanding of this video content.

Guidelines for question count:
- For short videos (<5 min): 3-5 questions
- For medium videos (5-15 min): 6-10 questions
- For long videos (15-30 min): 10-15 questions
- For very long videos (>30 min): 15-20 questions

Adjust the quantity based on content density and complexity. More complex topics may warrant additional questions even for shorter videos.

Requirements:
- Each question should test understanding, application, and analysis - not just recall
- Include a balanced mix of difficulties (easy, medium, hard)
- Options should be plausible, distinct, and challenging
- Provide clear, educational explanations
- Cover different aspects and key concepts from the video
- Ensure questions build upon each other progressively when appropriate

CRITICAL TIMESTAMP REQUIREMENT:
- The "timestamp" field MUST be the EXACT timestamp (in seconds) from the transcript where the answer to that question is discussed
- Look at the [Xs] markers in the transcript and use those PRECISE values
- DO NOT round or estimate - use the exact second where the relevant content appears
- If the answer spans multiple segments, use the timestamp where it FIRST appears
- These timestamps will be used to jump directly to that moment in the video, so accuracy is essential

Return ONLY a JSON array in this exact format:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation of why this is correct",
    "timestamp": 123,
    "difficulty": "medium"
  }
]`;

    const responseText = await invokeClaude(
      [{ role: 'user', content: prompt }],
      4096,
      0.7
    );

    // Parse the response
    let quizQuestions: QuizQuestion[];
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        quizQuestions = JSON.parse(jsonMatch[0]);
      } else {
        quizQuestions = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse quiz questions:', responseText);
      throw new Error('Failed to parse quiz questions from Claude response');
    }

    // Validate and clean up questions
    const validatedQuestions = quizQuestions.map((q) => ({
      question: q.question,
      options: Array.from(new Set(q.options)).slice(0, 4),
      correctAnswer: Math.min(q.correctAnswer, 3),
      explanation: q.explanation,
      timestamp: q.timestamp || 0,
      difficulty: q.difficulty || 'medium',
    }));

    console.log(`Generated ${validatedQuestions.length} quiz questions`);

    return NextResponse.json({
      questions: validatedQuestions,
      success: true,
    });

  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz questions' },
      { status: 500 }
    );
  }
}
