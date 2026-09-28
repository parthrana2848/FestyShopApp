import React, { useCallback } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Dimensions } from 'react-native';
import { StickerAsset } from '../../constants/stickers';
import FastImage from 'react-native-fast-image';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40) / 4; // Based on modal gutters and grid padding

interface StickerGridProps {
  stickers: StickerAsset[];
  onSelectSticker: (sticker: StickerAsset) => void;
}

const StickerGridItem = React.memo<{
  sticker: StickerAsset;
  onPress: (sticker: StickerAsset) => void;
}>(({ sticker, onPress }) => {
  const handlePress = () => onPress(sticker);
  const isRemote = typeof sticker.uri === 'string' && (sticker.uri.startsWith('http://') || sticker.uri.startsWith('https://'));

  return (
    <Pressable
      style={styles.gridItem}
      onPress={handlePress}
      android_ripple={{ color: 'rgba(255, 255, 255, 0.1)', borderless: false }}
    >
      {sticker.type === 'gif' ? (
        <FastImage
          source={{
            uri: isRemote ? sticker.uri : Image.resolveAssetSource(sticker.uri).uri,
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
          }}
          style={styles.stickerImage}
          resizeMode={FastImage.resizeMode.contain}
        />
      ) : (
        <Image
          source={isRemote ? { uri: sticker.uri } : sticker.uri}
          style={styles.stickerImage}
          resizeMode="contain"
        />
      )}
    </Pressable>
  );
});

StickerGridItem.displayName = 'StickerGridItem';

/**
 * StickerGrid renders the virtualized, grid-based list of stickers inside the selector drawer.
 * Applies optimal sizing constraints, windowing variables, batching caps, and item clipping rules.
 */
export const StickerGrid: React.FC<StickerGridProps> = React.memo(({
  stickers,
  onSelectSticker,
}) => {
  const renderItem = useCallback(({ item }: { item: StickerAsset }) => (
    <StickerGridItem
      sticker={item}
      onPress={onSelectSticker}
    />
  ), [onSelectSticker]);

  const keyExtractor = useCallback((item: StickerAsset) => item.id, []);

  return (
    <FlatList
      data={stickers}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={4}
      windowSize={10}
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      removeClippedSubviews
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
});

StickerGrid.displayName = 'StickerGrid';

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 12,
  },
  gridItem: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  stickerImage: {
    width: '100%',
    height: '100%',
  },
});
