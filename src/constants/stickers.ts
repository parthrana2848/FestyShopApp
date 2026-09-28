/**
 * Reusable sticker registry configuration.
 * Defines the core set of premium local sticker assets, and includes type definitions 
 * and CDN placeholders to make the system architecture-ready for remote sticker packs, 
 * Giphy integration, and high-performance SVG/GIF rendering.
 */

export interface StickerAsset {
  id: string;
  uri: any; // Can be a local require() reference or a remote URL string
  type: 'png' | 'svg' | 'gif';
  name?: string;
}

export const STICKERS: StickerAsset[] = [
  {
    id: '1',
    uri: require('../assets/stickers/heart.png'),
    type: 'png',
    name: 'Heart',
  },
  {
    id: '2',
    uri: 'https://via.placeholder.com/150/FF4500/FFFFFF?text=Fire',
    type: 'png',
    name: 'Fire',
  },
  // Architecture-ready CDN/Giphy integration placeholders
  {
    id: '3',
    uri: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWdtcmQ1bnUzM211cjVhbzdhYTZzY3N6ZXk4ZHl6NjR3YWptMWJtZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3orif2UsQs04NEn3OM/giphy.gif',
    type: 'gif',
    name: 'Party',
  },
  {
    id: '4',
    uri: 'https://placeholder-cdn.com/stickers/cool.svg',
    type: 'svg',
    name: 'Cool',
  },
];
