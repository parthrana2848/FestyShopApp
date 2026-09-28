import { useCallback, useState } from 'react';
import type { UserStory } from '../types/story';
import {
  detectStoryType,
  exportImageStory,
  exportVideoStory,
  isVideoUri,
} from '../services/media/mediaExport.service';

export const useStoryExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const exportStory = useCallback(
    async (story: UserStory, viewShotRef?: React.RefObject<any>) => {
      setError(null);
      setIsExporting(true);
      setProgress(10);

      try {
        const storyType = detectStoryType(story);
        const outputUri =
          storyType === 'image' || !isVideoUri(story.uri)
            ? await exportImageStory(story, viewShotRef)
            : await exportVideoStory(story);

        setProgress(100);
        return outputUri;
      } catch (exportError) {
        setError(String(exportError));
        throw exportError;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  return {
    exportStory,
    isExporting,
    progress,
    error,
  };
};
