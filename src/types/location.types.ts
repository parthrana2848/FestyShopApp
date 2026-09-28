/**
 * Coordinates defines raw geographic latitude and longitude values.
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * StoryLocation represents the high-level location metadata stored inside a Story.
 */
export interface StoryLocation {
  latitude: number;
  longitude: number;
  placeName: string;
}

/**
 * StickerTransform represents the Reanimated shared values representing
 * translation, scale, and rotation of a visual sticker overlay.
 */
export interface StickerTransform {
  translateX: number;
  translateY: number;
  scale: number;
  rotation: number;
}

/**
 * LocationSearchResult represents an autocompleted place search result.
 */
export interface LocationSearchResult {
  id: string;
  placeName: string;
  latitude: number;
  longitude: number;
}

/**
 * StickerStyle defines color, background, roundedness, and glassmorphic
 * properties for a specific premium Instagram sticker styling theme.
 */
export interface StickerStyle {
  id: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  paddingHorizontal: number;
  paddingVertical: number;
  borderWidth?: number;
  borderColor?: string;
  shadow?: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}
