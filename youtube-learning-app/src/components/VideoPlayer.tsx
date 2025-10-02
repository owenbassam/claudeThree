'use client';

import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2 } from 'lucide-react';
import { formatTime } from '@/lib/youtube';
import { TranscriptSegment } from '@/types';

interface VideoPlayerProps {
  url: string;
  transcript?: TranscriptSegment[];
  onTimeUpdate?: (currentTime: number) => void;
  className?: string;
}

export interface VideoPlayerRef {
  seekTo: (seconds: number) => void;
  currentTime: number;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ url, transcript = [], onTimeUpdate, className = '' }, ref) => {
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [showControls, setShowControls] = useState(true);
    
    const playerRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        if (playerRef.current) {
          playerRef.current.currentTime = seconds;
        }
      },
      currentTime
    }));

  const handleProgress = useCallback((event: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoElement = event.currentTarget;
    setCurrentTime(videoElement.currentTime);
    onTimeUpdate?.(videoElement.currentTime);
  }, [onTimeUpdate]);

  const handleLoadedMetadata = useCallback((event: React.SyntheticEvent<HTMLVideoElement>) => {
    const videoElement = event.currentTarget;
    setDuration(videoElement.duration);
  }, []);

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = seconds;
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    setPlaying(!playing);
  }, [playing]);

  const skipSeconds = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    seekTo(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const getCurrentTranscriptSegment = () => {
    return transcript.find(segment => 
      currentTime >= segment.start && currentTime <= (segment.start + segment.duration)
    );
  };

  const currentSegment = getCurrentTranscriptSegment();

  return (
    <div 
      className={className}
      style={{
        background: '#000000',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden'
      }}
    >
      {/* Video Player */}
      <div 
        className="relative aspect-video group"
        style={{ background: '#000000' }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <ReactPlayer
          ref={playerRef}
          src={url}
          width="100%"
          height="100%"
          playing={playing}
          volume={volume}
          onTimeUpdate={handleProgress}
          onLoadedMetadata={handleLoadedMetadata}
          controls={false}
        />

        {/* Custom Controls Overlay */}
        <div 
          className="absolute inset-0 transition-opacity"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%, transparent 100%)',
            opacity: showControls ? 1 : 0,
            transitionDuration: '0.3s'
          }}
        >
          {/* Play/Pause Button Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlayPause}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '50%',
                padding: 'var(--space-4)',
                transition: 'var(--transition-base)',
                backdropFilter: 'blur(8px)',
                border: 'none',
                cursor: 'pointer'
              }}
              className="hover:bg-white/25"
            >
              {playing ? (
                <Pause className="w-8 h-8" style={{ color: 'white' }} />
              ) : (
                <Play className="w-8 h-8" style={{ color: 'white', marginLeft: '4px' }} />
              )}
            </button>
          </div>

          {/* Bottom Controls */}
          <div 
            className="absolute bottom-0 left-0 right-0"
            style={{ padding: 'var(--space-4)' }}
          >
            {/* Progress Bar */}
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="w-full appearance-none cursor-pointer"
                style={{
                  height: '4px',
                  borderRadius: 'var(--radius-lg)',
                  background: duration 
                    ? `linear-gradient(to right, var(--color-brand-primary) 0%, var(--color-brand-primary) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)` 
                    : 'rgba(255,255,255,0.3)'
                }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                <button
                  onClick={() => skipSeconds(-10)}
                  style={{
                    color: 'white',
                    transition: 'var(--transition-fast)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  className="hover:text-[#FF6B35]"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={togglePlayPause}
                  style={{
                    color: 'white',
                    transition: 'var(--transition-fast)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  className="hover:text-[#FF6B35]"
                >
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => skipSeconds(10)}
                  style={{
                    color: 'white',
                    transition: 'var(--transition-fast)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  className="hover:text-[#FF6B35]"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                  <Volume2 className="w-4 h-4" style={{ color: 'white' }} />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="appearance-none cursor-pointer"
                    style={{
                      width: '64px',
                      height: '4px',
                      background: 'rgba(255,255,255,0.3)',
                      borderRadius: 'var(--radius-lg)'
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
                <span 
                  style={{
                    color: 'white',
                    fontSize: 'var(--font-size-xs)',
                    fontFamily: 'monospace'
                  }}
                >
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <button 
                  style={{
                    color: 'white',
                    transition: 'var(--transition-fast)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  className="hover:text-[#FF6B35]"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Transcript Display */}
      {currentSegment && (
        <div 
          style={{
            background: '#1A1A1A',
            color: 'white',
            padding: 'var(--space-4)',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div className="flex items-start justify-between">
            <div style={{ flex: 1 }}>
              <p 
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 'var(--font-size-xs)',
                  marginBottom: 'var(--space-1)'
                }}
              >
                Current transcript ({formatTime(currentSegment.start)})
              </p>
              <p 
                style={{
                  color: 'white',
                  fontSize: 'var(--font-size-base)',
                  lineHeight: 'var(--line-height-loose)'
                }}
              >
                {currentSegment.text}
              </p>
            </div>
            <button
              onClick={() => seekTo(currentSegment.start)}
              style={{
                marginLeft: 'var(--space-4)',
                color: 'var(--color-brand-primary)',
                fontSize: 'var(--font-size-xs)',
                fontFamily: 'monospace',
                transition: 'var(--transition-fast)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px'
              }}
              className="hover:opacity-80"
            >
              {formatTime(currentSegment.start)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';