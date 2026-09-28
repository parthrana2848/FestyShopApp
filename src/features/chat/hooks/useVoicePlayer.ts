import { useCallback, useEffect, useRef, useState } from 'react';
import Sound from 'react-native-sound';

export type PlayerState =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'error';

export interface PlaybackProgress {
  current: number;
  duration: number;
}

interface UseVoicePlayerReturn {
  state: PlayerState;
  progress: PlaybackProgress;
  play: (url: string) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (position: number) => Promise<void>;
  stop: () => Promise<void>;
}

export const useVoicePlayer = (): UseVoicePlayerReturn => {
  const soundRef = useRef<Sound | null>(null);
  const progressTimerRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  const [state, setState] =
    useState<PlayerState>('idle');

  const [progress, setProgress] =
    useState<PlaybackProgress>({
      current: 0,
      duration: 0,
    });

  /**
   * Clear progress polling timer.
   */
  const clearProgressTimer = useCallback((): void => {
    if (progressTimerRef.current !== null) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  /**
   * Update current playback position.
   */
  const updateProgress = useCallback((): void => {
    const sound = soundRef.current;

    if (!sound) {
      return;
    }

    sound.getCurrentTime((currentTime: number) => {
      const duration = sound.getDuration();

      setProgress({
        current: Math.max(0, currentTime),
        duration: Math.max(0, duration),
      });
    });
  }, []);

  /**
   * Start progress polling.
   */
  const startProgressTimer = useCallback((): void => {
    clearProgressTimer();

    updateProgress();

    progressTimerRef.current = setInterval(() => {
      updateProgress();
    }, 100);
  }, [
    clearProgressTimer,
    updateProgress,
  ]);

  /**
   * Release current Sound instance.
   */
  const releaseSound = useCallback((): void => {
    clearProgressTimer();

    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.release();
      soundRef.current = null;
    }
  }, [clearProgressTimer]);

  /**
   * Play audio from URL.
   */
  const play = useCallback(
    async (url: string): Promise<void> => {
      if (!url) {
        return;
      }

      try {
        setState('loading');

        /*
         * Stop previous audio.
         */
        releaseSound();

        setProgress({
          current: 0,
          duration: 0,
        });

        const sound = await new Promise<Sound>(
          (resolve, reject) => {
            const instance = new Sound(
              url,
              '',
              (error: unknown) => {
                if (error) {
                  reject(error);
                  return;
                }

                resolve(instance);
              },
            );
          },
        );

        soundRef.current = sound;

        const duration = sound.getDuration();

        setProgress({
          current: 0,
          duration: Math.max(0, duration),
        });

        setState('playing');

        startProgressTimer();

        sound.play(
          (success: boolean) => {
            clearProgressTimer();

            if (success) {
              const finalDuration =
                sound.getDuration();

              setProgress({
                current: finalDuration,
                duration: finalDuration,
              });
            }

            sound.release();

            if (soundRef.current === sound) {
              soundRef.current = null;
            }

            setState('idle');
          },
        );
      } catch (error: unknown) {
        console.error(
          '[useVoicePlayer] Play failed:',
          error,
        );

        clearProgressTimer();

        if (soundRef.current) {
          soundRef.current.release();
          soundRef.current = null;
        }

        setState('error');

        setProgress({
          current: 0,
          duration: 0,
        });
      }
    },
    [
      clearProgressTimer,
      releaseSound,
      startProgressTimer,
    ],
  );

  /**
   * Pause current audio.
   */
  const pause = useCallback(
    async (): Promise<void> => {
      const sound = soundRef.current;

      if (!sound) {
        return;
      }

      sound.pause();

      clearProgressTimer();
      updateProgress();

      setState('paused');
    },
    [
      clearProgressTimer,
      updateProgress,
    ],
  );

  /**
   * Resume paused audio.
   */
  const resume = useCallback(
    async (): Promise<void> => {
      const sound = soundRef.current;

      if (!sound) {
        return;
      }

      setState('playing');

      sound.play(
        (success: boolean) => {
          clearProgressTimer();

          if (success) {
            const duration =
              sound.getDuration();

            setProgress({
              current: duration,
              duration,
            });
          }

          sound.release();

          if (soundRef.current === sound) {
            soundRef.current = null;
          }

          setState('idle');
        },
      );

      startProgressTimer();
    },
    [
      clearProgressTimer,
      startProgressTimer,
    ],
  );

  /**
   * Seek to position in seconds.
   */
  const seek = useCallback(
    async (position: number): Promise<void> => {
      const sound = soundRef.current;

      if (!sound) {
        return;
      }

      const duration = sound.getDuration();

      const safePosition = Math.min(
        Math.max(0, position),
        duration,
      );

      sound.setCurrentTime(safePosition);

      setProgress({
        current: safePosition,
        duration,
      });

      if (state === 'playing') {
        startProgressTimer();
      }
    },
    [startProgressTimer, state],
  );

  /**
   * Stop current audio.
   */
  const stop = useCallback(
    async (): Promise<void> => {
      releaseSound();

      setProgress({
        current: 0,
        duration: 0,
      });

      setState('idle');
    },
    [releaseSound],
  );

  /**
   * Cleanup when screen/component unmounts.
   */
  useEffect(() => {
    return () => {
      clearProgressTimer();

      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.release();
        soundRef.current = null;
      }
    };
  }, [clearProgressTimer]);

  return {
    state,
    progress,
    play,
    pause,
    resume,
    seek,
    stop,
  };
};