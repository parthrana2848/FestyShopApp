import React, { useEffect } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { PollOption as PollOptionType } from '../../types/story';

interface PollOptionProps {
  option: PollOptionType;
  percentage: number;
  selected: boolean;
  disabled: boolean;
  showResults: boolean;
  onPress: () => void;
}

/**
 * PollOption renders an individual selectable option within a poll sticker.
 * It handles the animation of the percentage fill and tap feedback.
 */
export const PollOption: React.FC<PollOptionProps> = ({
  option,
  percentage,
  selected,
  disabled,
  showResults,
  onPress,
}) => {
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  // Animate the fill width when results are shown
  useEffect(() => {
    if (showResults) {
      progress.value = withSpring(percentage / 100, { 
        damping: 15,
        stiffness: 100
      });
    } else {
      progress.value = withTiming(0);
    }
  }, [showResults, percentage, progress]);

  const animatedFillStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withTiming(0.95, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1);
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={styles.pressable}
    >
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        {showResults && (
          <Animated.View 
            style={[
              styles.fill, 
              animatedFillStyle, 
              selected && styles.selectedFill
            ]} 
          />
        )}
        <View style={styles.content}>
          <Text
            style={[
              styles.text,
              showResults && styles.resultText,
              selected && styles.selectedText,
            ]}
            numberOfLines={1}
          >
            {selected && <Text style={styles.checkmark}>✓ </Text>}
            {option.text}
          </Text>
          {showResults && (
            <Text style={[styles.percentage, selected && styles.selectedPercentage]}>
              {percentage}%
            </Text>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    marginHorizontal: 4,
  },
  container: {
    height: 48,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.39)',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  selectedFill: {
    backgroundColor: 'rgba(0,149,246,0.25)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    zIndex: 1,
  },
  text: {
    color: 'black',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  resultText: {
    flex: 1,
    textAlign: 'left',
  },
  checkmark: {
    fontSize: 16,
    color: '#0095F6',
    fontWeight: '900',
  },
  percentage: {
    color: 'black',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
  selectedText: {
    color: '#0095F6',
  },
  selectedPercentage: {
    color: '#0095F6',
    fontWeight: '900',
  },
});
