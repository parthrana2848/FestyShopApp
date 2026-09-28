import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { useLinkGestures } from '../../hooks/useLinkGestures';
import { LinkStickerData } from '../../types/link.types';

interface LinkStickerProps {
  /** Link sticker data containing URL, title, position, and transforms. */
  sticker: LinkStickerData;
  /** State indicator representing if this specific link sticker is selected on the canvas. */
  isSelected: boolean;
  /** Callback to persist position and transform changes back to the editor screen state. */
  onUpdate: (updates: Partial<LinkStickerData>) => void;
  /** Callback to set this sticker as active and focused. */
  onSelect: () => void;
  /** Callback to delete this sticker from the story canvas. */
  onDelete: () => void;
  /** Callback invoked on double tap to edit the link sticker metadata. */
  onDoubleTap?: () => void;
}

/**
 * LinkSticker represents a single interactive link sticker on the story canvas.
 * Implements GPU-bound translation, scale, and rotation transforms driven by Reanimated shared values.
 * Displays URL title and provides delete functionality when selected.
 */
export const LinkSticker: React.FC<LinkStickerProps> = React.memo(({
  sticker,
  isSelected,
  onUpdate,
  onSelect,
  onDelete,
  onDoubleTap,
}) => {
  // Direct integration with high-performance Reanimated gestures hook
  const { translateX, translateY, scale, rotation, gesture } = useLinkGestures({
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
    onDoubleTap,
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
        <View style={styles.linkStickerContent}>
          <Text style={styles.linkIcon}>🔗</Text>
          <Text style={styles.linkText} numberOfLines={1}>
            {sticker.title}
          </Text>
        </View>

        {/* Delete badge button visible only in selection mode */}
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

LinkSticker.displayName = 'kjhgcgjcdgjcd';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    minWidth: 100,
  },
  linkStickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  linkIcon: {
    fontSize: 14,
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 120,
  },
  selectedBorder: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    borderStyle: 'dashed',
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
