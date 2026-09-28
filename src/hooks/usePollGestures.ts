import { useEffect } from 'react';
import { useSharedValue, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';

interface UsePollGesturesProps {
  initialX: number;
  initialY: number;
  initialScale: number;
  initialRotation: number;
  onUpdate: (updates: { x: number; y: number; scale: number; rotation: number }) => void;
  onSelect: () => void;
}

/**
 * Reusable Reanimated gesture hook for Poll stickers.
 * Combines simultaneous Pan, Pinch, Rotation, and Tap gestures using GPU-driven shared values
 * to guarantee 60fps interaction speed without locking the React JS thread.
 */
export const usePollGestures = ({
  initialX,
  initialY,
  initialScale,
  initialRotation,
  onUpdate,
  onSelect,
}: UsePollGesturesProps) => {
  // Direct gesture shared values
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const scale = useSharedValue(initialScale);
  const rotation = useSharedValue(initialRotation);

  // Pre-gesture offset states
  const prevTranslateX = useSharedValue(initialX);
  const prevTranslateY = useSharedValue(initialY);
  const prevScale = useSharedValue(initialScale);
  const prevRotation = useSharedValue(initialRotation);

  // Sync state changes from parent down to shared values
  useEffect(() => {
    translateX.value = initialX;
    translateY.value = initialY;
    scale.value = initialScale;
    rotation.value = initialRotation;
  }, [initialX, initialY, initialScale, initialRotation, translateX, translateY, scale, rotation]);

  const commitUpdates = () => {
    onUpdate({
      x: translateX.value,
      y: translateY.value,
      scale: scale.value,
      rotation: rotation.value,
    });
  };

  // Pan gesture for dragging around canvas
  const panGesture = Gesture.Pan()
    .activeOffsetX([-5, 5])
    .activeOffsetY([-5, 5])
    .onStart(() => {
      runOnJS(onSelect)();
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

  // Pinch gesture for multi-touch scaling
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      runOnJS(onSelect)();
      prevScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = prevScale.value * event.scale;
    })
    .onEnd(() => {
      runOnJS(commitUpdates)();
    });

  // Rotation gesture for multi-touch angle spin
  const rotationGesture = Gesture.Rotation()
    .onStart(() => {
      runOnJS(onSelect)();
      prevRotation.value = rotation.value;
    })
    .onUpdate((event) => {
      rotation.value = prevRotation.value + event.rotation;
    })
    .onEnd(() => {
      runOnJS(commitUpdates)();
    });

  // Tap gesture to select and bring sticker to front layer
  const tapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(250)
    .onEnd(() => {
      runOnJS(onSelect)();
    });

  const gesture = Gesture.Simultaneous(panGesture, pinchGesture, rotationGesture, tapGesture);

  return {
    translateX,
    translateY,
    scale,
    rotation,
    gesture,
  };
};
