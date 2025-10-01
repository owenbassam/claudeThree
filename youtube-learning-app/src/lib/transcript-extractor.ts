import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranscriptResult {
  success: boolean;
  segments: TranscriptSegment[];
  error?: string;
}

/**
 * Extract YouTube video transcript using yt-dlp
 * @param videoUrl YouTube video URL
 * @returns Promise<TranscriptResult>
 */
export async function extractTranscript(videoUrl: string): Promise<TranscriptResult> {
  try {
    // Create a temporary directory for the subtitle file
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'youtube-transcript-'));
    
    return new Promise((resolve) => {
      const ytDlp = spawn('yt-dlp', [
        '--write-subs',
        '--write-auto-subs',
        '--sub-lang', 'en',
        '--skip-download',
        '--output', path.join(tempDir, '%(title)s.%(ext)s'),
        videoUrl
      ]);

      let stderr = '';
      let stdout = '';

      ytDlp.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      ytDlp.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ytDlp.on('close', async (code) => {
        try {
          if (code === 0) {
            // Find the VTT file in the temp directory
            const files = await fs.readdir(tempDir);
            const vttFile = files.find(file => file.endsWith('.en.vtt'));
            
            if (vttFile) {
              const vttPath = path.join(tempDir, vttFile);
              const vttContent = await fs.readFile(vttPath, 'utf-8');
              const segments = parseVTT(vttContent);
              
              // Clean up temp directory
              await fs.rm(tempDir, { recursive: true, force: true });
              
              resolve({
                success: true,
                segments
              });
            } else {
              // Clean up temp directory
              await fs.rm(tempDir, { recursive: true, force: true });
              
              resolve({
                success: false,
                segments: [],
                error: 'No English subtitles found for this video'
              });
            }
          } else {
            // Clean up temp directory
            await fs.rm(tempDir, { recursive: true, force: true });
            
            resolve({
              success: false,
              segments: [],
              error: `yt-dlp failed with code ${code}: ${stderr}`
            });
          }
        } catch (error) {
          // Clean up temp directory
          await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
          
          resolve({
            success: false,
            segments: [],
            error: `Error processing transcript: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      });

      ytDlp.on('error', async (error) => {
        // Clean up temp directory
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        
        resolve({
          success: false,
          segments: [],
          error: `Failed to spawn yt-dlp: ${error.message}`
        });
      });
    });
  } catch (error) {
    return {
      success: false,
      segments: [],
      error: `Transcript extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Parse VTT content into transcript segments
 * @param vttContent VTT file content
 * @returns TranscriptSegment[]
 */
function parseVTT(vttContent: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const lines = vttContent.split('\n');
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Look for timestamp lines (format: 00:00:01.360 --> 00:00:03.040)
    if (line.includes(' --> ')) {
      const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);
      if (timeMatch) {
        const startTime = timeToSeconds(timeMatch[1]);
        const endTime = timeToSeconds(timeMatch[2]);
        
        // Get the text content (next non-empty lines until we hit another timestamp or end)
        i++;
        let text = '';
        while (i < lines.length) {
          const textLine = lines[i].trim();
          if (!textLine) {
            i++;
            break;
          }
          if (textLine.includes(' --> ')) {
            // Next timestamp found, don't increment i
            break;
          }
          
          // Clean up the text (remove music notes, brackets, etc. for cleaner text)
          const cleanText = textLine
            .replace(/^♪\s*/, '') // Remove music notes at start
            .replace(/\s*♪$/, '') // Remove music notes at end
            .replace(/^\[.*?\]/, '') // Remove bracketed content like [♪♪♪]
            .trim();
          
          if (cleanText) {
            if (text) text += ' ';
            text += cleanText;
          }
          i++;
        }
        
        if (text.trim()) {
          segments.push({
            start: startTime,
            end: endTime,
            text: text.trim()
          });
        }
      } else {
        i++;
      }
    } else {
      i++;
    }
  }
  
  return segments;
}

/**
 * Convert time string to seconds
 * @param timeStr Time string in format HH:MM:SS.mmm
 * @returns seconds as number
 */
function timeToSeconds(timeStr: string): number {
  const [time, ms] = timeStr.split('.');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds + Number(ms) / 1000;
}