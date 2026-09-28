import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  SafeAreaView,
  Pressable,
  Animated,
  PanResponder,
  NativeModules,
} from 'react-native';

import { UserStory } from '../types/story';
import { FILTERS, FilterType } from '../constants/filters';
import { useStories } from '../hooks/useStories';
import { useStoryTimer } from '../hooks/useStoryTimer';
import { StoryProgressBar } from './story/StoryProgressBar';
import { STORY_CONSTANTS } from '../utils/storyHelpers';
import ViewShot, { ViewShotRef } from 'react-native-view-shot';
import { downloadStoryImage } from '../utils/storyDownloader';
import { StoryPreview } from './story/StoryPreview';
import { openSafeUrl } from '../services/link/link.service';
import { StoryTextOverlay } from './story/StoryTextOverlay';
import { PollSticker } from './stickers/PollSticker';
import { voteOnPoll } from '../utils/pollUtils';

const { width, height } = Dimensions.get('window');

interface StoryModalProps {
  visible: boolean;
  story: UserStory | null;
  onClose: () => void;
}

export const StoryModal = ({
  visible,
  story,
  onClose,
}: StoryModalProps) => {
  const { stories, updateStory } = useStories();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastStoryId, setLastStoryId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const translateY = useRef(new Animated.Value(0)).current;
  const storyRef = useRef<ViewShotRef>(null);

  /**
   * Sync active story index
   */
  if (visible && story && story.id !== lastStoryId) {
    setLastStoryId(story.id);

    const idx = stories.findIndex(s => s.id === story.id);

    if (idx !== -1) {
      setCurrentIndex(idx);
    }
  }

  const activeStory = stories[currentIndex] || story;

  /**
   * Download story
   */
  const onDownloadPress = useCallback(async () => {
    // This ViewShot ref now contains the media AND all overlays
    await downloadStoryImage(storyRef);
  }, []);

  /**
   * Reset swipe animation
   */
  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
    }
  }, [visible]);

  /**
   * Audio playback
   */
  useEffect(() => {
    const { AudioPicker } = NativeModules;

    if (visible && activeStory?.audio?.uri) {
      AudioPicker?.playAudio(activeStory.audio.uri);
    } else {
      AudioPicker?.stopAudio();
    }

    return () => {
      AudioPicker?.stopAudio();
    };
  }, [visible, activeStory?.audio?.uri]);

  /**
   * Pause / Resume audio
   */
  useEffect(() => {
    const { AudioPicker } = NativeModules;

    if (isPaused) {
      AudioPicker?.pauseAudio();
    } else if (visible && activeStory?.audio?.uri) {
      AudioPicker?.resumeAudio();
    }
  }, [isPaused, visible, activeStory?.audio?.uri]);

  /**
   * Next story
   */
  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  /**
   * Previous story
   */
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  /**
   * Handle poll vote
   */
  const handleVote = useCallback(async (pollId: string, optionId: string) => {
    if (!activeStory || !activeStory.pollStickers) return;

    // Briefly pause the story timer to allow the user to see the animated results
    setIsPaused(true);

    const pollIndex = activeStory.pollStickers.findIndex(p => p.id === pollId);
    if (pollIndex === -1) {
      setIsPaused(false);
      return;
    }

    const updatedPoll = voteOnPoll(activeStory.pollStickers[pollIndex], optionId);

    const updatedPolls = [...activeStory.pollStickers];
    updatedPolls[pollIndex] = updatedPoll;

    const updatedStory = {
      ...activeStory,
      pollStickers: updatedPolls,
    };

    await updateStory(updatedStory);

    // Resume the timer after results are shown
    setTimeout(() => {
      setIsPaused(false);
    }, 1500);
  }, [activeStory, updateStory]);

  /**
   * Story timer
   */
  const { progress } = useStoryTimer(
    STORY_CONSTANTS.STORY_DURATION,
    stories.length,
    currentIndex,
    handleNext,
    visible,
    isPaused,
  );

  /**
   * Swipe down gesture
   */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,

      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          gestureState.dy > 10 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        );
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
    }),
  ).current;

  /**
   * Pause story while holding
   */
  const handlePressIn = useCallback(() => {
    setIsPaused(true);
  }, []);

  /**
   * Resume story
   */
  const handlePressOut = useCallback(() => {
    setIsPaused(false);
  }, []);

  /**
   * Open link
   */
  const handleLinkPress = async (url: string) => {
    try {
      console.log('Open link:', url);
      setIsPaused(true);

      await openSafeUrl(url);

      setTimeout(() => {
        setIsPaused(false);
      }, 300);
    } catch (error) {
      console.error('Failed to open link:', error);

      Alert.alert(
        'Cannot open link',
        (error as Error).message || 'Please try another link.',
      );
    }
  };

  if (!activeStory) {
    return null;
  }

  const activeFilterMatrix =
    (FILTERS.find(
      f => f.id === (activeStory.filter as FilterType),
    )?.matrix || FILTERS[0].matrix) as any;

  /**
   * Swipe animation
   */
  const animatedStyle = {
    transform: [{ translateY }],
    opacity: translateY.interpolate({
      inputRange: [0, height],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    }),
  };

  /**
   * Time formatter
   */
  const timeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);

    const diffInSeconds = Math.floor(
      (now.getTime() - past.getTime()) / 1000,
    );

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m`;
    }

    if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h`;
    }

    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Animated.View
          style={[styles.container, animatedStyle]}
          {...panResponder.panHandlers}
        >
          {/* LAYER 1: STATIC VISUAL CONTENT (Wrapped in ViewShot for downloading) */}
          <ViewShot
            ref={storyRef}
            options={{
              format: 'jpg',
              quality: 1,
            }}
            style={styles.imageContainer}
          >
            {/* The root view inside ViewShot must be full screen and manage layout absolute layout */}
            <View style={styles.captureContainer}>
              {/* Media Preview (Video/Image) */}
              <StoryPreview
                story={activeStory}
                filterMatrix={activeFilterMatrix}
                stickers={activeStory.stickerItems || []}
              />

              {/* Text Layers & GIFs (No duplication needed) */}
              <StoryTextOverlay
                layers={activeStory.textLayers || []}
                gifStickers={activeStory.gifStickers || []}
              />

              {/* POLL & LINK STICKERS FOR DOWNLOAD CAPTURE (Non-interactive) */}
              <View
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              >
                {/* POLL STICKERS - Non-interactive for capture */}
                {activeStory.pollStickers?.map(sticker => (
                  <PollSticker
                    key={`poll-capture-${sticker.id}`}
                    sticker={sticker}
                    editable={false}
                  />
                ))}

                {/* LINK STICKERS - Non-interactive for capture */}
                {activeStory.linkStickers?.map(sticker => (
                  <View
                    key={`link-capture-${sticker.id}`}
                    style={[
                      styles.linkOverlay,
                      {
                        left: sticker.x,
                        top: sticker.y,
                        transform: [
                          { scale: sticker.scale },
                          { rotate: `${sticker.rotation}rad` },
                        ],
                      },
                    ]}
                  >
                    <View style={styles.linkPill}>
                      <Text
                        style={styles.linkText}
                        numberOfLines={1}
                      >
                        {sticker.title}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ViewShot>

          {/* LAYER 2: NAVIGATION TAPS BACKDROP (Outside ViewShot, below interactive layers) */}
          <View
            style={styles.touchAreaContainer}
            pointerEvents="box-none"
          >
            {/* LEFT AREA */}
            <Pressable
              style={styles.touchArea}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handlePrev}
            />

            {/* RIGHT AREA */}
            <Pressable
              style={styles.touchArea}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handleNext}
            />
          </View>

          {/* LAYER 3: HEADER & METADATA OVERLAY */}
          <SafeAreaView
            style={styles.overlay}
            pointerEvents="box-none"
          >
            <View style={styles.header}>
              <View style={styles.userInfo}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {activeStory.username[0].toUpperCase()}
                  </Text>
                </View>

                <View>
                  <Text style={styles.username}>
                    {activeStory.username}
                  </Text>

                  {activeStory.location && (
                    <Text
                      style={styles.locationSubtitle}
                      numberOfLines={1}
                    >
                      📍{' '}
                      {
                        activeStory.location.placeName.split(',')[0]
                      }
                    </Text>
                  )}

                  <Text style={styles.timestamp}>
                    {timeAgo(activeStory.createdAt)}
                  </Text>
                </View>
              </View>

              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={styles.downloadButton}
                  activeOpacity={0.8}
                  onPress={onDownloadPress}
                >
                  <Text style={styles.downloadText}>
                    Download
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <StoryProgressBar
                currentIndex={currentIndex}
                totalStories={stories.length || 1}
                progress={progress}
              />
            </View>
          </SafeAreaView>

          {/* LAYER 4: INTERACTIVE POLLS & LINKS (Outside ViewShot for proper interactivity) */}
          <View
            style={StyleSheet.absoluteFill}
            pointerEvents="box-none"
          >
            {/* INTERACTIVE POLL STICKERS */}
            {activeStory.pollStickers?.map(sticker => (
              <PollSticker
                key={`poll-${sticker.id}`}
                sticker={sticker}
                editable={false}
                onVote={(optionId) => handleVote(sticker.id, optionId)}
              />
            ))}

            {/* INTERACTIVE LINK STICKERS */}
            {activeStory.linkStickers?.map(sticker => (
              <Pressable
                key={sticker.id}
                pointerEvents="auto"
                hitSlop={{
                  top: 20,
                  bottom: 20,
                  left: 20,
                  right: 20,
                }}
                style={[
                  styles.linkOverlay,
                  {
                    left: sticker.x,
                    top: sticker.y,
                    transform: [
                      { scale: sticker.scale },
                      { rotate: `${sticker.rotation}rad` },
                    ],
                  },
                ]}
                onPress={() => handleLinkPress(sticker.url)}
              >
                <View style={styles.linkPill}>
                  <Text
                    style={styles.linkText}
                    numberOfLines={1}
                  >
                    {sticker.title}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  container: {
    flex: 1,
    backgroundColor: 'black',
  },

  imageContainer: {
    flex: 1,
  },

  captureContainer: {
    flex: 1,
  },

  fullImage: {
    width: width,
    height: height,
  },

  /**
   * Story navigation overlay
   */
  touchAreaContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 1,
  },

  /**
   * Left & right tap areas
   */
  touchArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  /**
   * Header overlay
   */
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
    // paddingTop: 10,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  downloadButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    marginRight: 10,
  },

  downloadText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },

  progressContainer: {
    width: '100%',
    // paddingBottom: 20,
  },

  /**
   * Top layer positioning context
   */
  linkOverlay: {
    position: 'absolute',
    zIndex: 99999,
    elevation: 99999,
  },

  linkPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 100,
    maxWidth: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },

  linkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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

  locationSubtitle: {
    color: '#0095F6',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
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