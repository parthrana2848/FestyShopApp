import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface StoryProgressBarProps {
  currentIndex: number;
  totalStories: number;
  progress: Animated.Value;
}

export const StoryProgressBar = React.memo(({ currentIndex, totalStories, progress }: StoryProgressBarProps) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalStories }).map((_, index) => {
        const isActive = index === currentIndex;
        const isPast = index < currentIndex;

        return (
          <View key={index} style={styles.track}>
            {isPast ? (
              <View style={[styles.fill, { width: '100%' }]} />
            ) : isActive ? (
              <Animated.View
                style={[
                  styles.fill,
                  {
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 4,
    width: '100%',
  },
  track: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
});
