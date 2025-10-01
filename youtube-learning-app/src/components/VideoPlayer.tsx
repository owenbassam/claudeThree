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

  const togglePlayPause = () => {
    setPlaying(!playing);
  };

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
    <div className={`bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Video Player */}
      <div 
        className="relative aspect-video bg-black group"
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
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          controls={false}
        />

        {/* Custom Controls Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Play/Pause Button Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlayPause}
              className="bg-white/20 hover:bg-white/30 rounded-full p-4 transition-all duration-200 backdrop-blur-sm"
            >
              {playing ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Progress Bar */}
            <div className="mb-3">
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: duration ? `linear-gradient(to right, #ef4444 0%, #ef4444 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)` : undefined
                }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => skipSeconds(-10)}
                  className="text-white hover:text-red-400 transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={togglePlayPause}
                  className="text-white hover:text-red-400 transition-colors"
                >
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => skipSeconds(10)}
                  className="text-white hover:text-red-400 transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-white" />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-white text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <button className="text-white hover:text-red-400 transition-colors">
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Transcript Display */}
      {currentSegment && (
        <div className="bg-gray-900 text-white p-4 border-t border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-300 text-sm mb-1">
                Current transcript ({formatTime(currentSegment.start)})
              </p>
              <p className="text-white text-base leading-relaxed">
                {currentSegment.text}
              </p>
            </div>
            <button
              onClick={() => seekTo(currentSegment.start)}
              className="ml-4 text-red-400 hover:text-red-300 transition-colors text-sm font-mono"
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