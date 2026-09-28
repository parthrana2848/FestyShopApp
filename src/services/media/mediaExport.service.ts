import { Share } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { MediaToolkit } from 'react-native-media-toolkit';
import type { UserStory } from '../../types/story';
import type { StoryType } from '../../types/story.types';

export const DEFAULT_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.m4v', '.webm', '.avi', '.mpeg'];

export const isVideoUri = (uri: string) =>
  DEFAULT_VIDEO_EXTENSIONS.some((ext) => uri.toLowerCase().endsWith(ext));

export const detectStoryType = (story: UserStory): StoryType => {
  const hasAnimation = !!story.textLayers?.some(
    (layer) => layer.animationType && layer.animationType !== 'none'
  );

  const hasAudio = !!story.audio;
  const hasVideoSource = isVideoUri(story.uri);
  const hasGifs = !!story.gifStickers && story.gifStickers.length > 0;
  const hasPolls = !!story.pollStickers && story.pollStickers.length > 0;

  if (hasAnimation || hasAudio || hasVideoSource || hasGifs || hasPolls) {
    return 'video';
  }

  return 'image';
};

export const exportImageStory = async (
  story: UserStory,
  viewShotRef?: React.RefObject<any>
): Promise<string> => {
  if (viewShotRef?.current?.capture) {
    return await viewShotRef.current.capture();
  }

  return story.uri;
};

export const exportVideoStory = async (story: UserStory): Promise<string> => {
  if (isVideoUri(story.uri)) {
    const compressed = await MediaToolkit.compressVideo(story.uri, {
      quality: 'medium',
      width: 1080,
      muteAudio: !story.audio,
    });
    return compressed.uri;
  }

  // Static image source with animated overlay is not convertible with the
  // current native toolkit. Fall back to the final static capture if needed.
  return story.uri;
};

export const attachAudioTrack = async (story: UserStory): Promise<string> => {
  if (!story.audio) {
    return story.uri;
  }

  if (isVideoUri(story.uri)) {
    return story.uri;
  }

  // Audio attachment to a static image story is not currently implemented in the
  // available toolkit without a dedicated composition API.
  return story.uri;
};

export const downloadStoryMedia = async (story: UserStory): Promise<void> => {
  if (story.type === 'video' && isVideoUri(story.uri)) {
    await Share.share({
      url: story.uri,
      title: 'Save story video',
      message: 'Exported story video',
    });
    return;
  }

  await Share.share({
    url: story.uri,
    title: 'Save story image',
    message: 'Exported story image',
  });
};
