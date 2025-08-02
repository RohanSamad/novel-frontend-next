'use client'
import React, { useState, useEffect, useRef } from 'react';
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
  const autoPlayAttempted = useRef(false);
  const autoPlayTimeout = useRef<number | null>(null);
  const dispatch = useAppDispatch();

  // Cleanup function to stop audio and clear intervals
  const cleanup = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    if (soundRef.current) {
      soundRef.current.unload();
      soundRef.current = null;
    }
    if (autoPlayTimeout.current) {
      clearTimeout(autoPlayTimeout.current);
      autoPlayTimeout.current = null;
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return cleanup;
  }, []);

  // Reset state when audio URL changes
  useEffect(() => {
    cleanup();
    autoPlayAttempted.current = false;
    setIsPlaying(false);
    setCurrentTime(initialPosition);
    setDuration(0);
    setError(null);
    setIsLoading(true);
  }, [audioUrl, initialPosition]);

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        cleanup();

        if (!audioUrl) {
          throw new Error('Invalid audio URL');
        }

        const sound = new Howl({
          src: [audioUrl],
          html5: true,
          preload: true,
          volume: isMuted ? 0 : volume,
          onload: () => {
            setDuration(sound.duration());
            setIsLoading(false);
            if (initialPosition > 0) {
              sound.seek(initialPosition);
              setCurrentTime(initialPosition);
            }

            console.log('Audio load error:', !autoPlayAttempted.current,autoPlay);
            // Add 2-second buffer before autoplay
            if (autoPlay ) {
              autoPlayAttempted.current = true;
              autoPlayTimeout.current = window.setTimeout(() => {
                if (sound && !sound.playing()) {
                  sound.play();
                  setIsPlaying(true);
                  startProgressInterval();
                }
              }, 2000);
            }
          },
          onplay: () => {
            // Stop any other playing audio
            setIsPlaying(true);
            startProgressInterval();
          },
          onpause: () => {
            setIsPlaying(false);
            clearProgressInterval();
          },
          onstop: () => {
            setIsPlaying(false);
            clearProgressInterval();
          },
          onend: () => {
            setIsPlaying(false);
            clearProgressInterval();
            if (onEnded) onEnded();
           
          },
          onseek: () => {
            setCurrentTime(sound.seek() as number);
          },
          onloaderror: (_: number, error: unknown) => {
            const message = typeof error === 'string' ? error : 'Unknown error';
            console.error('Audio load error:', message);
            setError('Failed to load audio file');
            setIsLoading(false);
          },
          onplayerror: (_: number, error: unknown) => {
            const message = typeof error === 'string' ? error : 'Unknown error';
            console.error('Audio play error:', message);
            setError('Failed to play audio file'.concat(message));
            setIsLoading(false);
          },
        });

        soundRef.current = sound;
      } catch (err) {
        console.error('Error initializing audio:', err);
        setError('Failed to initialize audio player');
        setIsLoading(false);
      }
    };

    initializeAudio();
  }, [audioUrl, volume, isMuted, initialPosition, autoPlay, onEnded]);

  // Save progress periodically
  useEffect(() => {
    const saveProgressInterval = setInterval(() => {
      if (userId && currentTime > 0) {
        saveProgress();
      }
    }, 5000);

    return () => {
      clearInterval(saveProgressInterval);
      if (userId) {
        saveProgress();
      }
    };
  }, [userId, novelId, chapterId, currentTime,]);

  const saveProgress = () => {
    dispatch(
      updateLocalProgress({
        id: `progress-${Date.now()}`,
        user_id: userId || 'anonymous',
        novel_id: novelId,
        chapter_id: chapterId,
        progress_timestamp: new Date().toISOString(),
        audio_position: currentTime,
      })
    );
  };

  const startProgressInterval = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    progressInterval.current = window.setInterval(() => {
      if (soundRef.current && soundRef.current.playing()) {
        setCurrentTime(soundRef.current.seek() as number);
      }
    }, 100) as unknown as number;
  };

  const clearProgressInterval = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const togglePlay = () => {
    if (!soundRef.current || isLoading || error) return;

    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!soundRef.current || isLoading || error) return;
    const newTime = parseFloat(e.target.value);
    soundRef.current.seek(newTime);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!soundRef.current || isLoading || error) return;
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
    if (!soundRef.current || isLoading || error) return;
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
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className=" rounded-lg shadow-md p-4">
      {error && (
        <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md text-sm">{error}</div>
      )}

      {isLoading && !error && (
        <div className="mb-4 p-3 bg-primary-50 text-primary-700 rounded-md text-sm">
          Loading audio...
        </div>
      )}

      <div className="flex flex-col">
        <div className="mb-4">
          <div className="relative w-full h-2 bg-gray-200 rounded-full">
            <div
              className="absolute h-full bg-primary-600 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
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
              } text-white rounded-full p-3 transition-colors`}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              disabled={isLoading || !!error}
            >
              {isPlaying ? <Pause size={20} className='text-black dark:text-gray-200' /> : <Play size={20} className="ml-0.5 text-black dark:text-gray-200" />}
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