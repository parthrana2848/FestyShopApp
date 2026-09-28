export interface FontPreset {
  id: string;
  label: string;
  fontFamily: string;
  fontWeight: string;
  fontStyle: 'normal' | 'italic';
  textShadow?: boolean;
  letterSpacing?: number;
}

export const FONT_PRESETS: FontPreset[] = [
  {
    id: 'classic',
    label: 'Classic',
    fontFamily: 'System',
    fontWeight: 'normal',
    fontStyle: 'normal',
  },
  {
    id: 'strong',
    label: 'Strong',
    fontFamily: 'System',
    fontWeight: '900',
    fontStyle: 'normal',
    letterSpacing: -1,
  },
  {
    id: 'meme',
    label: 'Meme',
    fontFamily: 'System',
    fontWeight: '900',
    fontStyle: 'normal',
    textShadow: true,
  },
  {
    id: 'elegant',
    label: 'Elegant',
    fontFamily: 'System',
    fontWeight: '300',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  {
    id: 'typewriter',
    label: 'Typewriter',
    fontFamily: 'Courier',
    fontWeight: '500',
    fontStyle: 'normal',
  },
];
