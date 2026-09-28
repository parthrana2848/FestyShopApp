import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTextAnimation } from '../../hooks/useTextAnimation';
import type { StoryTextItem } from '../../types/story';
import { LocationSticker } from '../location/LocationSticker';

interface DraggableTextProps {
  item: StoryTextItem;
  isSelected: boolean;
  onUpdate: (updates: Partial<StoryTextItem>) => void;
  onSelect: () => void;
  onDelete: () => void;
  onDoubleTap: () => void;
}

/**
 * DraggableText handles standard story text layers.
 * Integrated with Pan, Pinch, and Rotation gestures simultaneously, and handles
 * text animations dynamically via useTextAnimation.
 */
export const DraggableText: React.FC<DraggableTextProps> = React.memo(({
  item,
  isSelected,
  onUpdate,
  onSelect,
  onDelete,
  onDoubleTap,
}) => {
  const translateX = useSharedValue(item.translateX);
  const translateY = useSharedValue(item.translateY);
  const scale = useSharedValue(item.scale);
  const rotation = useSharedValue(item.rotation);

  const prevTranslateX = useSharedValue(item.translateX);
  const prevTranslateY = useSharedValue(item.translateY);
  const prevScale = useSharedValue(item.scale);
  const prevRotation = useSharedValue(item.rotation);

  useEffect(() => {
    translateX.value = item.translateX;
    translateY.value = item.translateY;
    scale.value = item.scale;
    rotation.value = item.rotation;
  }, [item.translateX, item.translateY, item.scale, item.rotation, translateX, translateY, scale, rotation]);

  const saveUpdates = () => {
    onUpdate({
      translateX: translateX.value,
      translateY: translateY.value,
      scale: scale.value,
      rotation: rotation.value,
    });
  };

  const handleCyclePreset = () => {
    const currentIndex = parseInt(item.preset?.replace('style_', '') || '0', 10);
    const nextIndex = (currentIndex + 1) % 4;
    onUpdate({ preset: `style_${nextIndex}` });
  };

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

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd(() => {
      if (item.id !== 'location_sticker') {
        runOnJS(onDoubleTap)();
      }
    });

  const singleTapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(250)
    .onEnd(() => {
      runOnJS(onSelect)();
      if (item.id === 'location_sticker') {
        runOnJS(handleCyclePreset)();
      }
    });

  const tapGesture = Gesture.Exclusive(doubleTapGesture, singleTapGesture);
  const gesture = Gesture.Simultaneous(panGesture, pinchGesture, rotationGesture, tapGesture);

  const gestureStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  const { animatedStyle } = useTextAnimation({
    type: item.animationType || 'none',
    duration: 1400,
    loop: true,
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.wrapper,
          gestureStyle,
          { zIndex: item.zIndex || 1 },
          isSelected && styles.selectedBorder,
        ]}
      >
        <Animated.View style={animatedStyle}>
          {item.id === 'location_sticker' ? (
            <LocationSticker item={item} />
          ) : (
            <View
              style={[
                styles.textWrapper,
                item.backgroundEnabled && {
                  backgroundColor: item.backgroundColor || 'rgba(0,0,0,0.45)',
                },
              ]}
            >
              <Text
                style={[
                  styles.text,
                  {
                    color: item.color,
                    fontFamily: item.fontFamily,
                    fontSize: item.fontSize,
                    textAlign: item.textAlign,
                  },
                ]}
              >
                {item.text}
              </Text>
            </View>
          )}
        </Animated.View>

        {isSelected && (item.id === 'music_sticker' || item.id === 'location_sticker') && (
          <TouchableOpacity
            style={styles.deleteBadgeButton}
            onPress={() => onDelete()}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteBadgeText}>✕</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </GestureDetector>
  );
});

DraggableText.displayName = 'DraggableText';

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    minWidth: 100,
  },
  textWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  text: {
    color: 'white',
    fontWeight: '700',
  },
  selectedBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    borderStyle: 'dashed',
  },
  deleteBadgeButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  deleteBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
