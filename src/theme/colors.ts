export const COLORS = {
  // Primary
  primary: '#007AFF',
  primaryLight: '#4DA3FF',
  primaryDark: '#0055B3',

  // Secondary
  secondary: '#5856D6',
  secondaryLight: '#7A79E0',
  secondaryDark: '#3D3BC2',

  // Success / Error / Warning
  success: '#34C759',
  successLight: '#A8E6B8',
  error: '#FF3B30',
  errorLight: '#FF6B63',
  warning: '#FF9500',
  warningLight: '#FFBF5E',

  // Grayscale
  white: '#FFFFFF',
  black: '#000000',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E5E5EA',
  separator: '#C6C6C8',

  // Text
  textPrimary: '#000000',
  textSecondary: '#3C3C43',
  textTertiary: '#8E8E93',
  textInverse: '#FFFFFF',
  textDisabled: '#AEAEB2',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',

  // Video Call Specific
  callGreen: '#34C759',
  callRed: '#FF3B30',
  callBackground: '#1C1C1E',
  callSurface: '#2C2C2E',
  callControlBackground: 'rgba(255, 255, 255, 0.15)',
  callControlActive: 'rgba(255, 255, 255, 0.3)',
  callControlDisabled: 'rgba(255, 255, 255, 0.08)',
  callText: '#FFFFFF',
  callTextSecondary: 'rgba(255, 255, 255, 0.6)',
  callPulse: 'rgba(52, 199, 89, 0.4)',

  // Transparent
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof COLORS;
