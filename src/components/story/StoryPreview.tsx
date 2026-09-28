import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ColorMatrix } from 'react-native-color-matrix-image-filters';
import { StoryVideoPlayer } from './StoryVideoPlayer';
import type { UserStory } from '../../types/story';
import type { StoryStickerItem } from '../../types/story';
import Animated from 'react-native-reanimated';
import { StickerRenderer } from '../stickers/StickerRenderer';

interface StoryPreviewProps {
  story: UserStory;
  filterMatrix: any;
  stickers?: StoryStickerItem[]; // optional stickers array
}

export const StoryPreview: React.FC<StoryPreviewProps> = React.memo(
  ({ story, filterMatrix, stickers = [] }) => {
    const renderMedia = () => {
      if (story.type === 'video') {
        return <StoryVideoPlayer story={story} style={styles.preview} />;
      }
      const mediaSource = typeof story.uri === 'number' ? story.uri : { uri: story.uri };
      return (
        <Image source={mediaSource} style={styles.preview} resizeMode="cover" />
      );
    };

    return (
      <ColorMatrix matrix={filterMatrix} style={styles.container}>
        {renderMedia()}
        {stickers.length > 0 && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {stickers.map((item) => (
              <Animated.View
                key={item.id}
                style={[
                  styles.stickerLayer,
                  {
                    zIndex: item.zIndex || 10,
                    transform: [
                      { translateX: item.x },
                      { translateY: item.y },
                      { scale: item.scale },
                      { rotate: `${item.rotation}rad` },
                    ],
                  },
                ]}
              >
                <StickerRenderer item={item} />
              </Animated.View>
            ))}
          </View>
        )}
      </ColorMatrix>
    );
  }
);

StoryPreview.displayName = 'StoryPreview';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  preview: {
    ...StyleSheet.absoluteFill,
  },
  stickerLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
