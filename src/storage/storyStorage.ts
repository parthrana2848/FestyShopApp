import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserStory } from '../types/story';

const STORAGE_KEY = '@stories';

export const storyStorage = {
  async saveStory(story: UserStory): Promise<void> {
    try {
      const existingStories = await this.getStories();
      const updatedStories = [story, ...existingStories];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStories));
    } catch (error) {
      console.error('Error saving story:', error);
    }
  },

  async getStories(): Promise<UserStory[]> {
    try {
      const storiesJson = await AsyncStorage.getItem(STORAGE_KEY);
      return storiesJson ? JSON.parse(storiesJson) : [];
    } catch (error) {
      console.error('Error getting stories:', error);
      return [];
    }
  },

  async updateStory(updatedStory: UserStory): Promise<void> {
    try {
      const stories = await this.getStories();
      const updatedStories = stories.map((s) =>
        s.id === updatedStory.id ? updatedStory : s
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStories));
    } catch (error) {
      console.error('Error updating story:', error);
    }
  },

  async deleteStory(id: string): Promise<void> {
    try {
      const stories = await this.getStories();
      const filteredStories = stories.filter((s) => s.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredStories));
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  },

  async clearStories(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing stories:', error);
    }
  },
};
