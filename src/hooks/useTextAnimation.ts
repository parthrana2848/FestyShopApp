import { useEffect } from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { TextAnimationType } from '../types/story.types';

interface UseTextAnimationProps {
  type: TextAnimationType;
  duration?: number;
  delay?: number;
  loop?: boolean;
}

export const useTextAnimation = ({
  type,
  duration = 1400,
  delay = 0,
  loop = true,
}: UseTextAnimationProps) => {
  const opacity = useSharedValue(type === 'fade' || type === 'rotateIn' ? 0 : 1);
  const translateX = useSharedValue(type === 'slideLeft' ? 30 : 0);
  const translateY = useSharedValue(type === 'slideUp' ? 30 : 0);
  const scale = useSharedValue(type === 'zoom' || type === 'pop' ? 0.8 : 1);
  const rotate = useSharedValue(type === 'rotateIn' ? -0.8 : 0);

  const startAnimation = () => {
    stopAnimation();

    // Reset shared values to their proper starting points based on the active animation type
    opacity.value = (type === 'fade' || type === 'rotateIn' || type === 'slideUp' || type === 'slideLeft' || type === 'pop') ? 0 : 1;
    translateX.value = type === 'slideLeft' ? 30 : 0;
    translateY.value = type === 'slideUp' ? 30 : 0;
    scale.value = (type === 'zoom' || type === 'pop') ? 0.8 : 1;
    rotate.value = type === 'rotateIn' ? -0.8 : 0;

    if (type === 'none') {
      return;
    }

    const delayWrapper = (animation: any) =>
      delay ? withDelay(delay, animation) : animation;

    switch (type) {
      case 'fade':
        opacity.value = withRepeat(
          delayWrapper(withTiming(1, { duration, easing: Easing.out(Easing.ease) })),
          loop ? -1 : 1,
          true
        );
        break;
      case 'slideUp':
        translateY.value = withTiming(0, { duration, easing: Easing.out(Easing.exp) });
        opacity.value = withTiming(1, { duration: duration / 1.5, easing: Easing.out(Easing.ease) });
        break;
      case 'slideLeft':
        translateX.value = withTiming(0, { duration, easing: Easing.out(Easing.exp) });
        opacity.value = withTiming(1, { duration: duration / 1.5, easing: Easing.out(Easing.ease) });
        break;
      case 'bounce':
        translateY.value = withRepeat(
          delayWrapper(withTiming(-12, { duration: duration / 2, easing: Easing.out(Easing.bounce) })),
          loop ? -1 : 1,
          true
        );
        break;
      case 'zoom':
        scale.value = withRepeat(
          delayWrapper(withTiming(1, { duration, easing: Easing.out(Easing.exp) })),
          loop ? -1 : 1,
          true
        );
        break;
      case 'pop':
        scale.value = delayWrapper(
          withSpring(1, {
            damping: 7,
            stiffness: 180,
          })
        );
        opacity.value = withTiming(1, { duration: duration / 2, easing: Easing.out(Easing.ease) });
        break;
      case 'pulse':
        scale.value = withRepeat(
          delayWrapper(withTiming(1.08, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })),
          loop ? -1 : 1,
          true
        );
        break;
      case 'rotateIn':
        rotate.value = withTiming(0, { duration, easing: Easing.out(Easing.exp) });
        opacity.value = withTiming(1, { duration, easing: Easing.out(Easing.ease) });
        break;
      default:
        opacity.value = withTiming(1, { duration, easing: Easing.out(Easing.ease) });
    }
  };

  const stopAnimation = () => {
    cancelAnimation(opacity);
    cancelAnimation(translateX);
    cancelAnimation(translateY);
    cancelAnimation(scale);
    cancelAnimation(rotate);
  };

  useEffect(() => {
    startAnimation();
    return () => {
      stopAnimation();
    };
  }, [type, duration, delay, loop]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}rad` },
    ],
  }));

  return {
    animatedStyle,
    startAnimation,
    stopAnimation,
  };
};
