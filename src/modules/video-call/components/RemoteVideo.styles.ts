import { StyleSheet } from 'react-native';
import { COLORS } from '../../../theme/colors';
import { SPACING } from '../../../theme/spacing';
import { FONT_SIZE } from '../../../theme/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.callBackground,
  },
  stream: {
    flex: 1,
  },
  nameOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: COLORS.callBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.callSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  avatarText: {
    color: COLORS.callText,
    fontSize: FONT_SIZE.hero,
    fontWeight: '600',
  },
  nameText: {
    color: COLORS.callText,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  statusText: {
    color: COLORS.callTextSecondary,
    fontSize: FONT_SIZE.md,
  },
});
