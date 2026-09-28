import React from 'react';
import { Image, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { StoryStickerItem } from '../../types/story';

// Safe dynamic require to prevent Metro bundler failures if react-native-svg is missing
let SvgUri: any = null;
try {
  SvgUri = require('react-native-svg').SvgUri;
} catch (_) {
  // Graceful fallback when react-native-svg is not installed
}

interface StickerRendererProps {
  item: StoryStickerItem;
}

/**
 * Presentation-only component responsible for displaying a single sticker overlay.
 * Devoid of gesture logic to enforce absolute separation of concerns.
 * Supports PNG stickers, high-performance cached GIF stickers via FastImage,
 * and SVG stickers (remotely loaded) with graceful fallback.
 */
export const StickerRenderer: React.FC<StickerRendererProps> = React.memo(({ item }) => {
  const isRemote = typeof item.uri === 'string' && (item.uri.startsWith('http://') || item.uri.startsWith('https://'));
  const source = isRemote ? { uri: item.uri } : item.uri;
  const stickerWidth = item.width || 120;
  const stickerHeight = item.height || 120;

  switch (item.stickerType) {
    case 'svg':
      if (SvgUri && isRemote) {
        return (
          <SvgUri
            uri={item.uri}
            width={stickerWidth}
            height={stickerHeight}
          />
        );
      }
      // Graceful fallback to basic image rendering for SVGs if package is absent
      return (
        <Image
          source={source}
          style={[styles.image, { width: stickerWidth, height: stickerHeight }]}
          resizeMode="contain"
        />
      );

    case 'gif':
      // GIF sticker - Rendered via high-performance FastImage for seamless hardware acceleration
      return (
        <FastImage
          source={{
            uri: isRemote ? item.uri : Image.resolveAssetSource(item.uri).uri,
            priority: FastImage.priority.high,
            cache: FastImage.cacheControl.immutable,
          }}
          style={[styles.image, { width: stickerWidth, height: stickerHeight }]}
          resizeMode={FastImage.resizeMode.contain}
        />
      );

    default:
      // Standard PNG sticker
      return (
        <Image
          source={source}
          style={[styles.image, { width: stickerWidth, height: stickerHeight }]}
          resizeMode="contain"
        />
      );
  }
});

StickerRenderer.displayName = 'StickerRenderer';

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});
