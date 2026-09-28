import { useSharedValue, useAnimatedStyle, withSpring, runOnJS, SharedValue } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { CollageSlot } from '../types/collage.types';
import { getSlotPixelBounds, SlotPixelBounds } from '../utils/collage.utils';

interface UseCollageGesturesProps {
  imageId: string;
  slotOrder: SharedValue<string[]>;
  activeDragId: SharedValue<string | null>;
  slots: CollageSlot[];
  canvasWidth: number;
  canvasHeight: number;
  baseBounds: SlotPixelBounds;
  onOrderChange: (newOrder: string[]) => void;
}

export const useCollageGestures = ({
  imageId,
  slotOrder,
  activeDragId,
  slots,
  canvasWidth,
  canvasHeight,
  baseBounds,
  onOrderChange,
}: UseCollageGesturesProps) => {
  // Local translation offsets for the active dragged item
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);

  /**
   * Create the Pan Gesture for this specific image instance
   */
  const panGesture = Gesture.Pan()
    .onStart(() => {
      activeDragId.value = imageId;
      dragX.value = 0;
      dragY.value = 0;
    })
    .onUpdate((event) => {
      dragX.value = event.translationX;
      dragY.value = event.translationY;

      // Perform overlap/collision detection on the UI thread
      if (canvasWidth <= 0 || canvasHeight <= 0) return;

      const currentSlotIndex = slotOrder.value.indexOf(imageId);
      if (currentSlotIndex === -1) return;

      const currentSlot = slots[currentSlotIndex];
      if (!currentSlot) return;

      const currentBounds = getSlotPixelBounds(currentSlot, canvasWidth, canvasHeight);
      
      // Calculate the absolute center coordinates of the dragged element
      const dragCenterX = currentBounds.x + currentBounds.width / 2 + dragX.value;
      const dragCenterY = currentBounds.y + currentBounds.height / 2 + dragY.value;

      // Check if the center overlaps with any other slot boundary
      for (let j = 0; j < slots.length; j++) {
        if (j === currentSlotIndex) continue;

        const targetSlot = slots[j];
        if (!targetSlot) continue;

        const targetBounds = getSlotPixelBounds(targetSlot, canvasWidth, canvasHeight);

        // Overlap check
        const isOverlapping =
          dragCenterX >= targetBounds.x &&
          dragCenterX <= targetBounds.x + targetBounds.width &&
          dragCenterY >= targetBounds.y &&
          dragCenterY <= targetBounds.y + targetBounds.height;

        if (isOverlapping) {
          // Swap slot positions of currentSlotIndex and target slot j
          const newOrder = [...slotOrder.value];
          const temp = newOrder[currentSlotIndex];
          newOrder[currentSlotIndex] = newOrder[j];
          newOrder[j] = temp;

          // Adjust drag offsets to prevent UI jumping when target bounding box changes
          dragX.value = dragX.value + (currentBounds.x - targetBounds.x);
          dragY.value = dragY.value + (currentBounds.y - targetBounds.y);

          // Commit the new order to the UI thread shared value
          slotOrder.value = newOrder;
          break;
        }
      }
    })
    .onEnd(() => {
      // Reset active drag ID and animate the item translation back to 0
      activeDragId.value = null;
      dragX.value = withSpring(0, { damping: 15 });
      dragY.value = withSpring(0, { damping: 15 });

      // Synchronize the final order back to the React JS state
      runOnJS(onOrderChange)(slotOrder.value);
    })
    .onFinalize(() => {
      activeDragId.value = null;
    });

  /**
   * Generates Reanimated animated styles for this specific image instance
   * Leverages high-performance GPU transformations instead of layout-triggering left/top style updates
   */
  const animatedStyle = useAnimatedStyle(() => {
    const index = slotOrder.value.indexOf(imageId);
    if (index === -1 || canvasWidth <= 0 || canvasHeight <= 0) {
      return { display: 'none' };
    }

    const slot = slots[index];
    if (!slot) return {};

    const bounds = getSlotPixelBounds(slot, canvasWidth, canvasHeight);
    
    // Calculate the translation offset relative to the static baseBounds layout coordinates
    const targetTranslateX = bounds.x - baseBounds.x;
    const targetTranslateY = bounds.y - baseBounds.y;

    const isDragging = activeDragId.value === imageId;

    if (isDragging) {
      return {
        transform: [
          { translateX: targetTranslateX + dragX.value },
          { translateY: targetTranslateY + dragY.value },
          { scale: 1.04 },
        ],
        zIndex: 99,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 10,
      };
    } else {
      return {
        transform: [
          { translateX: withSpring(targetTranslateX, { damping: 18, stiffness: 120 }) },
          { translateY: withSpring(targetTranslateY, { damping: 18, stiffness: 120 }) },
          { scale: withSpring(1) },
        ],
        zIndex: 1,
      };
    }
  });

  return {
    panGesture,
    animatedStyle,
  };
};
