# AWS Bedrock - Available Claude Models

**Last Updated:** October 1, 2025

## 🚀 Latest Models (Claude 4 Series)

### ⭐ Claude Sonnet 4.5 (RECOMMENDED - NEWEST!)
- **Model ID**: `anthropic.claude-sonnet-4-5-20250929-v1:0`
- **Released**: September 29, 2025
- **Capabilities**: TEXT + IMAGE input, TEXT output
- **Use Case**: Best balance of intelligence, speed, and cost
- **Status**: ✅ **Currently used in our app**

### Claude Sonnet 4
- **Model ID**: `anthropic.claude-sonnet-4-20250514-v1:0`
- **Released**: May 14, 2025
- **Capabilities**: TEXT + IMAGE input, TEXT output

### Claude Opus 4.1
- **Model ID**: `anthropic.claude-opus-4-1-20250805-v1:0`
- **Released**: August 5, 2025
- **Capabilities**: TEXT + IMAGE input, TEXT output
- **Use Case**: Maximum intelligence, complex reasoning

### Claude Opus 4
- **Model ID**: `anthropic.claude-opus-4-20250514-v1:0`
- **Released**: May 14, 2025
- **Capabilities**: TEXT + IMAGE input, TEXT output

## Claude 3.7 Series

### Claude 3.7 Sonnet
- **Model ID**: `anthropic.claude-3-7-sonnet-20250219-v1:0`
- **Released**: February 19, 2025
- **Capabilities**: TEXT + IMAGE input, TEXT output

## Claude 3.5 Series

### Claude 3.5 Sonnet v2 (Previous Version)
- **Model ID**: `anthropic.claude-3-5-sonnet-20241022-v2:0`
- **Released**: October 22, 2024
- **Capabilities**: TEXT + IMAGE input, TEXT output

### Claude 3.5 Sonnet
- **Model ID**: `anthropic.claude-3-5-sonnet-20240620-v1:0`
- **Released**: June 20, 2024
- **Capabilities**: TEXT + IMAGE input, TEXT output

### Claude 3.5 Haiku
- **Model ID**: `anthropic.claude-3-5-haiku-20241022-v1:0`
- **Released**: October 22, 2024
- **Capabilities**: TEXT input, TEXT output
- **Use Case**: Fastest, most cost-effective

## Claude 3 Series

### Claude 3 Opus
- **Model ID**: `anthropic.claude-3-opus-20240229-v1:0`
- **Released**: February 29, 2024
- **Capabilities**: TEXT + IMAGE input, TEXT output
- **Variants**: 12k, 28k, 200k context windows

### Claude 3 Sonnet
- **Model ID**: `anthropic.claude-3-sonnet-20240229-v1:0`
- **Released**: February 29, 2024
- **Capabilities**: TEXT + IMAGE input, TEXT output
- **Variants**: 28k, 200k context windows

### Claude 3 Haiku
- **Model ID**: `anthropic.claude-3-haiku-20240307-v1:0`
- **Released**: March 7, 2024
- **Capabilities**: TEXT + IMAGE input, TEXT output
- **Variants**: 48k, 200k context windows

## Legacy Models (Claude 2 Series)

### Claude Instant v1
- **Model ID**: `anthropic.claude-instant-v1:2:100k`
- **Context**: 100k tokens

### Claude v2
- **Model IDs**: 
  - `anthropic.claude-v2:0:18k`
  - `anthropic.claude-v2:0:100k`
  - `anthropic.claude-v2:1:18k`
  - `anthropic.claude-v2:1:200k`

---

## 🎯 Recommendations for Our App

### Current Choice: Claude Sonnet 4.5 ⭐
**Why?**
- Latest model with best performance
- Excellent for educational content analysis
- Superior at structured output (chapters, concepts, quizzes)
- Good balance of speed and intelligence
- Vision capabilities for future features

### Alternative Options:

1. **Claude Opus 4.1** - For maximum accuracy (slower, more expensive)
2. **Claude 3.5 Haiku** - For faster responses (less sophisticated analysis)
3. **Claude 3.7 Sonnet** - Solid middle ground

---

## 📊 Model Selection Guide

| Model | Speed | Intelligence | Cost | Best For |
|-------|-------|--------------|------|----------|
| Claude Opus 4.1 | ⭐⭐ | ⭐⭐⭐⭐⭐ | 💰💰💰 | Complex analysis |
| **Claude Sonnet 4.5** | **⭐⭐⭐⭐** | **⭐⭐⭐⭐** | **💰💰** | **Balanced (recommended)** |
| Claude 3.5 Haiku | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 💰 | Fast responses |

---

## 🔄 How to Switch Models

### Option 1: Environment Variable
Update your `.env.local`:
```bash
BEDROCK_MODEL_ID=anthropic.claude-sonnet-4-5-20250929-v1:0
```

### Option 2: Programmatically
Update `src/lib/bedrock.ts`:
```typescript
const modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-sonnet-4-5-20250929-v1:0';
```

---

## ✅ Verification

To verify the model is working:
1. Check the API responses in the browser console
2. The analysis quality should be noticeably better with Claude 4.5
3. Look for improved chapter summaries and concept definitions

---

**Note**: This list was generated on October 1, 2025. Run `npx tsx scripts/list-bedrock-models.ts` to get the latest available models.
