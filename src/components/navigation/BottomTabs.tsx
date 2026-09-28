import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBar } from '@react-navigation/bottom-tabs';

export type BottomTabRef = {
  show: () => void;
  hide: () => void;
};

const TAB_BAR_HEIGHT = 130;
const ANIMATION_DURATION = 250;

const AnimatedBottomTabBar = forwardRef<
  BottomTabRef,
  React.ComponentProps<typeof BottomTabBar>
>((props, ref) => {
  const insets = useSafeAreaInsets();
  const EXTRA = 20; // extra offset for shadow/spacing
  const containerHeight = TAB_BAR_HEIGHT + (insets.bottom || 0) + EXTRA;
  const translateY = useRef(
    new Animated.Value(0),
  ).current;

  const isHidden = useRef(false);

  const hide = () => {
    if (isHidden.current) {
      return;
    }

    isHidden.current = true;

    Animated.timing(translateY, {
      toValue: containerHeight,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  };

  const show = () => {
    if (!isHidden.current) {
      return;
    }

    isHidden.current = false;

    Animated.timing(translateY, {
      toValue: 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  };

  useImperativeHandle(ref, () => ({
    show,
    hide,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
        },
      ]}>
      <BottomTabBar {...props} style={[props.style, { height: TAB_BAR_HEIGHT, backgroundColor: 'transparent' }]} />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
});

export default AnimatedBottomTabBar;