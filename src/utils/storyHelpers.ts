import { Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export const STORY_CONSTANTS = {
  SWIPE_THRESHOLD: height * 0.2,
  STORY_DURATION: 10000,
};
