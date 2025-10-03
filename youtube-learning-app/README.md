# YouTube Learning App

> Transform YouTube videos into interactive learning experiences with AI-powered Socratic tutoring.

## Overview

An intelligent learning platform built with Next.js 14 and AWS Bedrock that converts YouTube videos into structured learning experiences. The application uses Claude 3 AI to provide Socratic tutoring, generate study materials, and track progress through an engaging, gamified interface.

## Features

### 🎓 AI-Powered Learning
- **Socratic Tutoring**: Interactive AI tutor that guides learning through questions
- **Adaptive Difficulty**: Questions adjust based on user performance
- **Intelligent Hints**: Contextual help when users struggle
- **Progress Evaluation**: Comprehensive scoring (accuracy, depth, articulation, connections)

### 📚 Study Tools
- **Auto-generated Flashcards**: Key concepts with definitions and context
- **Interactive Quizzes**: Multiple-choice questions with explanations
- **Chapter Navigation**: Structured content breakdown with timestamps
- **Export Functionality**: Download flashcards and quizzes in Markdown format

### 🎯 Progress Tracking
- **Visual Progress Map**: See completed, current, unlocked, and locked chapters
- **Answer Streaks**: Gamified tracking with animated climbing visualization
- **Chapter Gating**: Must pass comprehension checks to unlock next section
- **Completion Metrics**: Track overall progress and performance

### 🎬 Video Experience
- **Synchronized Transcript**: Real-time transcript display with video
- **Timestamp Navigation**: Click timestamps to jump to specific moments
- **Custom Video Player**: Integrated controls with chapter highlighting
- **YouTube Integration**: Seamless video embedding and playback

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Modern icon system

### AI & Backend
- **AWS Bedrock**: Claude 3 Sonnet AI model
- **Transcript API**: External service for reliable transcript extraction
- **Next.js API Routes**: Server-side processing

### State Management
- **React Hooks**: useState, useEffect for local state
- **Custom Hooks**: useVideoProcessor for complex video logic
- **localStorage**: Persistent streak tracking

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- AWS account with Bedrock access
- AWS credentials (Access Key ID and Secret Access Key)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   
   Create `.env.local` in the root directory:
   ```env
   # AWS Bedrock Configuration
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=us-east-1
   
   # Claude AI Model
   BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
   
   # Transcript API
   NEXT_PUBLIC_TRANSCRIPT_API_URL=https://your-api.vercel.app/api/transcript
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Usage

1. Paste a YouTube video URL into the input field
2. Click "Analyze Video" and wait for AI processing
3. Review the generated chapters and key concepts
4. Start the Socratic tutoring session
5. Answer questions to progress through chapters
6. Use flashcards and quizzes for review
7. Export study materials as needed

## Project Structure

```
youtube-learning-app/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes
│   │   │   ├── analyze/          # Video analysis endpoint
│   │   │   ├── generate-quiz/    # Quiz generation
│   │   │   ├── pdf/              # PDF processing
│   │   │   ├── transcript/       # Transcript fetching
│   │   │   └── tutor/            # Socratic tutor endpoints
│   │   ├── globals.css           # Global styles & animations
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Main page
│   │
│   ├── components/               # React components
│   │   ├── AnalysisResult.tsx    # Video analysis display
│   │   ├── ChapterNavigation.tsx # Chapter list with progress
│   │   ├── Flashcard.tsx         # Flashcard component
│   │   ├── FlashcardModal.tsx    # Flashcard viewer modal
│   │   ├── KeyConcepts.tsx       # Concept cards display
│   │   ├── ProgressMap.tsx       # Visual progress tracker
│   │   ├── QuizModal.tsx         # Quiz interface
│   │   ├── SocraticChat.tsx      # Tutor conversation UI
│   │   ├── VideoInput.tsx        # URL/PDF input form
│   │   ├── VideoPlayer.tsx       # Embedded video player
│   │   ├── VideoResult.tsx       # Standard results view
│   │   └── VideoResultSocratic.tsx # Tutoring mode view
│   │
│   ├── hooks/                    # Custom React hooks
│   │   └── useVideoProcessor.ts  # Video processing logic
│   │
│   ├── lib/                      # Utilities and services
│   │   ├── api.ts                # API client functions
│   │   ├── bedrock.ts            # AWS Bedrock integration
│   │   ├── socraticPrompts.ts    # AI prompt templates
│   │   ├── transcript-extractor.ts # Transcript API client
│   │   └── youtube.ts            # YouTube utilities
│   │
│   └── types/                    # TypeScript type definitions
│       └── index.ts              # Shared types
│
├── public/                       # Static assets
│   ├── sisyphus-mountain.png     # Progress animation image
│   └── rock_1faa8.png            # Boulder emoji image
│
├── .env.local                    # Environment variables (gitignored)
├── .env.example                  # Example environment template
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── package.json                  # Project dependencies
```

## Key Components

### VideoInput
Entry point for users to submit YouTube URLs or upload PDFs.

### AnalysisResult
Displays AI-generated analysis including chapters, concepts, and quiz questions.

### SocraticChat
Interactive conversation interface with the AI tutor.

### ProgressMap
Visual representation of learning progress with chapter states (completed, current, unlocked, locked).

### FlashcardModal & QuizModal
Study tools with export functionality for offline review.

## API Routes

### `/api/analyze`
Analyzes video content and generates chapters, concepts, and questions.

### `/api/transcript`
Fetches and processes YouTube video transcripts.

### `/api/tutor/*`
- `/start` - Initiates tutoring session
- `/evaluate` - Scores user responses
- `/hint` - Provides contextual hints

### `/api/generate-quiz`
Creates multiple-choice quizzes from video content.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AWS_ACCESS_KEY_ID` | AWS access key for Bedrock | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for Bedrock | Yes |
| `AWS_REGION` | AWS region (e.g., us-east-1) | Yes |
| `BEDROCK_MODEL_ID` | Claude model identifier | Yes |
| `NEXT_PUBLIC_TRANSCRIPT_API_URL` | Transcript extraction API endpoint | Yes |
| `NEXT_PUBLIC_APP_URL` | Application base URL | No |

## Development

### Build for Production

```bash
npm run build
```

### Run Production Build

```bash
npm run start
```

### Linting

```bash
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Environment Variables in Vercel

Add all required environment variables in the Vercel project settings:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- BEDROCK_MODEL_ID
- NEXT_PUBLIC_TRANSCRIPT_API_URL

## Troubleshooting

### Transcript Extraction Issues
- Ensure transcript API is deployed and accessible
- Check that API URL is correctly configured in environment variables
- Verify YouTube video has captions enabled

### AWS Bedrock Connection
- Confirm AWS credentials are valid
- Verify Bedrock is enabled in your AWS region
- Check that Claude 3 model access is approved

### Build Errors
- Clear `.next` folder and rebuild
- Delete `node_modules` and reinstall dependencies
- Ensure all environment variables are set

## Performance Optimization

- Uses Next.js server-side rendering for fast initial loads
- API routes minimize client-side processing
- Lazy loading for modals and heavy components
- Optimized images with Next.js Image component
- CSS animations use GPU acceleration

## Security

- API keys stored in environment variables (never in code)
- Server-side API calls prevent credential exposure
- Input validation on all user-submitted data
- CORS configured for transcript API

## License

Private and proprietary.

## Author

Owen Bassam

## Acknowledgments

- AWS Bedrock for Claude 3 AI capabilities
- Next.js team for excellent framework
- Tailwind CSS for utility-first styling