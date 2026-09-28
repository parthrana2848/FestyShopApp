import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated } from 'react-native';
import type { QuickActionItem, UseQuickActionsReturn } from '../../components/quick-actions/quickActions.types';
import {
  ANIMATION_DURATION,
  ANIMATION_SCALE_OPEN,
  ANIMATION_SCALE_CLOSED,
  ANIMATION_TRANSLATE_Y,
} from '../../constants/quick-actions/quickActions.constants';
import { BACKDROP_OPACITY } from '../../constants/quick-actions/quickActions.constants';
import logger from '../../utils/biometric.logger';

export function useQuickActions(actions: QuickActionItem[], onAction?: (action: QuickActionItem) => void): UseQuickActionsReturn {
  const [isOpen, setIsOpen] = useState(false);

  // Stable animated values
  const rotation = useRef(new Animated.Value(0)).current; // 0 -> 1
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(ANIMATION_SCALE_CLOSED)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Open menu animation: parallel rotate, fade-in backdrop, scale up, translate menu
  const openMenu = useCallback(() => {
    if (isOpen) return;
    setIsOpen(true);
    try {
      Animated.parallel([
        Animated.timing(rotation, { toValue: 1, duration: ANIMATION_DURATION, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: BACKDROP_OPACITY, duration: ANIMATION_DURATION, useNativeDriver: true }),
        Animated.timing(scale, { toValue: ANIMATION_SCALE_OPEN, duration: ANIMATION_DURATION, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -ANIMATION_TRANSLATE_Y, duration: ANIMATION_DURATION, useNativeDriver: true }),
      ]).start();
    } catch (err) {
      logger.error('[useQuickActions] animation open interrupted', { err });
    }
  }, [isOpen, rotation, backdropOpacity, scale, translateY]);

  const closeMenu = useCallback(() => {
    if (!isOpen) return;
    try {
      Animated.parallel([
        Animated.timing(rotation, { toValue: 0, duration: ANIMATION_DURATION, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: ANIMATION_DURATION, useNativeDriver: true }),
        Animated.timing(scale, { toValue: ANIMATION_SCALE_CLOSED, duration: ANIMATION_DURATION, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: ANIMATION_DURATION, useNativeDriver: true }),
      ]).start(() => setIsOpen(false));
    } catch (err) {
      logger.error('[useQuickActions] animation close interrupted', { err });
      setIsOpen(false);
    }
  }, [isOpen, rotation, backdropOpacity, scale, translateY]);

  const toggleMenu = useCallback(() => {
    if (isOpen) closeMenu(); else openMenu();
  }, [isOpen, openMenu, closeMenu]);

  const handleActionPress = useCallback(
    (action: QuickActionItem) => {
      try {
        // If action has its own handler, call it; otherwise, bubble up to host
        if (action.onPress) {
          void action.onPress();
        } else {
          onAction?.(action);
        }
      } catch (err) {
        logger.error('[useQuickActions] action handler failed', { err, actionId: action.id });
      } finally {
        closeMenu();
      }
    },
    [onAction, closeMenu],
  );

  // cleanup: stop animations if unmount
  useEffect(() => {
    return () => {
      rotation.stopAnimation?.();
      backdropOpacity.stopAnimation?.();
      scale.stopAnimation?.();
      translateY.stopAnimation?.();
    };
  }, [rotation, backdropOpacity, scale, translateY]);

  const ret = useMemo<UseQuickActionsReturn>(() => ({
    isOpen,
    openMenu,
    closeMenu,
    toggleMenu,
    handleActionPress,
    rotation: { value: rotation },
    backdropOpacity: { value: backdropOpacity },
    scale: { value: scale },
    translateY: { value: translateY },
  }), [isOpen, openMenu, closeMenu, toggleMenu, handleActionPress, rotation, backdropOpacity, scale, translateY]);

  return ret;
}

export default useQuickActions;
