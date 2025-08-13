'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { updateLocalProgress } from '../../store/slices/progressSlice';
import { Howl } from 'howler';

interface AudioPlayerProps {
  audioUrl: string;
  initialPosition?: number;
  novelId: string;
  chapterId: string;
  userId?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  initialPosition = 0,
  novelId,
  chapterId,
  userId,
  autoPlay = false,
  onEnded,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialPosition);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const soundRef = useRef<Howl | null>(null);
  const progressInterval = useRef<number | null>(null);
  const autoPlayTimeout = useRef<number | null>(null);
  const saveProgressInterval = useRef<number | null>(null);
  const isInitialized = useRef(false);
  const isMounted = useRef(true);
  const initTimeoutRef = useRef<number | null>(null);
  const lastAudioUrl = useRef<string>('');
  const dispatch = useAppDispatch();

  // Comprehensive cleanup function
  const cleanup = useCallback(() => {
    console.log('Cleaning up audio player');
    
    // Clear all timeouts and intervals
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    if (autoPlayTimeout.current) {
      clearTimeout(autoPlayTimeout.current);
      autoPlayTimeout.current = null;
    }
    if (saveProgressInterval.current) {
      clearInterval(saveProgressInterval.current);
      saveProgressInterval.current = null;
    }
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = null;
    }
    
    // Properly cleanup Howl instance
    if (soundRef.current) {
      try {
        soundRef.current.stop();
        soundRef.current.unload();
      } catch (e) {
        console.warn('Error during Howl cleanup:', e);
      }
      soundRef.current = null;
    }
    
    isInitialized.current = false;
  }, []);

  // Save progress function
  const saveProgress = useCallback(() => {
    if (userId && currentTime > 0 && isMounted.current) {
      dispatch(
        updateLocalProgress({
          id: `progress-${Date.now()}`,
          user_id: userId,
          novel_id: novelId,
          chapter_id: chapterId,
          progress_timestamp: new Date().toISOString(),
          audio_position: currentTime,
        })
      );
    }
  }, [userId, novelId, chapterId, currentTime, dispatch]);

  // Progress tracking
  const startProgressInterval = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    progressInterval.current = window.setInterval(() => {
      if (soundRef.current && soundRef.current.playing() && isMounted.current) {
        const seekTime = soundRef.current.seek() as number;
        if (isFinite(seekTime)) {
          setCurrentTime(seekTime);
        }
      }
    }, 100);
  }, []);

  const clearProgressInterval = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  }, []);

  // Reset component state
  const resetState = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(initialPosition);
    setDuration(0);
    setError(null);
    setIsLoading(true);
  }, [initialPosition]);

  // Debounced audio initialization
  const initializeAudio = useCallback(() => {
    // Prevent initialization if already in progress or if URL hasn't changed
    if (isInitialized.current || !audioUrl || audioUrl === lastAudioUrl.current) {
      return;
    }

    console.log('Initializing audio for URL:', audioUrl);
    isInitialized.current = true;
    lastAudioUrl.current = audioUrl;

    // Reset state
    resetState();
    
    // Cleanup any existing instance
    cleanup();

    // Debounce initialization to prevent rapid re-initialization
    initTimeoutRef.current = window.setTimeout(() => {
      try {
        if (!isMounted.current || !audioUrl) {
          isInitialized.current = false;
          return;
        }

        const sound = new Howl({
          src: [audioUrl],
          html5: true,
          preload: true,
          volume: isMuted ? 0 : volume,
          
          onload: () => {
            console.log('Audio loaded successfully');
            if (!isMounted.current) return;
            
            const audioDuration = sound.duration();
            setDuration(audioDuration);
            setIsLoading(false);
            
            // Set initial position
            if (initialPosition > 0 && initialPosition < audioDuration) {
              sound.seek(initialPosition);
              setCurrentTime(initialPosition);
            }

            // Handle auto-play
            if (autoPlay) {
              autoPlayTimeout.current = window.setTimeout(() => {
                try {
                  if (sound && !sound.playing() && isMounted.current) {
                    sound.play();
                  }
                } catch (autoPlayError) {
                  console.warn('Auto-play failed (expected in many browsers):', autoPlayError);
                }
              }, 1000);
            }
          },
          
          onplay: () => {
            console.log('Audio started playing');
            if (!isMounted.current) return;
            setIsPlaying(true);
            setIsLoading(false);
            setError(null);
            startProgressInterval();
          },
          
          onpause: () => {
            console.log('Audio paused');
            if (!isMounted.current) return;
            setIsPlaying(false);
            setIsLoading(false);
            clearProgressInterval();
          },
          
          onstop: () => {
            console.log('Audio stopped');
            if (!isMounted.current) return;
            setIsPlaying(false);
            setIsLoading(false);
            clearProgressInterval();
          },
          
          onend: () => {
            console.log('Audio ended');
            if (!isMounted.current) return;
            setIsPlaying(false);
            setIsLoading(false);
            clearProgressInterval();
            if (onEnded) onEnded();
          },
          
          onseek: () => {
            if (!isMounted.current) return;
            const seekTime = sound.seek() as number;
            if (isFinite(seekTime)) {
              setCurrentTime(seekTime);
            }
          },
          
          onloaderror: (id: number, error: unknown) => {
            console.error('Audio load error:', error);
            if (!isMounted.current) return;
            setError('Failed to load audio file');
            setIsLoading(false);
            isInitialized.current = false;
          },
          
          onplayerror: (id: number, error: unknown) => {
            console.error('Audio play error:', error);
            if (!isMounted.current) return;
            setError('Failed to play audio file');
            setIsPlaying(false);
            setIsLoading(false);
            isInitialized.current = false;
          },
        });

        if (isMounted.current) {
          soundRef.current = sound;
        } else {
          // Component unmounted during initialization
          sound.unload();
        }
        
      } catch (err) {
        console.error('Error initializing audio:', err);
        if (isMounted.current) {
          setError('Failed to initialize audio player');
          setIsLoading(false);
        }
        isInitialized.current = false;
      }
    }, 100); // Small delay to prevent rapid re-initialization
  }, [audioUrl, initialPosition, volume, isMuted, autoPlay, onEnded, resetState, cleanup, startProgressInterval, clearProgressInterval]);

  // Initialize audio when dependencies change
  useEffect(() => {
    // Only initialize if audioUrl actually changed
    if (audioUrl && audioUrl !== lastAudioUrl.current) {
      initializeAudio();
    }
  }, [initializeAudio, audioUrl]);

  // Setup progress saving interval
  useEffect(() => {
    if (userId) {
      saveProgressInterval.current = window.setInterval(() => {
        saveProgress();
      }, 5000);
    }

    return () => {
      if (saveProgressInterval.current) {
        clearInterval(saveProgressInterval.current);
        saveProgressInterval.current = null;
      }
      if (userId) {
        saveProgress();
      }
    };
  }, [userId, saveProgress]);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, [cleanup]);

  // Player controls with better error handling
  const togglePlay = useCallback(() => {
    if (!soundRef.current || isLoading || error || !isMounted.current) {
      console.log('Cannot toggle play:', { hasSound: !!soundRef.current, isLoading, error, isMounted: isMounted.current });
      return;
    }

    try {
      if (isPlaying) {
        soundRef.current.pause();
      } else {
        soundRef.current.play();
      }
    } catch (playError) {
      console.error('Error toggling play:', playError);
      setError('Failed to control audio playback');
      setIsLoading(false);
    }
  }, [isLoading, error, isPlaying]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!soundRef.current || isLoading || error || !isMounted.current) return;
    
    try {
      const newTime = parseFloat(e.target.value);
      if (newTime >= 0 && newTime <= duration && isFinite(newTime)) {
        soundRef.current.seek(newTime);
        setCurrentTime(newTime);
      }
    } catch (seekError) {
      console.error('Error seeking:', seekError);
    }
  }, [isLoading, error, duration]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!soundRef.current || isLoading || error || !isMounted.current) return;
    
    try {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      soundRef.current.volume(isMuted ? 0 : newVolume);
      
      if (newVolume === 0 && !isMuted) {
        setIsMuted(true);
      } else if (newVolume > 0 && isMuted) {
        setIsMuted(false);
      }
    } catch (volumeError) {
      console.error('Error changing volume:', volumeError);
    }
  }, [isLoading, error, isMuted]);

  const toggleMute = useCallback(() => {
    if (!soundRef.current || isLoading || error || !isMounted.current) return;
    
    try {
      const newMuteState = !isMuted;
      setIsMuted(newMuteState);
      soundRef.current.volume(newMuteState ? 0 : volume);
    } catch (muteError) {
      console.error('Error toggling mute:', muteError);
    }
  }, [isLoading, error, isMuted, volume]);

  const skipBackward = useCallback(() => {
    if (!soundRef.current || isLoading || error || !isMounted.current) return;
    
    try {
      const newTime = Math.max(0, currentTime - 10);
      soundRef.current.seek(newTime);
      setCurrentTime(newTime);
    } catch (skipError) {
      console.error('Error skipping backward:', skipError);
    }
  }, [isLoading, error, currentTime]);

  const skipForward = useCallback(() => {
    if (!soundRef.current || isLoading || error || !isMounted.current) return;
    
    try {
      const newTime = Math.min(duration, currentTime + 10);
      soundRef.current.seek(newTime);
      setCurrentTime(newTime);
    } catch (skipError) {
      console.error('Error skipping forward:', skipError);
    }
  }, [isLoading, error, currentTime, duration]);

  const formatTime = useCallback((time: number) => {
    if (!isFinite(time) || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, []);

  return (
    <div className="rounded-lg shadow-md p-4">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
          <button 
            onClick={() => {
              setError(null);
              isInitialized.current = false;
              lastAudioUrl.current = '';
              initializeAudio();
            }}
            className="ml-2 underline"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading && !error && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
          Loading audio...
        </div>
      )}

      <div className="flex flex-col">
        <div className="mb-4">
          <div className="relative w-full h-2 bg-gray-200 rounded-full">
            <div
              className="absolute h-full bg-primary-600 rounded-full transition-all duration-100"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            ></div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="absolute w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              disabled={isLoading || !!error}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={skipBackward}
              className="text-gray-700 hover:text-primary-600 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
              aria-label="Skip backward 10 seconds"
              disabled={isLoading || !!error}
            >
              <SkipBack size={20} />
            </button>

            <button
              onClick={togglePlay}
              className={`${
                isLoading || error
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
              } text-white rounded-full p-3 transition-colors flex items-center justify-center relative`}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              disabled={isLoading || !!error}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : isPlaying ? (
                <Pause size={20} className="text-white" />
              ) : (
                <Play size={20} className="ml-0.5 text-white" />
              )}
            </button>

            <button
              onClick={skipForward}
              className="text-gray-700 hover:text-primary-600 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
              aria-label="Skip forward 10 seconds"
              disabled={isLoading || !!error}
            >
              <SkipForward size={20} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="text-gray-700 hover:text-primary-600 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              disabled={isLoading || !!error}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 accent-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Volume"
              disabled={isLoading || !!error}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;