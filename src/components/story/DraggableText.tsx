import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  ZoomIn,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { StoryTextItem } from '../../types/story';

interface DraggableTextProps {
  item: StoryTextItem;
  isSelected: boolean;
  onUpdate: (updates: Partial<StoryTextItem>) => void;
  onSelect: () => void;
  onDelete: () => void;
  onDoubleTap: () => void;
}

export const DraggableText = React.memo(({
  item,
  isSelected,
  onUpdate,
  onSelect,
  onDelete,
  onDoubleTap,
}: DraggableTextProps) => {
  const translateX = useSharedValue(item.translateX);
  const translateY = useSharedValue(item.translateY);
  const scale = useSharedValue(item.scale);
  const rotation = useSharedValue(item.rotation);

  const prevTranslateX = useSharedValue(item.translateX);
  const prevTranslateY = useSharedValue(item.translateY);
  const prevScale = useSharedValue(item.scale);
  const prevRotation = useSharedValue(item.rotation);

  // Sync shared values if prop updates (e.g. from editor)
  // Not syncing position to avoid overriding gesture mid-flight
  // but it might be needed for full sync in a more complex app.

  const saveUpdates = () => {
    onUpdate({
      translateX: translateX.value,
      translateY: translateY.value,
      scale: scale.value,
      rotation: rotation.value,
    });
  };

  const panGesture = Gesture.Pan()
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
      runOnJS(saveUpdates)();
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      runOnJS(onSelect)();
      prevScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = prevScale.value * event.scale;
    })
    .onEnd(() => {
      runOnJS(saveUpdates)();
    });

  const rotationGesture = Gesture.Rotation()
    .onStart(() => {
      runOnJS(onSelect)();
      prevRotation.value = rotation.value;
    })
    .onUpdate((event) => {
      rotation.value = prevRotation.value + event.rotation;
    })
    .onEnd(() => {
      runOnJS(saveUpdates)();
    });

  const longPressGesture = Gesture.LongPress()
    .onStart(() => {
      runOnJS(onDelete)();
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      runOnJS(onDoubleTap)();
    });

  const singleTapGesture = Gesture.Tap()
    .onStart(() => {
      runOnJS(onSelect)();
    });

  const composedGestures = Gesture.Simultaneous(
    panGesture,
    pinchGesture,
    rotationGesture,
    longPressGesture,
    Gesture.Exclusive(doubleTapGesture, singleTapGesture)
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  const textStyle: any = {
    fontFamily: item.fontFamily,
    fontSize: item.fontSize,
    color: item.color,
    textAlign: item.textAlign,
  };

  if (item.preset === 'meme') {
    textStyle.textShadowColor = 'black';
    textStyle.textShadowOffset = { width: 1, height: 1 };
    textStyle.textShadowRadius = 2;
  }
  
  if (item.preset === 'elegant' || item.preset === 'strong') {
      textStyle.letterSpacing = item.preset === 'elegant' ? 1 : -1;
  }

  const containerStyle = [
    styles.textContainer,
    item.backgroundEnabled && {
      backgroundColor: item.backgroundColor || 'white',
    },
    isSelected && styles.selectedContainer,
  ];

  return (
    <GestureDetector gesture={composedGestures}>
      <Animated.View entering={ZoomIn.duration(300)} style={[styles.wrapper, animatedStyle]}>
        <View style={containerStyle}>
          <Text style={textStyle}>{item.text}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    alignSelf: 'flex-start',
    padding: 10,
  },
  textContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 150,
  },
  selectedContainer: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
  },
});
