import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { StoryStickerItem } from '../types/story';

export interface UseStickerGesturesProps {
  item: StoryStickerItem;
  onUpdate: (id: string, updates: Partial<StoryStickerItem>) => void;
  onSelect?: () => void;
}

/**
 * Reusable, high-performance Reanimated gesture hook for interactive story stickers.
 * Integrates Pan, Pinch, Rotation, and Tap gestures in parallel, updates GPU shared values
 * on every frame, and commits the changes back to React state *only* when the gesture ends.
 */
export const useStickerGestures = ({
  item,
  onUpdate,
  onSelect,
}: UseStickerGesturesProps) => {
  // Direct gesture shared values initialized from the item props
  const translateX = useSharedValue(item.x);
  const translateY = useSharedValue(item.y);
  const scale = useSharedValue(item.scale);
  const rotation = useSharedValue(item.rotation);

  // Pre-gesture offset states
  const prevTranslateX = useSharedValue(item.x);
  const prevTranslateY = useSharedValue(item.y);
  const prevScale = useSharedValue(item.scale);
  const prevRotation = useSharedValue(item.rotation);

  // Synchronize state changes from parent down to shared values
  useEffect(() => {
    translateX.value = item.x;
    translateY.value = item.y;
    scale.value = item.scale;
    rotation.value = item.rotation;
  }, [item.x, item.y, item.scale, item.rotation, translateX, translateY, scale, rotation]);

  // Persists the final transform state back to the parent React state
  const commitUpdates = () => {
    onUpdate(item.id, {
      x: translateX.value,
      y: translateY.value,
      scale: scale.value,
      rotation: rotation.value,
    });
  };

  // Pan gesture for dragging stickers around the story canvas
  const panGesture = Gesture.Pan()
    .activeOffsetX([-5, 5])
    .activeOffsetY([-5, 5])
    .onStart(() => {
      if (onSelect) {
        runOnJS(onSelect)();
      }
      prevTranslateX.value = translateX.value;
      prevTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = prevTranslateX.value + event.translationX;
      translateY.value = prevTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      runOnJS(commitUpdates)();
    });

  // Pinch gesture for multi-touch scale resizing
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      if (onSelect) {
        runOnJS(onSelect)();
      }
      prevScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = prevScale.value * event.scale;
    })
    .onEnd(() => {
      runOnJS(commitUpdates)();
    });

  // Rotation gesture for multi-touch angle rotating
  const rotationGesture = Gesture.Rotation()
    .onStart(() => {
      if (onSelect) {
        runOnJS(onSelect)();
      }
      prevRotation.value = rotation.value;
    })
    .onUpdate((event) => {
      rotation.value = prevRotation.value + event.rotation;
    })
    .onEnd(() => {
      runOnJS(commitUpdates)();
    });

  // Single tap gesture to highlight/select the sticker and bring it to foreground
  const tapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(250)
    .onEnd(() => {
      if (onSelect) {
        runOnJS(onSelect)();
      }
    });

  // Compose all interactive gestures simultaneously
  const gesture = Gesture.Simultaneous(panGesture, pinchGesture, rotationGesture, tapGesture);

  // GPU-accelerated transform styles for premium smoothness
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  return {
    gesture,
    animatedStyle,
  };
};
export type UseStickerGesturesReturn = ReturnType<typeof useStickerGestures>;
