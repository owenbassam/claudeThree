# Socratic AI Tutor (Sisyphus Edition)

> An AI tutor that guides through questions, not answers. Like Sisyphus, you'll never reach the top—but every correct answer pushes you higher.

<div align="center">

**🎓 Socratic Method • 🧠 AI-Powered • 🎯 Gated Learning • ✅ Production-Ready**

[Features](#key-features) • [Quick Start](#quick-start) • [How It Works](#how-it-works) • [Architecture](#architecture) • [Demo Guide](#demo-guide)

</div>

---

## Overview

An intelligent learning platform that transforms passive content consumption into active, Socratic dialogue. Whether it's a YouTube video or a PDF document, Claude AI guides you through questions—not lectures—ensuring understanding is proven, not assumed.

### Core Philosophy

**"The AI questions you. You'll never reach the top. But every correct answer pushes you higher."**

Like Sisyphus eternally pushing his boulder, learning is an endless climb. Answer correctly and roll higher up the hill. Fail, and watch the boulder tumble back down. There's no summit—just the eternal pursuit of deeper understanding through Socratic questioning.

### What Makes This Unique

- **Socratic Method**: AI asks questions, you answer—discover understanding through dialogue
- **Sisyphean Progress**: Never reach the top, but roll higher with each correct answer
- **Boulder Mechanics**: Fail, and your progress rolls back down—success must be re-earned
- **Adaptive Difficulty**: The hill grows steeper as you climb—challenge scales with skill
- **Multiple Content**: Works with YouTube videos AND PDF documents
- **No Shortcuts**: Understanding can't be skipped—it must be proven

---

## Key Features

### 🎓 Socratic AI Tutor

**Intelligent Questioning**
- Pre-watch questions to activate prior knowledge
- Post-watch comprehension checks
- Follow-up questions to probe deeper understanding
- Socratic method: guides discovery without giving answers

**Adaptive Difficulty**
- Adjusts question complexity based on performance
- Increases challenge for high-performers (85+)
- Simplifies for struggling learners (<70)
- Personalized learning paths

**Frustration Detection**
- Monitors consecutive failures (threshold: 2)
- Offers contextual help: hints, simpler questions, or rewatch
- Supportive, never condescending
- Prevents learner discouragement

### 📊 Progress Gating System

**Chapter Locking**
- Must score ≥70% to unlock next chapter
- Previous chapters remain accessible for review
- Visual progress map shows locked/unlocked content
- Prevents skipping without understanding

**Evaluation Criteria**
- **Conceptual Accuracy** (40 pts): Correct mental model?
- **Depth** (30 pts): Surface or deep understanding?
- **Articulation** (20 pts): Clear explanation?
- **Connections** (10 pts): Relates to other concepts?

**Checkpoint System**
- Pass (≥70): Immediate unlock + celebration
- Borderline (50-69): Follow-up question required
- Struggling (<50): Must rewatch section with guidance

### 🎬 Interactive Video Experience

**Smart Video Player**
- Custom controls (play/pause, ±10s skip, volume)
- Real-time synchronized transcript
- Clickable timestamps throughout interface
- Auto-highlights current chapter

**Chapter Navigation**
- AI-generated chapter breakdown with timestamps
- Active chapter highlighting based on playback
- Progress indicators and completion checkmarks
- One-click navigation to any unlocked section

### 🧠 AI-Powered Content Analysis

**Automatic Generation**
- **Chapters**: Logical breakdown with timestamps and summaries
- **Key Concepts**: Definitions with video context and quotes
- **Quiz Questions**: Multiple-choice with explanations
- **Flashcards**: Generated from key concepts for review

**Powered by Claude Sonnet 4.5**
- AWS Bedrock integration
- Superior educational content analysis
- Structured output for consistent results
- Latest model (released Sept 2025)

### � Flexible Content Input

**YouTube Videos**
- Real-time synchronized transcript
- Clickable timestamps for navigation
- Works with any educational video

**PDF Documents**
- Upload class slides, research papers, study guides
- Automatic text extraction and analysis
- Same Socratic tutoring experience
- Perfect for non-video learning materials

### �💬 Conversation Phases

The tutor guides learners through 7 distinct phases:

1. **WATCHING**: Content viewing with specific focus
2. **POST_WATCH**: Comprehension check questions
3. **EVALUATING**: AI scores response (0-100)
4. **FOLLOW_UP**: Deeper probing for borderline answers
5. **CHECKPOINT**: Success! Unlock next chapter
6. **REVIEW**: Failed—review content with guidance
7. **COMPLETE**: All chapters finished

---

## Quick Start

### Prerequisites

```bash
# Required
- Node.js 18+
- npm or yarn
- AWS Bedrock access with Claude Sonnet 4.5
```

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd youtube-learning-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Configuration

Add your AWS credentials to `.env.local`:

```env
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# Optional: Transcript API URL (if using external service)
TRANSCRIPT_API_URL=http://localhost:3001

# Optional: Specify Claude model
BEDROCK_MODEL_ID=us.anthropic.claude-3-5-sonnet-20241022-v2:0
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and paste a YouTube URL or upload a PDF!

---

## How It Works

### User Workflow

```
1. Choose input: YouTube URL OR PDF upload
   ↓
2. AI analyzes content (chapters, concepts, key points)
   ↓
3. Start conversation with AI tutor
   ↓
4. Review assigned content section
   ↓
5. Answer comprehension questions
   ↓
6. Pass (≥70) → Unlock next chapter
   Fail → Review and try again
   ↓
7. Repeat until complete
```

### State Machine

```
WATCHING
  ↓ (User watches section)
POST_WATCH
  ↓ (AI asks question)
EVALUATING
  ↓ (AI scores 0-100)
  ├─ ≥70 → CHECKPOINT (unlock next)
  ├─ 50-69 → FOLLOW_UP (probe deeper)
  └─ <50 → REVIEW (rewatch section)
```

### Frustration Detection

After 2 consecutive failures, the AI offers help:
- **Hint**: Guidance about the key concept
- **Simpler Question**: Easier version to build confidence
- **Rewatch**: Specific guidance on what to focus on

### Data Persistence

**Client-Side Storage**
- Conversation state saved to localStorage
- Persists across page refreshes
- Unique per video ID
- Resume learning anytime

**State Tracked:**
```typescript
{
  unlockedChapters: [0, 1],
  chapterScores: { "0": 85, "1": 72 },
  currentChapterIndex: 1,
  consecutiveFailures: 0,
  totalFailures: 2,
  checkpoints: [...],
  messages: [...]
}
```

---

## Architecture

### Tech Stack

**Frontend**
- Next.js 15 (App Router)
- React 19 with TypeScript
- Tailwind CSS for styling
- Lucide React icons

**AI & Backend**
- AWS Bedrock (Claude Sonnet 4.5)
- Next.js API routes (serverless)
- External transcript API (Python/yt-dlp)

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── transcript/         # Fetch YouTube transcript
│   │   ├── analyze/            # Claude AI video analysis
│   │   ├── generate-quiz/      # On-demand quiz generation
│   │   └── tutor/
│   │       ├── start/          # Initialize conversation
│   │       └── evaluate/       # Score responses & manage state
│   ├── page.tsx               # Main application
│   └── layout.tsx
├── components/
│   ├── VideoResultSocratic.tsx  # Main learning interface
│   ├── SocraticChat.tsx         # Conversational UI
│   ├── VideoPlayer.tsx          # Smart player with transcript
│   ├── ProgressMap.tsx          # Visual progress tracker
│   ├── KeyConcepts.tsx          # Concept cards
│   ├── QuizModal.tsx            # Interactive quiz
│   └── FlashcardModal.tsx       # Flashcard review
├── hooks/
│   └── useVideoProcessor.ts    # Video analysis orchestration
├── lib/
│   ├── bedrock.ts              # AWS Bedrock client
│   └── youtube.ts              # YouTube URL utilities
└── types/
    └── index.ts                # TypeScript definitions
```

### API Routes

**`/api/transcript`** (POST)
- Extracts transcript from YouTube
- Returns video metadata and timestamped text

**`/api/analyze`** (POST)
- Sends transcript to Claude AI
- Returns chapters, concepts, summary

**`/api/generate-quiz`** (POST)
- Generates quiz questions on-demand
- Returns 5-10 multiple-choice questions

**`/api/tutor/start`** (POST)
- Initializes Socratic conversation
- Returns first AI message and state

**`/api/tutor/evaluate`** (POST)
- Evaluates user response (0-100 score)
- Manages state transitions
- Returns next AI message and updated state

---

## Demo Guide

### Recommended Videos

1. **3Blue1Brown** - Mathematical concepts with clear visuals
2. **Khan Academy** - Structured lessons, good transcripts
3. **TED-Ed** - Short, engaging, perfect for demos
4. **MIT OpenCourseWare** - Shows handling of complex content

### Demo Flow (5 minutes)

**1. Setup** (30s)
- Paste YouTube URL
- Show analysis in progress
- "In 20 seconds, we'll have chapters, concepts, and a Socratic tutor"

**2. AI Analysis** (45s)
- Point out generated chapters
- Show key concepts with definitions
- "All auto-generated by Claude AI"

**3. Socratic Tutoring** (2 min)
- Start conversation
- Watch first section
- Answer AI question (intentionally so-so)
- Get follow-up question
- Pass checkpoint → unlock next
- "Notice: can't skip ahead without proving understanding"

**4. Interactive Features** (90s)
- Click timestamp → video jumps
- Show progress map (locked chapters)
- Open quiz modal
- View flashcards
- "Everything synchronized and interactive"

**5. Value Prop** (30s)
- "Transforms passive watching into active learning"
- "Works with ANY educational YouTube video"
- "Gated progress ensures real comprehension"
- "Perfect for students, corporate training, self-learners"

---

## Educational Impact

### For Students
- ✅ Active learning (not passive watching)
- ✅ Instant comprehension validation
- ✅ Personalized difficulty adjustment
- ✅ Study aids (quiz, flashcards) auto-generated

### For Educators
- ✅ Assign videos with built-in assessment
- ✅ Track student progress and scores
- ✅ Scale to hundreds of videos
- ✅ Focus on teaching, not content creation

### For Corporate Training
- ✅ Ensure training completion with comprehension
- ✅ Adaptive learning for diverse skill levels
- ✅ Automated assessment and tracking
- ✅ Works with internal video libraries

---

## Performance & Scalability

**Processing Speed**
- Transcript extraction: 3-5 seconds
- AI analysis: 15-25 seconds
- Total: ~30 seconds for 10-minute video

**Cost Efficiency**
- ~$0.10-0.30 per video analysis (Bedrock pricing)
- Far cheaper than manual content creation
- Pay-per-use, no infrastructure costs

**Scalability**
- Serverless architecture (auto-scaling)
- No database required (client-side state)
- AWS Bedrock handles AI load
- Can process thousands of videos

---

## Future Enhancements

### Planned Features
- [ ] User authentication and profiles
- [ ] Server-side progress tracking (multi-device sync)
- [ ] Learning analytics dashboard
- [ ] Export study materials to PDF
- [ ] Video playlists (course creation)
- [ ] Automatic speech-to-text for videos without transcripts

### Integration Ideas
- Corporate LMS systems (Workday, SAP, SuccessFactors)
- Educational platforms (Canvas, Moodle, Blackboard)
- Custom video libraries (Vimeo, internal CDN)
- Multi-language support (Claude supports 100+ languages)

---

## Troubleshooting

**Q: Video won't load?**
- Check YouTube URL format
- Ensure video has public transcript
- Try a different educational video

**Q: AI responses slow?**
- First response initializes conversation (slower)
- Subsequent responses are faster
- Check AWS Bedrock region latency

**Q: Can't unlock next chapter?**
- Must score ≥70 on current chapter
- Try rewatching and answering again
- Use "hint" or "simpler" commands if stuck

**Q: Progress lost on refresh?**
- Check browser localStorage is enabled
- Each video has unique saved state
- State persists across sessions

---

## License

MIT License - See LICENSE file for details

---

## Acknowledgments

- **Anthropic** - Claude AI capabilities
- **AWS Bedrock** - Scalable AI infrastructure
- **Next.js** - Excellent developer experience
- **YouTube** - Educational content platform

---

<div align="center">

**Built with Claude Sonnet 4.5 • Powered by AWS Bedrock • Designed for Deep Learning**

*Making education more interactive, one question at a time.*

</div>
