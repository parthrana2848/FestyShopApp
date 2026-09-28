export type StoryType = 'image' | 'video';

export type TextAnimationType =
  | 'none'
  | 'fade'
  | 'slideUp'
  | 'slideLeft'
  | 'bounce'
  | 'zoom'
  | 'pop'
  | 'pulse'
  | 'rotateIn';

export interface StoryAudio {
  uri: string;
  duration: number;
  filename: string;
}

export interface StoryTextLayer {
  id: string;
  text: string;
  color: string;
  fontFamily: string;
  fontSize: number;
  backgroundEnabled: boolean;
  backgroundColor: string;
  alignment: 'left' | 'center' | 'right';
  textAlign: 'left' | 'center' | 'right';
  animationType: TextAnimationType;
  translateX: number;
  translateY: number;
  scale: number;
  rotation: number;
  zIndex: number;
  preset?: string;
}
