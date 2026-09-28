import { StyleSheet } from 'react-native';
import { COLORS } from '../../../theme/colors';
import { SPACING } from '../../../theme/spacing';
import { FONT_SIZE } from '../../../theme/typography';
import { DIMENSIONS } from '../constants/videoCallTimeouts';

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: SPACING.xxxxl,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.overlayLight,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  controlButton: {
    width: DIMENSIONS.CONTROL_BUTTON_SIZE,
    height: DIMENSIONS.CONTROL_BUTTON_SIZE,
    borderRadius: DIMENSIONS.CONTROL_BUTTON_SIZE / 2,
    backgroundColor: COLORS.callControlBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonActive: {
    backgroundColor: COLORS.callControlActive,
  },
  endCallButton: {
    width: DIMENSIONS.CONTROL_BUTTON_SIZE_LARGE,
    height: DIMENSIONS.CONTROL_BUTTON_SIZE_LARGE,
    borderRadius: DIMENSIONS.CONTROL_BUTTON_SIZE_LARGE / 2,
    backgroundColor: COLORS.callRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlLabel: {
    color: COLORS.callText,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  controlWrapper: {
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: DIMENSIONS.CONTROL_ICON_SIZE,
    color: COLORS.callText,
  },
  durationText: {
    color: COLORS.callText,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
  },
});
