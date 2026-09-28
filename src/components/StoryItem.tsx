import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { UserStory } from '../types/story';

import { ColorMatrix } from 'react-native-color-matrix-image-filters';
import { FILTERS, FilterType } from '../constants/filters';

interface StoryItemProps {
  story: UserStory;
  onPress: () => void;
  isVisible?: boolean;
}

export const StoryItem = ({ story, onPress, isVisible = true }: StoryItemProps) => {
  const activeFilterMatrix = (FILTERS.find(
    (f) => f.id === (story.filter as FilterType)
  )?.matrix || FILTERS[0].matrix) as any;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.avatarContainer, styles.activeBorder]}>
        <ColorMatrix matrix={activeFilterMatrix} style={styles.avatarWrapper}>
          <Image source={{ uri: story.uri }} style={styles.avatar} />
        </ColorMatrix>
      </View>
      <Text numberOfLines={1} style={styles.username}>
        {story.username}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 80,
  },
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 2,
    backgroundColor: '#ddd',
  },
  avatarWrapper: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
  },
  activeBorder: {
    backgroundColor: '#e1306c', // Instagram Gradient-like pink/orange
  },
  avatar: {
    aspectRatio: 1,
    borderRadius: 32,
    overflow: 'hidden',
    // width: '100%',
    // height: '100%',
  },
  username: {
    fontSize: 12,
    marginTop: 4,
    color: '#333',
    textAlign: 'center',
    width: '100%',
  },
});
