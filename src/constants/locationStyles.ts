import { StickerStyle } from '../types/location.types';

/**
 * LOCATION_STICKER_STYLES lists the 4 modern Instagram-style styling themes.
 * When the user taps the location sticker on the editor canvas, the style cycles
 * through these configurations sequentially.
 */
export const LOCATION_STICKER_STYLES: StickerStyle[] = [
  // 1. Classic Translucent White (Sleek light overlay with primary blue text)
  {
    id: 'classic_translucent',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    textColor: '#0095F6',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadow: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 4,
    },
  },
  // 2. Bold Accent Sunset (High-end warm Instagram-red theme with solid white text)
  {
    id: 'instagram_sunset',
    backgroundColor: '#E1306C',
    textColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadow: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 5,
    },
  },
  // 3. Minimalist Dark Mode (Elegant dark translucent card with white text)
  {
    id: 'minimal_dark',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    textColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadow: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 4,
    },
  },
  // 4. White Glassmorphism (Glass-like background, semi-transparent white borders)
  {
    id: 'glassmorphism_white',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    textColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    shadow: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
  },
];
