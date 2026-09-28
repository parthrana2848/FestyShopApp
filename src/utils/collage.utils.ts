import { CollageLayout, CollageSlot } from '../types/collage.types';
import { COLLAGE_LAYOUTS } from '../components/collage/CollageLayouts';

/**
 * Gets the list of predefined layouts available for a specific number of images
 * Defaults to a full-screen single-image layout if count is out of bounds
 */
export const getLayoutsForCount = (count: number): CollageLayout[] => {
  const safeCount = Math.min(Math.max(count, 1), 5);
  return COLLAGE_LAYOUTS[safeCount] || COLLAGE_LAYOUTS[1];
};

export interface SlotPixelBounds {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Converts a percentage-based CollageSlot into absolute pixel bounds
 * based on the current measured Canvas width and height
 */
export const getSlotPixelBounds = (
  slot: CollageSlot,
  canvasWidth: number,
  canvasHeight: number
): SlotPixelBounds => {
  'worklet';
  return {
    id: slot.id,
    x: (slot.x / 100) * canvasWidth,
    y: (slot.y / 100) * canvasHeight,
    width: (slot.width / 100) * canvasWidth,
    height: (slot.height / 100) * canvasHeight,
  };
};
