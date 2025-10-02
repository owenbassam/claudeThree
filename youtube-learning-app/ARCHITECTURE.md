# Socratic AI Tutor Architecture

## Core Philosophy
**"You can't move forward until you prove understanding"**

The AI acts as a Socratic tutor who guides learning through questions, not explanations. Progress through video content is gated by demonstrated comprehension.

---

## Conversation State Machine

### States

```typescript
enum ConversationPhase {
  INITIAL = 'initial',           // First greeting, assess prior knowledge
  PRE_WATCH = 'pre_watch',        // Activate prior knowledge before watching
  WATCHING = 'watching',          // User is watching assigned video section
  POST_WATCH = 'post_watch',      // Test comprehension after watching
  EVALUATING = 'evaluating',      // AI is evaluating user's response
  FOLLOW_UP = 'follow_up',        // Digging deeper into misconceptions
  CHECKPOINT = 'checkpoint',      // Passed! Unlock next chapter
  REVIEW = 'review',              // Failed checkpoint, need to review
  COMPLETE = 'complete'           // Finished all chapters
}
```

### State Transitions

```
INITIAL
  ↓
  Ask: "What do you already know about [topic]?"
  ↓
PRE_WATCH (Chapter 0)
  ↓
  Ask: "Why might this be important?"
  ↓
WATCHING
  ↓
  AI: "Watch 0:00-2:30 and focus on [concept]"
  ↓
POST_WATCH
  ↓
  Ask: "In your own words, what was the main point?"
  ↓
EVALUATING
  ↓
  Score ≥ 70? → CHECKPOINT (unlock next) : FOLLOW_UP
  ↓
FOLLOW_UP (if struggling)
  ↓
  Ask: "What makes you say that?" / "Can you explain why?"
  ↓
  Re-evaluate → Score ≥ 70? → CHECKPOINT : REVIEW
  ↓
REVIEW (if still struggling)
  ↓
  AI: "Let's rewatch 1:15-2:00, pay attention to..."
  ↓
  Back to WATCHING → POST_WATCH → ...
  ↓
CHECKPOINT
  ↓
  More chapters? → PRE_WATCH (next chapter) : COMPLETE
```

---

## Conversation Context

Every conversation maintains this context:

```typescript
interface ConversationContext {
  // Video metadata
  videoId: string;
  videoTitle: string;
  chapters: Chapter[];           // From analysis
  transcript: TranscriptSegment[];
  
  // Current state
  phase: ConversationPhase;
  currentChapterIndex: number;
  currentQuestionId: string;
  
  // Progress tracking
  unlockedChapters: number[];    // [0, 1] means first two chapters unlocked
  chapterScores: Record<string, number>; // { "0": 85, "1": 72 }
  checkpoints: Checkpoint[];
  
  // User profile
  overallComprehension: number;  // Running average
  responseQuality: 'struggling' | 'adequate' | 'excellent';
  hintsUsedTotal: number;
  misconceptions: string[];      // Track recurring issues
  
  // Conversation history
  messages: Message[];
}
```

---

## Question Generation Strategy

### Pre-Watch Questions (Activate Prior Knowledge)
```typescript
{
  type: 'pre_watch',
  templates: [
    "What do you already know about {topic}?",
    "Why do you think {topic} might be important?",
    "What questions do you hope this section answers?",
    "Have you encountered {concept} before? Where?"
  ],
  purpose: "Activate prior knowledge and set learning goals"
}
```

### Post-Watch Questions (Test Understanding)
```typescript
{
  type: 'post_watch',
  templates: [
    "In your own words, what was the main point of that section?",
    "Why did the speaker use {example}?",
    "How does {concept_a} relate to {concept_b}?",
    "What would happen if {variable} changed?",
    "Can you summarize that in one sentence?"
  ],
  purpose: "Test comprehension depth"
}
```

### Follow-Up Questions (Socratic Method)
```typescript
{
  type: 'follow_up',
  templates: [
    "What makes you say that?",
    "Can you give me an example?",
    "How would you explain this to a 10-year-old?",
    "What's missing from that explanation?",
    "Why is that important?"
  ],
  purpose: "Probe deeper, expose misconceptions"
}
```

---

## Evaluation Logic

### Scoring Rubric (0-100)

```typescript
interface EvaluationCriteria {
  conceptualAccuracy: number;    // 0-40: Is the mental model correct?
  depth: number;                 // 0-30: Surface or deep understanding?
  articulation: number;          // 0-20: Can they explain clearly?
  connectionMaking: number;      // 0-10: Do they see relationships?
}

function calculateScore(response: string, context: Context): number {
  // AI analyzes:
  // 1. Key concepts mentioned correctly
  // 2. Depth of reasoning (why/how vs what)
  // 3. Clarity and coherence
  // 4. Connections to prior knowledge
  
  // Deductions:
  // - Each hint used: -10 points
  // - Major misconception: -20 points
  // - Incomplete answer: -15 points
  
  return totalScore;
}
```

### Passing Threshold
- **70+**: Unlock next chapter immediately
- **50-69**: Follow-up question required
- **<50**: Review required (rewatch section)

