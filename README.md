# YouTube Learning Platform

> **Built for the Anthropic Sonnet 4.5 Challenge @ UMD**  
> *48-hour app challenge pushing the limits of AI-assisted coding*

An AI-powered learning platform that transforms YouTube videos into interactive educational experiences with Socratic tutoring, flashcards, quizzes, and progress tracking. Built entirely with Claude Sonnet 4.5 assistance in under 48 hours.

## 🌟 Features

- **AI-Powered Analysis**: Automatically extracts and analyzes video transcripts using AWS Bedrock (Claude Sonnet 4.5)
- **Socratic Tutoring**: Interactive AI tutor that guides learning through thoughtful questions
- **Intelligent Hints**: Context-aware help system for struggling learners
- **Flashcards**: Auto-generated flashcards with key concepts and definitions
- **Quiz Generation**: Adaptive quizzes based on video content with instant feedback
- **Progress Tracking**: Visual learning path with chapter completion and streak counters
- **Export Functionality**: Download flashcards and quizzes in Markdown format
- **Animated UI**: Engaging Sisyphus-themed climbing animation for answer streaks
- **Production-Ready**: Fully deployed on Vercel with reliable transcript extraction

## 🏗️ Architecture

This project consists of two main services:

### 1. YouTube Learning App (`youtube-learning-app/`)
- **Framework**: Next.js 14 with TypeScript and App Router
- **Styling**: Tailwind CSS with custom animations
- **AI Provider**: AWS Bedrock (Claude Sonnet 4.5 for development, Claude 3 Sonnet for production)
- **Deployment**: Vercel
- **Features**: Main application with video processing, AI tutoring, and learning tools

### 2. Transcript API (`transcript-api/`)
- **Framework**: Python 3.9 serverless function
- **Library**: youtube-transcript-api with Webshare integration
- **Infrastructure**: Vercel serverless with residential rotating proxies
- **Purpose**: Reliable YouTube transcript extraction with bot detection bypass
- **Challenge**: Overcame YouTube's cloud IP blocking through proxy configuration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- AWS account with Bedrock access
- Webshare account (for transcript API proxies)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/owenbassam/claudeThree.git
   cd claudeThree
   ```

2. **Set up the YouTube Learning App**
   ```bash
   cd youtube-learning-app
   npm install
   cp .env.example .env.local
   ```
   
   Configure `.env.local` with your credentials:
   ```env
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=us-east-1
   BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
   NEXT_PUBLIC_TRANSCRIPT_API_URL=https://your-api.vercel.app/api/transcript
   ```

3. **Set up the Transcript API**
   ```bash
   cd ../transcript-api
   pip install -r requirements.txt
   cp .env.example .env
   ```
   
   Configure `.env` with your Webshare credentials:
   ```env
   WEBSHARE_PROXY_USERNAME=your_username
   WEBSHARE_PROXY_PASSWORD=your_password
   ```

4. **Run locally**
   ```bash
   # Terminal 1 - YouTube Learning App
   cd youtube-learning-app
   npm run dev
   
   # Terminal 2 - Transcript API (optional for local testing)
   cd transcript-api
   python -m http.server 3001
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000)

## 📦 Deployment

### YouTube Learning App (Vercel)

1. Push your repository to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Transcript API (Vercel)

1. Configure Vercel project settings:
   - Framework Preset: **Other**
   - Root Directory: `transcript-api`
2. Add environment variables:
   - `WEBSHARE_PROXY_USERNAME`
   - `WEBSHARE_PROXY_PASSWORD`
3. Deploy automatically with the main app

## 🛠️ Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon system

### Backend
- **AWS Bedrock**: Claude 3 AI model
- **Python**: Serverless functions
- **youtube-transcript-api**: Transcript extraction
- **Webshare Proxies**: Bot detection bypass

### Deployment
- **Vercel**: Hosting for both app and API
- **GitHub**: Version control and CI/CD

## 📁 Project Structure

```
claudeThree/
├── youtube-learning-app/          # Main Next.js application
│   ├── src/
│   │   ├── app/                   # Next.js app router
│   │   │   ├── api/               # API routes
│   │   │   └── page.tsx           # Main page
│   │   ├── components/            # React components
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── lib/                   # Utilities and services
│   │   └── types/                 # TypeScript types
│   ├── public/                    # Static assets
│   └── package.json
│
├── transcript-api/                # Transcript extraction service
│   ├── api/
│   │   └── transcript.py          # Python serverless function
│   ├── requirements.txt           # Python dependencies
│   └── README.md
│
└── README.md                      # This file
```

## 🔑 Key Features Explained

### Socratic Tutoring
The AI tutor uses Claude 3 to guide learning through questions rather than direct answers, promoting deeper understanding and critical thinking.

### Progress Tracking
Visual progress map shows completed, current, unlocked, and locked chapters with an animated climbing emoji that responds to answer streaks.

### Adaptive Learning
The system adapts to user responses, providing hints when needed and adjusting difficulty based on performance.

### Export & Study Tools
Users can export flashcards and quizzes to Markdown files for offline study and review.

## 🏆 Competition Submission

**Anthropic Sonnet 4.5 Challenge @ UMD**
- **Challenge Period**: October 1-3, 2025 (48 hours)
- **Development Time**: ~48 hours
- **AI Assistant**: Claude Sonnet 4.5
- **Submission Date**: October 3, 2025

### What Makes This Special

This entire project was conceived, architected, and built with Claude Sonnet 4.5 assistance in under 48 hours. The AI helped with:
- Full-stack architecture design
- Next.js 14 app structure with TypeScript
- AWS Bedrock integration for AI tutoring
- Python serverless API with proxy configuration
- Complex state management and UI animations
- Deployment configuration for Vercel
- Debugging and problem-solving throughout

The project demonstrates Claude Sonnet 4.5's capabilities in:
- **Complex Agent Reasoning**: Multi-step tutoring logic with state machines
- **Production-Ready Code**: Deployed, functional application with error handling
- **System Design**: Microservices architecture with API separation
- **Extended Thinking**: Solving bot detection and proxy configuration challenges
- **Refactoring Judgment**: Migrating from multiple failed approaches to working solutions

## 👤 Author

**Owen Bassam**  
University of Maryland  
Claude Builder Club Member

## 🙏 Acknowledgments

- **Anthropic** for hosting the Sonnet 4.5 Challenge and Claude Builder Club
- **Claude Sonnet 4.5** for exceptional AI-assisted development capabilities
- **AWS Bedrock** for Claude 3 model hosting
- **Webshare** for residential proxy services
- **University of Maryland** for supporting student innovation