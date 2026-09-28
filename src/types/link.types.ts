/**
 * LinkStickerData represents a link sticker layered on top of the Story Canvas.
 * Follows the same transform pattern as GIF stickers for consistency.
 */
export interface LinkStickerData {
  id: string;
  url: string;
  title: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

/**
 * LinkValidationResult provides validation feedback.
 */
export interface LinkValidationResult {
  isValid: boolean;
  error?: string;
}
