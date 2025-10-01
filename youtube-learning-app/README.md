# YouTube Learning Experience

Transform any educational YouTube video into an interactive learning experience with AI-generated chapters, key concepts, and practice questions.

## 🎯 Current Status

**Working Demo Available!** The core functionality is implemented and functional:
- ✅ Paste any YouTube URL
- ✅ Extract transcripts using yt-dlp 
- ✅ AI analysis with Claude 3.5 Sonnet via AWS Bedrock
- ✅ Interactive quiz system with proper UX
- ✅ Chapter breakdown with timestamps
- ✅ Key concepts with definitions

## ✨ Features

- 🎬 **YouTube Integration** - Extract transcripts from any YouTube video using yt-dlp
- 🧠 **AI-Powered Analysis** - Claude 3.5 Sonnet generates chapters, concepts, and quizzes
- 📝 **Interactive Quizzes** - Take practice tests with immediate feedback and explanations
- 🎯 **Learning Enhancement** - Structured chapters and key concept definitions
- 🎨 **Professional UI** - Clean, responsive design with Tailwind CSS
- ⚡ **Real-time Processing** - Live transcript extraction and AI analysis

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- AWS Bedrock access with Claude 3.5 Sonnet
- yt-dlp installed (`brew install yt-dlp` on macOS)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
4. Add your AWS credentials to `.env.local`:
   ```
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) and paste a YouTube URL!

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **AI**: AWS Bedrock with Claude 3.5 Sonnet
- **Transcript Extraction**: yt-dlp (reliable, works with latest YouTube changes)
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with responsive design
## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── transcript/     # yt-dlp transcript extraction
│   │   └── analyze/        # Claude analysis pipeline
│   ├── page.tsx           # Main landing page
│   └── layout.tsx         # App layout
├── components/
│   ├── VideoInput.tsx     # YouTube URL input form
│   ├── VideoResult.tsx    # Video display and processing status
│   ├── AnalysisResult.tsx # AI analysis display
│   └── QuizModal.tsx      # Interactive quiz component
├── lib/
│   ├── bedrock.ts         # AWS Bedrock integration
│   ├── youtube.ts         # YouTube utilities
│   └── transcript-extractor.ts # yt-dlp wrapper
├── types/                 # TypeScript definitions
└── hooks/                 # Custom React hooks
```

## 📈 Development Progress

### ✅ **Phase 1: Project Setup & Structure** 
- [x] Next.js project with TypeScript
- [x] Tailwind CSS configuration  
- [x] Dependencies installed
- [x] Project structure created
- [x] Environment variables configured
- [x] Landing page designed

### ✅ **Phase 2: YouTube Integration**
- [x] YouTube URL parsing and validation
- [x] Transcript extraction using yt-dlp
- [x] Video metadata fetching (title, thumbnail, channel)
- [x] Error handling for videos without transcripts
- [x] Robust fallback system

### ✅ **Phase 3: Claude Analysis Pipeline**
- [x] AWS Bedrock integration with Claude 3.5 Sonnet
- [x] Comprehensive prompt engineering
- [x] Content analysis pipeline (chapters, concepts, quizzes)
- [x] Response parsing and validation
- [x] Duplicate answer choice prevention

### ✅ **Phase 4: Interactive Quiz System**
- [x] Quiz modal component with proper UX
- [x] Progressive question navigation
- [x] Score calculation and results display
- [x] Educational feedback with explanations
- [x] No pre-selected answers (proper interactive experience)

### ✅ **Phase 5: UI/UX Improvements**
- [x] Fixed thumbnail and channel display
- [x] Improved quiz preview (single question)
- [x] Professional styling with Tailwind CSS
- [x] Responsive design
- [x] Loading states and error handling

### 🔄 **Phase 6: Remaining Work**
- [ ] **Interactive Video Player** - Embedded YouTube player with timestamp navigation
- [ ] **Enhanced Learning UI** - Hover definitions, chapter navigation sidebar
- [ ] **Progress Tracking** - User progress through video content  
- [ ] **Demo Preparation** - Select compelling demo videos, test edge cases
- [ ] **Performance Optimization** - Caching, error recovery, loading indicators

## 🎬 Demo-Ready Features

The app currently supports end-to-end workflow:

1. **Paste YouTube URL** → Validates and extracts video info
2. **Extract Transcript** → Uses yt-dlp for reliable transcript extraction  
3. **AI Analysis** → Claude generates educational content structure
4. **Interactive Experience** → Browse chapters, concepts, take quizzes

**Tested Successfully With:**
- 3Blue1Brown math videos
- Educational content with good transcripts
- Various video lengths and topics

## 🎯 Next Priority Items

1. **Video Player Integration** - Embed YouTube player with timestamp jumping
2. **Chapter Navigation** - Sidebar with clickable chapter timeline
3. **Demo Preparation** - Curate 2-3 perfect demo videos
4. **Edge Case Testing** - Handle videos without transcripts gracefully

## 🚀 Ready for Demo

**Current State**: Fully functional core experience
**Demo Time**: ~5-7 minutes to show full workflow  
**Wow Factor**: Side-by-side comparison of regular YouTube vs. interactive learning experience
