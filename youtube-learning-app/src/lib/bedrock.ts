import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export async function invokeClaude(
  messages: ClaudeMessage[],
  maxTokens: number = 4000,
  temperature: number = 0.1
): Promise<string> {
  try {
    const modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-sonnet-4-5-20250929-v1:0';
    
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: maxTokens,
      temperature,
      messages,
    };

    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await bedrockClient.send(command);
    
    if (!response.body) {
      throw new Error('No response body from Bedrock');
    }

    // Parse the response
    const responseText = new TextDecoder().decode(response.body);
    const parsedResponse: ClaudeResponse = JSON.parse(responseText);

    if (!parsedResponse.content || parsedResponse.content.length === 0) {
      throw new Error('No content in Claude response');
    }

    return parsedResponse.content[0].text;

  } catch (error) {
    console.error('Bedrock Claude invocation error:', error);
    throw new Error(`Failed to invoke Claude: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function analyzeTranscriptWithClaude(
  transcript: Array<{ text: string; start: number; duration: number }>,
  videoTitle: string
): Promise<any> {
  // Combine transcript segments into a single text
  const fullTranscript = transcript
    .map(segment => `[${formatTimestamp(segment.start)}] ${segment.text}`)
    .join('\n');

  const analysisPrompt = `You are an expert educational content analyzer. Analyze this video transcript and create a comprehensive learning experience.

VIDEO TITLE: "${videoTitle}"

TRANSCRIPT:
${fullTranscript}

Please analyze this educational content and return a JSON response with the following structure:

{
  "chapters": [
    {
      "title": "Chapter title",
      "startTime": 0,
      "endTime": 30,
      "summary": "Brief summary of this chapter",
      "keyPoints": ["Point 1", "Point 2", "Point 3"]
    }
  ],
  "keyConcepts": [
    {
      "term": "Important Term",
      "definition": "Clear definition",
      "context": "How it's used in the video",
      "timestamp": 15
    }
  ],
  "overallSummary": "Comprehensive summary of the entire video",
  "estimatedReadingTime": 5,
  "difficultyLevel": "beginner",
  "topics": ["Topic 1", "Topic 2", "Topic 3"]
}

CRITICAL TIMESTAMP REQUIREMENTS:
- ALL timestamps (chapter startTime/endTime, keyConcepts timestamp) MUST be EXACT timestamps from the transcript
- Look at the [MM:SS] markers in the transcript and use those EXACT values (in seconds)
- DO NOT round or estimate timestamps - use the precise second where the content appears
- For chapters: startTime should be the exact timestamp where that section begins, endTime where it ends
- For key concepts: timestamp should be the exact moment when that concept is first introduced or explained
- If a concept spans multiple segments, use the timestamp where it is FIRST mentioned

Guidelines:
- Create 2-4 logical chapters based on content flow
- Identify 3-8 key concepts with clear definitions
- Use clear, educational language appropriate for the content level
- Focus on breaking down the content into digestible, structured learning materials

Return ONLY the JSON object, no additional text.`;

  try {
    const response = await invokeClaude([
      { role: 'user', content: analysisPrompt }
    ], 4000, 0.1);

    // Parse the JSON response
    const analysis = JSON.parse(response);
    return analysis;

  } catch (error) {
    console.error('Error analyzing transcript:', error);
    throw new Error('Failed to analyze transcript with Claude');
  }
}

function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}