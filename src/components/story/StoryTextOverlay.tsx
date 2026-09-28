import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTextAnimation } from '../../hooks/useTextAnimation';
import type { StoryTextLayer } from '../../types/story';
import { LocationSticker } from '../location/LocationSticker';
import FastImage from 'react-native-fast-image';
import { GifStickerData } from '../../types/gif.types';

interface StoryTextOverlayProps {
  layers: StoryTextLayer[];
  gifStickers?: GifStickerData[];
}

const GifOverlayItem: React.FC<{ sticker: GifStickerData }> = React.memo(({ sticker }) => {
  return (
    <Animated.View
      style={[
        styles.layer,
        {
          zIndex: sticker.zIndex || 10,
          width: 150,
          height: 150,
          transform: [
            { translateX: sticker.x },
            { translateY: sticker.y },
            { scale: sticker.scale },
            { rotate: `${sticker.rotation}rad` },
          ],
        },
      ]}
    >
      <FastImage
        source={{
          uri: sticker.uri,
          priority: FastImage.priority.high,
          cache: FastImage.cacheControl.immutable,
        }}
        style={styles.gifImage}
        resizeMode={FastImage.resizeMode.contain}
      />
    </Animated.View>
  );
});

GifOverlayItem.displayName = 'GifOverlayItem';

const LayerItem: React.FC<{ layer: StoryTextLayer }> = React.memo(({ layer }) => {
  const { animatedStyle } = useTextAnimation({
    type: layer.animationType || 'none',
    duration: 1400,
    loop: true,
  });

  return (
    <Animated.View
      key={layer.id}
      style={[
        styles.layer,
        {
          zIndex: layer.zIndex || 1,
          transform: [
            { translateX: layer.translateX },
            { translateY: layer.translateY },
            { scale: layer.scale },
            { rotate: `${layer.rotation}rad` },
          ],
        },
      ]}
    >
      <Animated.View style={animatedStyle}>
        {layer.id === 'location_sticker' ? (
          <LocationSticker item={layer} />
        ) : (
          <View
            style={[
              styles.textWrapper,
              layer.backgroundEnabled && {
                backgroundColor: layer.backgroundColor || 'rgba(0,0,0,0.45)',
              },
            ]}
          >
            <Text
              style={[
                styles.text,
                {
                  color: layer.color,
                  fontFamily: layer.fontFamily,
                  fontSize: layer.fontSize,
                  textAlign: layer.textAlign,
                },
              ]}
            >
              {layer.text}
            </Text>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
});

LayerItem.displayName = 'LayerItem';

export const StoryTextOverlay: React.FC<StoryTextOverlayProps> = React.memo(
  ({ layers, gifStickers = [] }) => {
    const hasLayers = layers && layers.length > 0;
    const hasGifs = gifStickers && gifStickers.length > 0;

    if (!hasLayers && !hasGifs) {
      return null;
    }

    return (
      <View style={styles.container} pointerEvents="none">
        {hasLayers && layers.map((layer) => (
          <LayerItem key={layer.id} layer={layer} />
        ))}
        {hasGifs && gifStickers.map((sticker) => (
          <GifOverlayItem key={sticker.id} sticker={sticker} />
        ))}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
  },
  layer: {
    position: 'absolute',
    left: 0,
    top: 0,
    minWidth: 100,
  },
  textWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  text: {
    color: 'white',
    fontWeight: '700',
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
});
