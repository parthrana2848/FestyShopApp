import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  Dimensions,
  SafeAreaView,
  Pressable,
  Animated,
  PanResponder,
} from 'react-native';
import { UserStory } from '../types/story';
import { ColorMatrix } from 'react-native-color-matrix-image-filters';
import { FILTERS, FilterType } from '../constants/filters';
import { useStories } from '../hooks/useStories';
import { useStoryTimer } from '../hooks/useStoryTimer';
import { StoryProgressBar } from '../components/story/StoryProgressBar';
import { STORY_CONSTANTS } from '../utils/storyHelpers';

const { width, height } = Dimensions.get('window');

interface StoryScreenProps {
  visible: boolean;
  story: UserStory | null;
  onClose: () => void;
}

export const StoryScreen = ({ visible, story, onClose }: StoryScreenProps) => {
  const { stories } = useStories();
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (story && visible && stories.length > 0) {
      const idx = stories.findIndex(s => s.id === story.id);
      setCurrentIndex(idx !== -1 ? idx : 0);
      translateY.setValue(0);
    }
  }, [story, visible, stories]);

  const activeStory = stories[currentIndex] || story;

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const { progress } = useStoryTimer(
    STORY_CONSTANTS.STORY_DURATION,
    stories.length,
    currentIndex,
    handleNext,
    visible
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > STORY_CONSTANTS.SWIPE_THRESHOLD) {
          Animated.timing(translateY, {
            toValue: height,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onClose();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  if (!activeStory) return null;

  const activeFilterMatrix = (FILTERS.find(
    (f) => f.id === (activeStory.filter as FilterType)
  )?.matrix || FILTERS[0].matrix) as any;

  const animatedStyle = {
    transform: [{ translateY }],
    opacity: translateY.interpolate({
      inputRange: [0, height],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    }),
  };

  const timeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Animated.View style={[styles.container, animatedStyle]} {...panResponder.panHandlers}>
          <ColorMatrix matrix={activeFilterMatrix} style={styles.imageContainer}>
            <Image
              source={{ uri: activeStory.uri }}
              style={styles.fullImage}
              resizeMode="cover"
            />
          </ColorMatrix>

          <View style={styles.touchAreaContainer}>
            <Pressable style={styles.touchArea} onPress={handlePrev} />
            <Pressable style={styles.touchArea} onPress={handleNext} />
          </View>

          <SafeAreaView style={styles.overlay} pointerEvents="box-none">
            <View style={styles.header}>
              <View style={styles.userInfo}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {activeStory.username[0].toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.username}>{activeStory.username}</Text>
                  <Text style={styles.timestamp}>{timeAgo(activeStory.createdAt)}</Text>
                </View>
              </View>

              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.progressContainer}>
              <StoryProgressBar 
                currentIndex={currentIndex} 
                totalStories={stories.length || 1} 
                progress={progress} 
              />
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  imageContainer: {
    flex: 1,
  },
  fullImage: {
    width: width,
    height: height,
  },
  touchAreaContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 1,
  },
  touchArea: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  progressContainer: {
    width: '100%',
    paddingBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  username: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  timestamp: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  closeButton: {
    padding: 10,
  },
  closeText: {
    color: 'white',
    fontSize: 24,
  },
});
