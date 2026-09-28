import type { TextAnimationType } from '../types/story.types';

export interface TextAnimationDefinition {
  id: TextAnimationType;
  label: string;
  icon: string;
}

export const TEXT_ANIMATIONS: TextAnimationDefinition[] = [
  { id: 'none', label: 'None', icon: '—' },
  { id: 'fade', label: 'Fade', icon: '✨' },
  { id: 'slideUp', label: 'Slide Up', icon: '⬆️' },
  { id: 'slideLeft', label: 'Slide Left', icon: '⬅️' },
  { id: 'bounce', label: 'Bounce', icon: '🏀' },
  { id: 'zoom', label: 'Zoom', icon: '🔍' },
  { id: 'pop', label: 'Pop', icon: '💥' },
  { id: 'pulse', label: 'Pulse', icon: '💓' },
  { id: 'rotateIn', label: 'Rotate', icon: '↪️' },
];
