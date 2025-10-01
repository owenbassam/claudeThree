import { NextRequest, NextResponse } from 'next/server';
import { analyzeTranscriptWithClaude } from '@/lib/bedrock';
import { TranscriptSegment, LearningAnalysis } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { transcript, videoTitle } = await request.json();

    if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
      return NextResponse.json(
        { error: 'Valid transcript is required' },
        { status: 400 }
      );
    }

    if (!videoTitle) {
      return NextResponse.json(
        { error: 'Video title is required' },
        { status: 400 }
      );
    }

    console.log(`Starting analysis for video: "${videoTitle}" with ${transcript.length} segments`);

    try {
      // Analyze transcript with Claude via Bedrock
      const analysis = await analyzeTranscriptWithClaude(transcript, videoTitle);
      
      // Fix any duplicate answer choices in quiz questions
      const fixedQuizQuestions = (analysis.quizQuestions || []).map((question: any) => {
        if (!question.options || !Array.isArray(question.options)) {
          return question;
        }
        
        // Check for duplicates
        const uniqueOptions = new Set(question.options);
        if (uniqueOptions.size < question.options.length) {
          console.warn(`Duplicate answer choices detected in question: "${question.question}"`);
          // Keep unique options and pad with placeholder if needed
          const unique = Array.from(uniqueOptions);
          while (unique.length < 4) {
            unique.push(`Option ${unique.length + 1}`);
          }
          return {
            ...question,
            options: unique.slice(0, 4)
          };
        }
        
        return question;
      });
      
      // Validate the analysis structure
      const validatedAnalysis: LearningAnalysis = {
        chapters: analysis.chapters || [],
        keyConcepts: analysis.keyConcepts || [],
        quizQuestions: fixedQuizQuestions,
        overallSummary: analysis.overallSummary || 'Summary not available',
        estimatedReadingTime: analysis.estimatedReadingTime || 5,
        difficultyLevel: analysis.difficultyLevel || 'beginner',
        topics: analysis.topics || [],
      };

      console.log(`Analysis completed: ${validatedAnalysis.chapters.length} chapters, ${validatedAnalysis.keyConcepts.length} concepts, ${validatedAnalysis.quizQuestions.length} questions`);

      return NextResponse.json({
        analysis: validatedAnalysis,
        success: true,
        processingTime: 'Analysis completed',
      });

    } catch (analysisError) {
      console.error('Claude analysis error:', analysisError);
      
      // Return a fallback demo analysis if Claude fails
      const fallbackAnalysis = createFallbackAnalysis(videoTitle, transcript);
      
      return NextResponse.json({
        analysis: fallbackAnalysis,
        success: true,
        warning: 'Using fallback analysis due to API limitations',
      });
    }

  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze transcript' },
      { status: 500 }
    );
  }
}

function createFallbackAnalysis(videoTitle: string, transcript: TranscriptSegment[]): LearningAnalysis {
  // Create a basic analysis when Claude API is not available
  const totalDuration = transcript[transcript.length - 1]?.start + transcript[transcript.length - 1]?.duration || 60;
  const midPoint = totalDuration / 2;

  return {
    chapters: [
      {
        title: "Introduction",
        startTime: 0,
        endTime: midPoint,
        summary: "Introduction and fundamental concepts covered in the first half of the video.",
        keyPoints: ["Basic concepts", "Foundational knowledge", "Key principles"]
      },
      {
        title: "Advanced Topics",
        startTime: midPoint,
        endTime: totalDuration,
        summary: "Advanced topics and practical applications covered in the second half.",
        keyPoints: ["Advanced concepts", "Practical applications", "Summary and conclusions"]
      }
    ],
    keyConcepts: [
      {
        term: "Core Concept",
        definition: "A fundamental idea central to understanding this topic.",
        context: "This concept appears throughout the educational content.",
        timestamp: 10
      },
      {
        term: "Key Principle",
        definition: "An important principle that guides understanding.",
        context: "This principle helps explain the main topic.",
        timestamp: 20
      }
    ],
    quizQuestions: [
      {
        question: "What is the main topic covered in this video?",
        options: [
          "The subject matter presented",
          "Unrelated content", 
          "Random information",
          "None of the above"
        ],
        correctAnswer: 0,
        explanation: "The video focuses on the educational content as presented in the title and transcript.",
        timestamp: 15,
        difficulty: "easy" as const
      },
      {
        question: "Which concept is most important for understanding this topic?",
        options: [
          "Secondary details",
          "The core concept presented",
          "Unrelated information",
          "Background noise"
        ],
        correctAnswer: 1,
        explanation: "The core concept is fundamental to understanding the main topic.",
        timestamp: 25,
        difficulty: "medium" as const
      }
    ],
    overallSummary: `This educational video titled "${videoTitle}" provides a comprehensive overview of the subject matter, covering both fundamental concepts and advanced applications.`,
    estimatedReadingTime: Math.max(3, Math.ceil(transcript.length / 2)),
    difficultyLevel: "intermediate" as const,
    topics: ["Educational Content", "Learning Materials", "Knowledge Transfer"]
  };
}