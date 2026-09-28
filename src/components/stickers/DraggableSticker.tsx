import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { StoryStickerItem } from '../../types/story';
import { useStickerGestures } from '../../hooks/useStickerGestures';
import { StickerRenderer } from './StickerRenderer';

interface DraggableStickerProps {
  item: StoryStickerItem;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<StoryStickerItem>) => void;
  onSelect: () => void;
  onDelete: () => void;
}

/**
 * DraggableSticker is the canvas overlay representing an active sticker.
 * Integrates directly with gesture detectors (pan, pinch, rotation) to manipulate
 * translation, rotation, and scaling in real time with GPU-acceleration.
 * Employs dashed selection boundaries and an interactive red delete badge button.
 */
export const DraggableSticker: React.FC<DraggableStickerProps> = React.memo(({
  item,
  isSelected,
  onUpdate,
  onSelect,
  onDelete,
}) => {
  // Bind high-performance Reanimated gestures
  const { gesture, animatedStyle } = useStickerGestures({
    item,
    onUpdate,
    onSelect,
  });

  const containerStyle = [
    styles.stickerContainer,
    isSelected && styles.selectedBorder,
  ];

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.wrapper,
          animatedStyle,
          { zIndex: item.zIndex || 10 },
        ]}
      >
        <View style={containerStyle}>
          <StickerRenderer item={item} />
        </View>

        {/* Action badge button to delete this overlay on tap (only in active selection state) */}
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
}, (prevProps, nextProps) => {
  // High-performance equality comparator to prevent heavy component updates
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.x === nextProps.item.x &&
    prevProps.item.y === nextProps.item.y &&
    prevProps.item.scale === nextProps.item.scale &&
    prevProps.item.rotation === nextProps.item.rotation &&
    prevProps.item.zIndex === nextProps.item.zIndex &&
    prevProps.item.uri === nextProps.item.uri
  );
});

DraggableSticker.displayName = 'DraggableSticker';

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    alignSelf: 'flex-start',
  },
  stickerContainer: {
    padding: 8,
  },
  selectedBorder: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  deleteBadgeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  deleteBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '900',
  },
});
