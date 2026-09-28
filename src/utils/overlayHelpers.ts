import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Calculates the next available z-index for layering overlays dynamically.
 * Adds a configurable base offset to keep it layered nicely.
 * 
 * @param itemsCount Current count of items in editor
 * @param baseOffset Base zIndex starting offset
 */
export const getNextZIndex = (itemsCount: number, baseOffset: number = 100): number => {
  return baseOffset + itemsCount + 1;
};

/**
 * Returns the layout coordinates (x, y) required to center an overlay of a specific size on the canvas screen.
 * 
 * @param overlayWidth Width of overlay component
 * @param overlayHeight Height of overlay component
 */
export const centerOverlayPosition = (overlayWidth: number = 120, overlayHeight: number = 120) => {
  return {
    x: screenWidth / 2 - overlayWidth / 2,
    y: screenHeight / 2 - overlayHeight / 2,
  };
};

/**
 * Normalizes a rotation angle in radians to fit nicely within the standard [0, 2pi] circle range.
 * 
 * @param rad Rotation angle in radians
 */
export const normalizeRotation = (rad: number): number => {
  const twoPi = 2 * Math.PI;
  return ((rad % twoPi) + twoPi) % twoPi;
};

/**
 * Standard transform constructor returning formatting for Reanimated style transformations.
 * 
 * @param x Translate X position coordinate
 * @param y Translate Y position coordinate
 * @param scale Scaling factor
 * @param rotationRad Angle of rotation in radians
 */
export const buildOverlayTransform = (x: number, y: number, scale: number, rotationRad: number) => {
  return [
    { translateX: x },
    { translateY: y },
    { scale },
    { rotate: `${rotationRad}rad` },
  ];
};
