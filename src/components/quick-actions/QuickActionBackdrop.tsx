import React, { memo } from 'react';
import { Animated, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { BACKDROP_OPACITY, FAB_Z_INDEX, FAB_ELEVATION } from '../../constants/quick-actions/quickActions.constants';
import type { QuickActionBackdropProps } from './quickActions.types';

const AnimatedView = Animated.View;

function QuickActionBackdrop({ visible, onRequestClose, backdropAnim }: QuickActionBackdropProps) {
  // If a backdropAnim is provided by the hook, use it directly; otherwise animate internally
  const internalOpacity = React.useRef(new Animated.Value(0)).current;
  const opacity = backdropAnim ?? internalOpacity;

  React.useEffect(() => {
    if (backdropAnim) return; // host/hook manages the animation
    Animated.timing(internalOpacity, {
      toValue: visible ? BACKDROP_OPACITY : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, internalOpacity, backdropAnim]);

  if (!visible && !backdropAnim) return null;

  return (
    <TouchableWithoutFeedback onPress={onRequestClose} accessibilityRole="button" accessibilityLabel="Close quick actions">
      <AnimatedView style={[styles.backdrop, { opacity }]} />
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000',
    // Keep the backdrop below menu and FAB
    zIndex: FAB_Z_INDEX - 2,
    elevation: Math.max(0, FAB_ELEVATION - 2),
  },
});

export default memo(QuickActionBackdrop);
