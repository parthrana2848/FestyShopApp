import { StyleSheet } from 'react-native';
import { COLORS } from '../../../theme/colors';
import { SPACING } from '../../../theme/spacing';
import { FONT_SIZE } from '../../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.callBackground,
  },
  reconnectingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  reconnectingText: {
    color: COLORS.callText,
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    marginTop: SPACING.lg,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    paddingHorizontal: SPACING.xxl,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  errorMessage: {
    color: COLORS.callTextSecondary,
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
  },
  endedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.callBackground,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  endedText: {
    color: COLORS.callText,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '600',
  },
});
