import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { StoryStickerItem } from '../types/story';
import { StickerRenderer } from '../components/stickers/StickerRenderer';

interface StoryViewerProps {
  stickers: StoryStickerItem[];
}

/**
 * StoryViewer is a presentation-only component designed to display
 * custom sticker overlays in the fullscreen story playback mode.
 * Contains no gesture handlers, is highly optimized, and supports all sticker types.
 */
export const StoryViewer: React.FC<StoryViewerProps> = React.memo(({ stickers = [] }) => {
  if (!stickers || stickers.length === 0) {
    return null;
  }

  return (
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
  );
});

StoryViewer.displayName = 'StoryViewer';

const styles = StyleSheet.create({
  stickerLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
