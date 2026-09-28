import { TextStyle } from 'react-native';

export const FONT_FAMILY = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
} as const;

export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  title: 28,
  largeTitle: 34,
  hero: 48,
} as const;

export const LINE_HEIGHT = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 22,
  xl: 24,
  xxl: 28,
  xxxl: 32,
  title: 34,
  largeTitle: 41,
  hero: 58,
} as const;

export const TYPOGRAPHY: Record<string, TextStyle> = {
  hero: {
    fontSize: FONT_SIZE.hero,
    lineHeight: LINE_HEIGHT.hero,
    fontWeight: '700',
  },
  largeTitle: {
    fontSize: FONT_SIZE.largeTitle,
    lineHeight: LINE_HEIGHT.largeTitle,
    fontWeight: '700',
  },
  title: {
    fontSize: FONT_SIZE.title,
    lineHeight: LINE_HEIGHT.title,
    fontWeight: '600',
  },
  heading: {
    fontSize: FONT_SIZE.xxl,
    lineHeight: LINE_HEIGHT.xxl,
    fontWeight: '600',
  },
  subheading: {
    fontSize: FONT_SIZE.xl,
    lineHeight: LINE_HEIGHT.xl,
    fontWeight: '500',
  },
  body: {
    fontSize: FONT_SIZE.lg,
    lineHeight: LINE_HEIGHT.lg,
    fontWeight: '400',
  },
  bodyMedium: {
    fontSize: FONT_SIZE.md,
    lineHeight: LINE_HEIGHT.md,
    fontWeight: '400',
  },
  caption: {
    fontSize: FONT_SIZE.sm,
    lineHeight: LINE_HEIGHT.sm,
    fontWeight: '400',
  },
  captionSmall: {
    fontSize: FONT_SIZE.xs,
    lineHeight: LINE_HEIGHT.xs,
    fontWeight: '400',
  },
  button: {
    fontSize: FONT_SIZE.lg,
    lineHeight: LINE_HEIGHT.lg,
    fontWeight: '600',
  },
  buttonSmall: {
    fontSize: FONT_SIZE.md,
    lineHeight: LINE_HEIGHT.md,
    fontWeight: '600',
  },
} as const;
