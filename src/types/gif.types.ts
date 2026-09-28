/**
 * NormalizedGif represents the structure of a normalized GIF returned by our service.
 */
export interface NormalizedGif {
  id: string;
  previewUrl: string;
  stickerUrl: string;
  title?: string;
}

/**
 * GifStickerData represents the absolute transform, ordering, and source details
 * of an active GIF sticker layered on top of the Story Canvas.
 */
export interface GifStickerData {
  id: string;
  uri: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}
