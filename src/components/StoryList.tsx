import React, { useState, useRef } from 'react';
import { FlatList, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { UserStory } from '../types/story';
import { CreateStoryButton } from './CreateStoryButton';
import { StoryItem } from './StoryItem';
import { StoryModal } from './StoryModal';
import { useStories } from '../hooks/useStories';

export const StoryList = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { stories, isLoading } = useStories();
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);

  const handleCreateStory = () => {
    navigation.navigate('Camera');
  };

  // Track viewable story IDs to optimize offscreen loading/playing
  const [viewableStoryIds, setViewableStoryIds] = useState<string[]>([]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    const ids = viewableItems.map((v: any) => v.item?.id).filter(Boolean);
    setViewableStoryIds(ids);
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color="#e1306c" />
      </View>
    );
  }

  console.log('Rendering StoryList with stories:', stories);
  return (
    <View style={styles.container}>
      <FlatList
        data={stories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <CreateStoryButton
            avatarUri="https://i.pravatar.cc/150?u=me"
            onPress={handleCreateStory}
          />
        }
        renderItem={({ item }) => (
          <StoryItem
            story={item}
            onPress={() => setSelectedStory(item)}
            isVisible={viewableStoryIds.includes(item.id)}
          />
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No stories yet</Text>
          </View>
        }
      />

      <StoryModal
        visible={!!selectedStory}
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 110,
    backgroundColor: 'white',
  },
  listContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  center: {
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#999',
    fontSize: 12,
  },
});
