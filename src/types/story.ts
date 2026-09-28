import type { StoryAudio, StoryTextLayer, StoryType, TextAnimationType } from './story.types';
import type { GifStickerData } from './gif.types';
import type { LinkStickerData } from './link.types';

export type { StoryAudio, StoryTextLayer, StoryType, TextAnimationType };

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface PollSticker {
  id: string;
  type: 'poll';
  question: string;
  options: PollOption[];
  selectedOptionId?: string;
  position: {
    x: number;
    y: number;
  };
  scale: number;
  rotation: number;
  createdAt: number;
}

export type StorySticker =
  | StoryTextLayer
  | GifStickerData
  | LinkStickerData
  | PollSticker;

export interface StoryStickerItem {
  id: string;
  type: 'sticker';

  uri: any; // Can be a local require number or remote URL string

  x: number;
  y: number;

  scale: number;
  rotation: number;

  zIndex?: number;

  width?: number;
  height?: number;

  stickerType?: 'png' | 'svg' | 'gif';
}

export type StoryOverlayItem =
  | StoryTextItem
  | PollSticker
  | StoryStickerItem;

export interface StoryImage {
  uri: string;
  width: number;
  height: number;
}

export interface UserStory {
  id: string;
  uri: string;
  width: number;
  height: number;
  createdAt: string;
  filter?: string;
  username: string;
  type?: StoryType;
  textLayers?: StoryTextLayer[];
  gifStickers?: GifStickerData[];
  linkStickers?: LinkStickerData[];
  pollStickers?: PollSticker[];
  stickerItems?: StoryStickerItem[]; // Extended to persist custom stickers
  audio?: StoryAudio | null;
  duration?: number;
  location?: {
    latitude: number;
    longitude: number;
    placeName: string;
  } | null;
}

export type StoryTextItem = StoryTextLayer;
export type StoryTextLayerType = StoryTextLayer;
export type StoryAudioType = StoryAudio;
