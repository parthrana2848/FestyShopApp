import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface CaptureButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const CaptureButton = ({ onPress, disabled = false }: CaptureButtonProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1) }],
  }));

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.7}
      onPress={onPress}
      disabled={disabled}
      style={styles.container}
    >
      <Animated.View style={[styles.outerCircle, animatedStyle]} />
      <View style={styles.innerCircle} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    zIndex: 10,
  },
  outerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    position: 'absolute',
    top: 11,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    height: '72%',
    width: '72%',
    borderRadius: 36,
    backgroundColor: 'white',
  },
});
