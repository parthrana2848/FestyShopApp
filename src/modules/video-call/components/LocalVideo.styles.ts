import { StyleSheet } from 'react-native';
import { COLORS } from '../../../theme/colors';
import { BORDER_RADIUS } from '../../../theme/borderRadius';
import { SHADOWS } from '../../../theme/shadows';
import { DIMENSIONS } from '../constants/videoCallTimeouts';

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: DIMENSIONS.LOCAL_VIDEO_MARGIN + DIMENSIONS.STATUS_BAR_HEIGHT,
    right: DIMENSIONS.LOCAL_VIDEO_MARGIN,
    width: DIMENSIONS.LOCAL_VIDEO_WIDTH,
    height: DIMENSIONS.LOCAL_VIDEO_HEIGHT,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    zIndex: 10,
    ...SHADOWS.lg,
  },
  stream: {
    width: DIMENSIONS.LOCAL_VIDEO_WIDTH,
    height: DIMENSIONS.LOCAL_VIDEO_HEIGHT,
  },
  cameraOffContainer: {
    width: DIMENSIONS.LOCAL_VIDEO_WIDTH,
    height: DIMENSIONS.LOCAL_VIDEO_HEIGHT,
    backgroundColor: COLORS.callSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  cameraOffText: {
    color: COLORS.callTextSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
});
