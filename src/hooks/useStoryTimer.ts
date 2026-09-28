import { useEffect, useRef, useCallback } from 'react';
import { Animated } from 'react-native';

export const useStoryTimer = (
  duration: number,
  totalStories: number,
  currentIndex: number,
  onNext: () => void,
  isActive: boolean,
  isPaused: boolean = false
) => {
  const progress = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  
  // Track remaining duration when paused
  const remainingTimeRef = useRef<number>(duration);
  const lastStartTimeRef = useRef<number>(Date.now());
  const currentProgressRef = useRef<number>(0);

  const startTimer = useCallback((fromValue: number = 0, customDuration: number = duration) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animationRef.current) animationRef.current.stop();

    if (!isActive || isPaused) return;

    progress.setValue(fromValue);
    lastStartTimeRef.current = Date.now();
    remainingTimeRef.current = customDuration;

    animationRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: customDuration,
      useNativeDriver: false,
    });

    animationRef.current.start();

    timerRef.current = setTimeout(() => {
      onNext();
    }, customDuration);
  }, [duration, onNext, progress, isActive, isPaused]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animationRef.current) animationRef.current.stop();

    // Calculate elapsed time since last start to update remaining duration
    const elapsed = Date.now() - lastStartTimeRef.current;
    const newRemaining = Math.max(0, remainingTimeRef.current - elapsed);
    remainingTimeRef.current = newRemaining;

    // Get current progress value
    progress.stopAnimation((val) => {
      currentProgressRef.current = val;
    });
  }, [progress]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animationRef.current) animationRef.current.stop();
    progress.setValue(0);
    remainingTimeRef.current = duration;
    currentProgressRef.current = 0;
  }, [progress, duration]);

  // Handle index change (reset timer)
  useEffect(() => {
    clearTimer();
    if (isActive && !isPaused) {
      startTimer(0, duration);
    }
  }, [currentIndex, isActive]);

  // Handle pause/resume state change
  useEffect(() => {
    if (!isActive) {
      clearTimer();
      return;
    }

    if (isPaused) {
      pauseTimer();
    } else {
      // Resume from paused progress and remaining time
      startTimer(currentProgressRef.current, remainingTimeRef.current);
    }
  }, [isPaused, isActive]);

  return { progress, startTimer, clearTimer };
};
