import { StyleSheet } from 'react-native';
import { COLORS } from '../../../theme/colors';
import { SPACING } from '../../../theme/spacing';
import { FONT_SIZE } from '../../../theme/typography';
import { DIMENSIONS } from '../constants/videoCallTimeouts';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.callBackground,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: DIMENSIONS.AVATAR_SIZE_LARGE,
    height: DIMENSIONS.AVATAR_SIZE_LARGE,
    borderRadius: DIMENSIONS.AVATAR_SIZE_LARGE / 2,
    backgroundColor: COLORS.callSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  avatarText: {
    color: COLORS.callText,
    fontSize: FONT_SIZE.hero,
    fontWeight: '600',
  },
  callerName: {
    color: COLORS.callText,
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  callLabel: {
    color: COLORS.callTextSecondary,
    fontSize: FONT_SIZE.lg,
    textAlign: 'center',
  },
  bottomSection: {
    paddingBottom: SPACING.giant,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionWrapper: {
    alignItems: 'center',
  },
  declineButton: {
    width: DIMENSIONS.CONTROL_BUTTON_SIZE_LARGE,
    height: DIMENSIONS.CONTROL_BUTTON_SIZE_LARGE,
    borderRadius: DIMENSIONS.CONTROL_BUTTON_SIZE_LARGE / 2,
    backgroundColor: COLORS.callRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    width: DIMENSIONS.CONTROL_BUTTON_SIZE_LARGE,
    height: DIMENSIONS.CONTROL_BUTTON_SIZE_LARGE,
    borderRadius: DIMENSIONS.CONTROL_BUTTON_SIZE_LARGE / 2,
    backgroundColor: COLORS.callGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 32,
    color: COLORS.callText,
  },
  actionLabel: {
    color: COLORS.callText,
    fontSize: FONT_SIZE.md,
    marginTop: SPACING.sm,
  },
});
