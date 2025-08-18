'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { updateLocalProgress } from '../../store/slices/progressSlice';
import { Howl, Howler } from 'howler';

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
  onEnded,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialPosition);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const soundRef = useRef<Howl | null>(null);
  const progressInterval = useRef<number | null>(null);
  const saveProgressInterval = useRef<number | null>(null);
  const isMounted = useRef(true);
  const lastInitializedUrl = useRef<string>('');
  const isInitializing = useRef(false);
  
  const dispatch = useAppDispatch();

  // Simple cleanup function
  const cleanup = useCallback(() => {
    console.log('Cleaning up audio...');
    
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    
    if (soundRef.current) {
      try {
        soundRef.current.stop();
        soundRef.current.unload();
      } catch (e) {
        console.warn('Cleanup error:', e);
      }
      soundRef.current = null;
    }
  }, []);

  // Save progress
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
  const startProgressTracking = useCallback(() => {
    if (progressInterval.current) return; // Don't start if already running
    
    progressInterval.current = window.setInterval(() => {
      if (soundRef.current && soundRef.current.playing() && isMounted.current) {
        const seekTime = soundRef.current.seek() as number;
        if (isFinite(seekTime) && seekTime >= 0) {
          setCurrentTime(seekTime);
        }
      }
    }, 100);
  }, []);

  const stopProgressTracking = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  }, []);

  // Initialize audio - MUCH SIMPLER VERSION
  const initializeAudio = useCallback(() => {
    // Prevent multiple initializations
    if (!audioUrl || 
        isInitializing.current || 
        lastInitializedUrl.current === audioUrl ||
        !isMounted.current) {
      console.log('Skipping init:', {
        hasUrl: !!audioUrl,
        isInitializing: isInitializing.current,
        sameUrl: lastInitializedUrl.current === audioUrl,
        isMounted: isMounted.current
      });
      return;
    }

    console.log('Initializing audio for:', audioUrl);
    
    // Mark as initializing to prevent multiple calls
    isInitializing.current = true;
    lastInitializedUrl.current = audioUrl;
    
    // Reset state
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);
    
    // Cleanup any existing sound
    cleanup();

    try {
      const sound = new Howl({
        src: [audioUrl],
        html5: true,
        preload: true,
        volume: isMuted ? 0 : volume,
        
        onload: () => {
          console.log('Audio loaded');
          if (!isMounted.current) {
            sound.unload();
            return;
          }
          
          const audioDuration = sound.duration();
          setDuration(audioDuration);
          setIsLoading(false);
          isInitializing.current = false; // Mark initialization complete
          
          // Set initial position
          if (initialPosition > 0 && initialPosition < audioDuration) {
            sound.seek(initialPosition);
            setCurrentTime(initialPosition);
          }
        },
        
        onplay: () => {
          if (!isMounted.current) return;
          setIsPlaying(true);
          startProgressTracking();
        },
        
        onpause: () => {
          if (!isMounted.current) return;
          setIsPlaying(false);
          stopProgressTracking();
        },
        
        onstop: () => {
          if (!isMounted.current) return;
          setIsPlaying(false);
          stopProgressTracking();
        },
        
        onend: () => {
          if (!isMounted.current) return;
          setIsPlaying(false);
          stopProgressTracking();
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
          console.error('Load error:', error);
          if (!isMounted.current) return;
          setError('Failed to load audio');
          setIsLoading(false);
          isInitializing.current = false;
        },
        
        onplayerror: (id: number, error: unknown) => {
          console.error('Play error:', error);
          if (!isMounted.current) return;
          setError('Failed to play audio');
          setIsPlaying(false);
          isInitializing.current = false;
        },
      });

      if (isMounted.current) {
        soundRef.current = sound;
      } else {
        sound.unload();
        isInitializing.current = false;
      }
      
    } catch (err) {
      console.error('Init error:', err);
      setError('Audio initialization failed');
      setIsLoading(false);
      isInitializing.current = false;
    }
  }, []); // NO DEPENDENCIES to prevent infinite loops!

  // Initialize only when audioUrl changes - SIMPLE EFFECT
  useEffect(() => {
    // Reset state when URL changes
    lastInitializedUrl.current = '';
    isInitializing.current = false;
    
    if (audioUrl) {
      // Small delay to ensure state is reset
      const timer = setTimeout(() => {
        initializeAudio();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [audioUrl]); // ONLY audioUrl dependency

  // Progress saving interval
  useEffect(() => {
    if (userId) {
      saveProgressInterval.current = window.setInterval(saveProgress, 5000);
    }

    return () => {
      if (saveProgressInterval.current) {
        clearInterval(saveProgressInterval.current);
        saveProgressInterval.current = null;
      }
    };
  }, [userId, saveProgress]);

  // Mount/unmount
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      isInitializing.current = false;
      cleanup();
      // Global cleanup
      try {
        Howler.unload();
      } catch (e) {
        console.warn('Global cleanup error:', e);
      }
    };
  }, [cleanup]);

  // Control functions - SIMPLE VERSIONS
  const togglePlay = () => {
    if (!soundRef.current || isLoading || error) return;
    
    try {
      if (isPlaying) {
        soundRef.current.pause();
      } else {
        soundRef.current.play();
      }
    } catch (err) {
      console.error('Play/pause error:', err);
      setError('Playback control failed');
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!soundRef.current || isLoading || error) return;
    
    const newTime = parseFloat(e.target.value);
    if (newTime >= 0 && newTime <= duration) {
      soundRef.current.seek(newTime);
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!soundRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    soundRef.current.volume(isMuted ? 0 : newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!soundRef.current) return;
    
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    soundRef.current.volume(newMuteState ? 0 : volume);
  };

  const skipBackward = () => {
    if (!soundRef.current || isLoading || error) return;
    
    const newTime = Math.max(0, currentTime - 10);
    soundRef.current.seek(newTime);
    setCurrentTime(newTime);
  };

  const skipForward = () => {
    if (!soundRef.current || isLoading || error) return;
    
    const newTime = Math.min(duration, currentTime + 10);
    soundRef.current.seek(newTime);
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const retry = () => {
    setError(null);
    lastInitializedUrl.current = '';
    isInitializing.current = false;
    cleanup();
    
    setTimeout(() => {
      initializeAudio();
    }, 500);
  };

  // Don't render if no audio URL
  if (!audioUrl) {
    return (
      <div className="rounded-lg shadow-md p-4">
        <div className="p-3 bg-gray-50 text-gray-700 rounded-md text-sm">
          No audio available for this chapter
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-md p-4">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
          <button onClick={retry} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}

      {isLoading && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
          Loading audio...
        </div>
      )}

      <div className="flex flex-col">
        <div className="mb-4">
          <div className="relative w-full h-2 bg-gray-200 rounded-full">
            <div
              className="absolute h-full bg-primary-600 rounded-full"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="absolute w-full h-full opacity-0 cursor-pointer"
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
              disabled={isLoading || !!error}
              className="text-gray-700 hover:text-primary-600 disabled:text-gray-400"
            >
              <SkipBack size={20} />
            </button>

            <button
              onClick={togglePlay}
              disabled={isLoading || !!error}
              className={`${
                isLoading || error
                  ? 'bg-gray-400'
                  : 'bg-primary-600 hover:bg-primary-700'
              } text-white rounded-full p-3 transition-colors`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : isPlaying ? (
                <Pause size={20} />
              ) : (
                <Play size={20} className="ml-0.5" />
              )}
            </button>

            <button
              onClick={skipForward}
              disabled={isLoading || !!error}
              className="text-gray-700 hover:text-primary-600 disabled:text-gray-400"
            >
              <SkipForward size={20} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              disabled={isLoading || !!error}
              className="text-gray-700 hover:text-primary-600 disabled:text-gray-400"
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
              className="w-20 accent-primary-600"
              disabled={isLoading || !!error}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;