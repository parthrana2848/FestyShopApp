import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StoryTextItem } from '../../types/story';
import { LOCATION_STICKER_STYLES } from '../../constants/locationStyles';

interface LocationStickerProps {
  /** The story overlay item representing this sticker. */
  item: StoryTextItem;
}

/**
 * LocationSticker renders an Instagram-style interactive tagged place name.
 * Renders high-end styles (e.g. glassmorphism, accent colors, drop shadows)
 * based on the active style index parsed from `item.preset`.
 */
export const LocationSticker: React.FC<LocationStickerProps> = React.memo(({ item }) => {
  // Parse style index from preset (e.g., 'style_1' -> index 1)
  const styleIndex = parseInt(item.preset?.replace('style_', '') || '0', 10);
  const selectedStyle = LOCATION_STICKER_STYLES[styleIndex] || LOCATION_STICKER_STYLES[0];

  return (
    <View
      style={[
        styles.stickerContainer,
        {
          backgroundColor: selectedStyle.backgroundColor,
          borderRadius: selectedStyle.borderRadius,
          paddingHorizontal: selectedStyle.paddingHorizontal,
          paddingVertical: selectedStyle.paddingVertical,
          borderWidth: selectedStyle.borderWidth || 0,
          borderColor: selectedStyle.borderColor || 'transparent',
        },
        selectedStyle.shadow,
      ]}
    >
      <Text
        style={[
          styles.stickerText,
          {
            color: selectedStyle.textColor,
            // Slightly smaller font to keep sticker clean and compact on screen
            fontSize: item.fontSize ? item.fontSize * 0.75 : 18,
          },
        ]}
        numberOfLines={1}
      >
        <Text style={styles.pin}>📍 </Text>
        <Text style={styles.placeNameText}>{item.text}</Text>
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  stickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  stickerText: {
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  pin: {
    fontSize: 16,
  },
  placeNameText: {
    fontWeight: '800',
  },
});
