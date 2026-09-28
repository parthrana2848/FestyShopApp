import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { SharedValue } from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { CollageImage, CollageSlot } from '../../types/collage.types';
import { useCollageGestures } from '../../hooks/useCollageGestures';
import { SlotPixelBounds } from '../../utils/collage.utils';

interface CollageItemProps {
  image: CollageImage;
  slotOrder: SharedValue<string[]>;
  activeDragId: SharedValue<string | null>;
  slots: CollageSlot[];
  canvasWidth: number;
  canvasHeight: number;
  baseBounds: SlotPixelBounds;
  isExporting: boolean;
  onOrderChange: (newOrder: string[]) => void;
  onRemove: (id: string) => void;
}

export const CollageItem = React.memo(({
  image,
  slotOrder,
  activeDragId,
  slots,
  canvasWidth,
  canvasHeight,
  baseBounds,
  isExporting,
  onOrderChange,
  onRemove,
}: CollageItemProps) => {
  // Safe invocation of useCollageGestures inside each CollageItem instance
  const { panGesture, animatedStyle } = useCollageGestures({
    imageId: image.id,
    slotOrder,
    activeDragId,
    slots,
    canvasWidth,
    canvasHeight,
    baseBounds,
    onOrderChange,
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          position: 'absolute',
          left: baseBounds.x,
          top: baseBounds.y,
          width: baseBounds.width,
          height: baseBounds.height,
        },
        animatedStyle,
      ]}
    >
      <GestureDetector gesture={panGesture}>
        <View style={styles.innerContainer}>
          <Image
            source={{ uri: image.uri }}
            style={styles.image}
            resizeMode="cover"
          />
          {/* Subtle gradient overlay or border for visual elegance */}
          <View style={styles.overlayBorder} />

          {/* Delete Button - hidden during screenshot export to keep saved image clean */}
          {!isExporting && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemove(image.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </GestureDetector>
    </Animated.View>
  );
});

CollageItem.displayName = 'CollageItem';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  innerContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#1c1c1e', // Dark mode premium background while image loads
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  overlayBorder: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Subtle premium inner border separating slots
    pointerEvents: 'none',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  removeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
