import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { storyStorage } from '../storage/storyStorage';
import { UserStory } from '../types/story';

export const useStories = () => {
  const [stories, setStories] = useState<UserStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused();

  const loadStories = useCallback(async () => {
    setIsLoading(true);
    const storedStories = await storyStorage.getStories();
    setStories(storedStories);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadStories();
    }
  }, [loadStories, isFocused]);

  const addStory = async (story: UserStory) => {
    await storyStorage.saveStory(story);
    await loadStories();
  };

  const updateStory = async (story: UserStory) => {
    await storyStorage.updateStory(story);
    await loadStories();
  };

  const deleteStory = async (id: string) => {
    await storyStorage.deleteStory(id);
    await loadStories();
  };

  return {
    stories,
    isLoading,
    addStory,
    updateStory,
    deleteStory,
    refreshStories: loadStories,
  };
};
