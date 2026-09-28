import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image';
import { useGifGestures } from '../../hooks/useGifGestures';
import { GifStickerData } from '../../types/gif.types';

interface GifStickerProps {
  /** GIF sticker metadata instance containing position, scaling, rotation, zIndex, and URL. */
  sticker: GifStickerData;
  /** State indicator representing if this specific GIF is selected on the canvas. */
  isSelected: boolean;
  /** Callback to persist position and transform changes back to the editor screen state. */
  onUpdate: (updates: Partial<GifStickerData>) => void;
  /** Callback to set this sticker as active and focused. */
  onSelect: () => void;
  /** Callback to delete this sticker from the story canvas. */
  onDelete: () => void;
}

/**
 * GifSticker represents a single active, highly interactive GIF sticker on the story canvas.
 * Implements GPU-bound translation, scale, and rotation transforms driven by Reanimated shared values,
 * entirely bypassing JS-thread lag. Completely memoized to avoid redundant renders as other states change.
 */
export const GifSticker: React.FC<GifStickerProps> = React.memo(({
  sticker,
  isSelected,
  onUpdate,
  onSelect,
  onDelete,
}) => {
  // Direct integration with our high-performance Reanimated gestures hook
  const { translateX, translateY, scale, rotation, gesture } = useGifGestures({
    initialX: sticker.x,
    initialY: sticker.y,
    initialScale: sticker.scale,
    initialRotation: sticker.rotation,
    onSelect,
    onUpdate: (updates) => {
      onUpdate({
        x: updates.x,
        y: updates.y,
        scale: updates.scale,
        rotation: updates.rotation,
      });
    },
  });

  // Calculate high-performance GPU styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.container,
          animatedStyle,
          { zIndex: sticker.zIndex || 10 },
          isSelected && styles.selectedBorder,
        ]}
      >
        <FastImage
          source={{
            uri: sticker.uri,
            priority: FastImage.priority.high,
            cache: FastImage.cacheControl.immutable,
          }}
          style={styles.gifStyle}
          resizeMode={FastImage.resizeMode.contain}
        />

        {/* sleeking aesthetic delete badge button visible only in selection mode */}
        {isSelected && (
          <TouchableOpacity
            style={styles.deleteBadgeButton}
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteBadgeText}>✕</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </GestureDetector>
  );
});

GifSticker.displayName = 'GifSticker';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gifStyle: {
    width: '100%',
    height: '100%',
  },
  selectedBorder: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  deleteBadgeButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 5,
  },
  deleteBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
});