---

## Gating Mechanism

### Chapter Lock System

```typescript
interface ChapterLock {
  chapterIndex: number;
  isUnlocked: boolean;
  unlockRequirements: {
    previousChapterScore: number;  // Must score ≥70 on previous
    questionsAnswered: number;     // Must answer at least 2 questions
    minimumViewTime: number;       // Must watch at least 80% of video
  };
  status: 'locked' | 'in_progress' | 'unlocked' | 'completed';
}
```

### Unlock Flow
1. User answers post-watch question
2. AI evaluates → score ≥ 70
3. Checkpoint celebration modal
4. Update `unlockedChapters` array
5. Show ProgressMap with new unlock
6. Start PRE_WATCH phase for next chapter

### Video Playback Control
```typescript
// Video player respects locks
function canWatchChapter(chapterIndex: number): boolean {
  return unlockedChapters.includes(chapterIndex) || 
         chapterIndex === currentChapterIndex;
}

// Scrubbing restricted
function onVideoSeek(timestamp: number) {
  const targetChapter = getChapterAtTimestamp(timestamp);
  if (!canWatchChapter(targetChapter)) {
    showMessage("Complete the current section first!");
    seekTo(currentChapter.startTime);
  }
}
```

---

## Adaptive Difficulty

### Difficulty Adjustment

```typescript
function adjustDifficulty(userProfile: UserProfile): DifficultyLevel {
  const avgScore = calculateAverageScore(userProfile.chapterScores);
  
  if (avgScore >= 85) {
    return {
      level: 'advanced',
      questionDepth: 'synthesis',      // Ask about connections
      followUpFrequency: 'minimal',    // Less hand-holding
      videoChunkSize: 'large'          // Longer sections
    };
  } else if (avgScore >= 70) {
    return {
      level: 'medium',
      questionDepth: 'application',
      followUpFrequency: 'moderate',
      videoChunkSize: 'medium'
    };
  } else {
    return {
      level: 'beginner',
      questionDepth: 'recall',         // Simpler questions
      followUpFrequency: 'frequent',   // More guidance
      videoChunkSize: 'small'          // Bite-sized chunks
    };
  }
}
```

---

## Data Persistence Strategy

### Session Storage (Client-Side)
```typescript
// Store in localStorage for single-session persistence
localStorage.setItem(`conversation_${videoId}`, JSON.stringify(conversationState));
```

### Future: Server-Side (Optional)
```typescript
// For multi-device sync, add these endpoints:
// POST /api/tutor/save-progress
// GET  /api/tutor/load-progress/:videoId
// Could use Vercel KV or PostgreSQL
```

---

## Error Handling

### Graceful Degradation

```typescript
// If AI evaluation fails
catch (error) {
  // Fallback: Allow user to proceed with warning
  return {
    score: 60,
    canProceed: true,
    message: "I'm having trouble right now, but you can continue. Let me know if you need help!"
  };
}
```

### User Frustration Detection
```typescript
// If user gets stuck repeatedly
if (failedAttempts >= 3) {
  // Offer easier question or skip option
  return {
    message: "This seems tricky! Would you like a simpler question, or shall we move on and come back to this later?",
    options: ['simpler_question', 'skip_for_now', 'get_hint']
  };
}
```

---

## UI/UX Principles

### Conversation Feel
- **Typing indicators** when AI is "thinking"
- **Progressive disclosure** (one question at a time)
- **Encouraging tone** ("Great start!", "You're on the right track!")
- **Never condescending** (even when wrong)

### Visual Feedback
- 🟢 Green checkmark when passing checkpoint
- 🟡 Yellow dot for current chapter
- 🔒 Gray lock for locked chapters
- 📊 Progress bar showing overall completion

### Mobile-First
- Chat takes full screen on mobile
- Video collapses to thumbnail during conversation
- Tap thumbnail to expand video
- Swipe between chat and video

---

## Example Conversation Flow

```
🤖 "Hi! I see you want to learn about quantum computing. 
    Before we start, what do you already know about this topic?"

👤 "It's like really fast computers"

🤖 "That's a common starting point! Let's explore that. 
    Why do you think quantum computers might be faster?"

👤 "Because they use quantum physics?"

🤖 "You're right that quantum physics is involved, but let's be more specific.
    Watch the first section (0:00-2:45) and pay close attention to the term 
    'superposition'. Then tell me what makes it special."

[User watches video]

👤 "Qubits can be 0 and 1 at the same time"

🤖 "Excellent! That's exactly right. Now, here's the key question: 
    What advantage does this give quantum computers over regular computers?"

👤 "They can try multiple solutions at once"

🤖 "Perfect! You've grasped the concept of quantum parallelism. 
    
    ✅ Chapter 1 Complete! (Score: 85/100)
    🔓 Chapter 2 Unlocked: Quantum Entanglement
    
    Ready to continue?"
```

---

## Next Steps

1. ✅ Architecture designed
2. ⏭️ Create TypeScript data models
3. ⏭️ Build Socratic prompt templates
4. ⏭️ Implement API routes
5. ⏭️ Build chat UI
