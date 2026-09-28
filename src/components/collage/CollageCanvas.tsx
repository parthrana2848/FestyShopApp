import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { CollageImage, CollageLayout, CollageRatio } from '../../types/collage.types';
import { DraggableSlot } from './DraggableSlot';
import { CollageItem } from './CollageItem';
import { useSharedValue } from 'react-native-reanimated';
import { getSlotPixelBounds, SlotPixelBounds } from '../../utils/collage.utils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CollageCanvasProps {
  images: CollageImage[];
  layout: CollageLayout;
  ratio: CollageRatio;
  isExporting: boolean;
  viewShotRef: React.RefObject<any>;
  onOrderChange: (newOrder: string[]) => void;
  onRemoveImage: (id: string) => void;
}

export const CollageCanvas = React.memo(({
  images,
  layout,
  ratio,
  isExporting,
  viewShotRef,
  onOrderChange,
  onRemoveImage,
}: CollageCanvasProps) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Instantiate shared values with immediate initial mapping
  const slotOrder = useSharedValue<string[]>(images.map((img) => img.id));
  const activeDragId = useSharedValue<string | null>(null);

  // Sync slotOrder shared value with images list updates
  useEffect(() => {
    slotOrder.value = images.map((img) => img.id);
  }, [images]);

  // Responsive canvas size calculation to ensure it fits perfectly on all devices
  const canvasStyle = useMemo(() => {
    const maxCanvasHeight = SCREEN_HEIGHT * 0.58;
    const maxCanvasWidth = SCREEN_WIDTH - 24;

    let width = maxCanvasWidth;
    let height = maxCanvasWidth;

    if (ratio === '9:16') {
      const calculatedHeight = maxCanvasWidth * (16 / 9);
      if (calculatedHeight <= maxCanvasHeight) {
        width = maxCanvasWidth;
        height = calculatedHeight;
      } else {
        height = maxCanvasHeight;
        width = maxCanvasHeight * (9 / 16);
      }
    } else {
      // 1:1 Square
      const size = Math.min(maxCanvasWidth, maxCanvasHeight);
      width = size;
      height = size;
    }

    return {
      width,
      height,
    };
  }, [ratio]);

  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };

  // Pre-calculate and memoize the pixel bounds for each layout slot
  const slotBoundsList = useMemo(() => {
    if (dimensions.width <= 0 || dimensions.height <= 0) return [];
    return layout.slots.map((slot) => ({
      slot,
      bounds: getSlotPixelBounds(slot, dimensions.width, dimensions.height),
    }));
  }, [layout, dimensions]);

  // Calculate static/stable base pixel bounds for each image relative to its baseline layout position
  const baseBoundsMap = useMemo(() => {
    const boundsMap: Record<string, SlotPixelBounds> = {};
    if (dimensions.width <= 0 || dimensions.height <= 0) return boundsMap;

    images.forEach((img, index) => {
      const slot = layout.slots[index];
      if (slot) {
        boundsMap[img.id] = getSlotPixelBounds(slot, dimensions.width, dimensions.height);
      }
    });

    return boundsMap;
  }, [images, layout, dimensions]);

  return (
    <View style={styles.outerContainer}>
      {/* 
        Wrap ONLY the actual canvas boundary in ViewShot.
        This guarantees the exported picture has the exact aspect ratio bounding box 
        without any surrounding layout margins/padding, preventing double-shrinking visibility bugs.
      */}
      <ViewShot
        ref={viewShotRef}
        options={{ format: 'jpg', quality: 0.95 }}
        style={[styles.canvas, canvasStyle]}
        onLayout={handleLayout}
      >
        {/* 1. Render Background Slots (Static Slot Boundaries) */}
        {slotBoundsList.map(({ slot, bounds }) => (
          <DraggableSlot
            key={`bg-${slot.id}`}
            bounds={bounds}
            isEmpty={false}
          />
        ))}

        {/* 2. Render Foreground Draggable/Animatable Collage Items */}
        {dimensions.width > 0 &&
          dimensions.height > 0 &&
          images.map((image) => {
            const baseBounds = baseBoundsMap[image.id];
            if (!baseBounds) return null;

            return (
              <CollageItem
                key={`item-${layout.id}-${image.id}`}
                image={image}
                slotOrder={slotOrder}
                activeDragId={activeDragId}
                slots={layout.slots}
                canvasWidth={dimensions.width}
                canvasHeight={dimensions.height}
                baseBounds={baseBounds}
                isExporting={isExporting}
                onOrderChange={onOrderChange}
                onRemove={onRemoveImage}
              />
            );
          })}
      </ViewShot>
    </View>
  );
});

CollageCanvas.displayName = 'CollageCanvas';

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  canvas: {
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
    position: 'relative',
  },
});
