import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { StoryImage, StoryTextItem, StoryStickerItem } from '../../types/story';
import { ColorMatrix } from 'react-native-color-matrix-image-filters';
import { AnimatedTextItem } from '../text/AnimatedTextItem';
import { GifSticker } from '../gif/GifSticker';
import { GifStickerData } from '../../types/gif.types';
import { LinkSticker } from '../link/LinkSticker';
import { LinkStickerData } from '../../types/link.types';
import { PollSticker } from '../stickers/PollSticker';
import { PollSticker as PollStickerType } from '../../types/story';
import { DraggableSticker } from '../stickers/DraggableSticker';

/**
 * StoryCanvasProps defines the parameters for rendering the interactive canvas viewport.
 */
interface StoryCanvasProps {
  /** The localized image model with its resolved layout metadata and local filepath URI. */
  currentImage: StoryImage;
  /** The selected 5x4 HSL color filter matrix coefficients used to render overlays dynamically. */
  activeFilterMatrix: any;
  /** The collection of active sticker elements currently positioned on the editor canvas. */
  textItems: StoryTextItem[];
  /** The unique identifier of the currently active/highlighted sticker, if any. */
  selectedTextId: string | null;
  /** Callback to update a specific sticker's internal scale, position, and styling values. */
  onUpdateTextItem: (id: string, updates: Partial<StoryTextItem>) => void;
  /** Callback to remove a specific sticker or clear associated native features. */
  onDeleteTextItem: (id: string) => void;
  /** Callback to mark a specific sticker as active/selected. */
  onSelectTextItem: (id: string) => void;
  /** Callback to invoke in-line editor modals for double-tapped stickers. */
  onDoubleTapTextItem: (id: string) => void;
  /** Callback to clear any current text selections when clicking on empty canvas regions. */
  onDeselect: () => void;
  
  // GIF Sticker extensions
  /** Active GIF sticker layers positioned on top of the editor canvas. */
  gifStickers?: GifStickerData[];
  /** Callback to update GIF positions, sizing, and angles. */
  onUpdateGifSticker?: (id: string, updates: Partial<GifStickerData>) => void;
  /** Callback to delete an active GIF sticker from the editor. */
  onDeleteGifSticker?: (id: string) => void;

  // Link Sticker extensions
  /** Active link sticker layers positioned on top of the editor canvas. */
  linkStickers?: LinkStickerData[];
  /** Callback to update link positions, sizing, and angles. */
  onUpdateLinkSticker?: (id: string, updates: Partial<LinkStickerData>) => void;
  /** Callback to delete an active link sticker from the editor. */
  onDeleteLinkSticker?: (id: string) => void;
  /** Callback to invoke in-line edit for existing link sticker metadata. */
  onDoubleTapLinkSticker?: (id: string) => void;

  /** Flag to hide link stickers during capture/export. */
  hideLinks?: boolean;

  // Poll Sticker extensions
  /** Active poll sticker layers positioned on top of the editor canvas. */
  pollStickers?: PollStickerType[];
  /** Callback to update poll positions, sizing, and angles. */
  onUpdatePollSticker?: (id: string, updates: Partial<PollStickerType>) => void;
  /** Callback to delete an active poll sticker from the editor. */
  onDeletePollSticker?: (id: string) => void;

  // Custom Sticker extensions
  /** Active custom sticker layers positioned on top of the editor canvas. */
  stickerItems?: StoryStickerItem[];
  /** Callback to update custom sticker positions, sizing, and angles. */
  onUpdateStickerItem?: (id: string, updates: Partial<StoryStickerItem>) => void;
  /** Callback to delete an active custom sticker from the editor. */
  onDeleteStickerItem?: (id: string) => void;
  /** Flag to hide custom stickers during capture/export. */
  hideStickers?: boolean;

  /** Flag to hide GIF stickers during capture/export. */
  hideGifs?: boolean;
  /** Flag to hide text layers during capture/export. */
  hideTextLayers?: boolean;
  /** Flag to hide poll stickers during capture/export. */
  hidePolls?: boolean;
}

/**
 * StoryCanvas manages the visual composition viewport of the Story.
 * It renders the filtered camera/gallery background image and overlays
 * all interactive, gesture-handled sticker items absolutely.
 */
export const StoryCanvas: React.FC<StoryCanvasProps> = ({
  currentImage,
  activeFilterMatrix,
  textItems,
  selectedTextId,
  onUpdateTextItem,
  onDeleteTextItem,
  onSelectTextItem,
  onDoubleTapTextItem,
  onDeselect,
  gifStickers = [],
  onUpdateGifSticker,
  onDeleteGifSticker,
  linkStickers = [],
  onUpdateLinkSticker,
  onDeleteLinkSticker,
  onDoubleTapLinkSticker,
  pollStickers = [],
  onUpdatePollSticker,
  onDeletePollSticker,
  stickerItems = [],
  onUpdateStickerItem,
  onDeleteStickerItem,
  hideGifs = false,
  hideTextLayers = false,
  hidePolls = false,
  hideLinks = false,
  hideStickers = false,
}) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Compute responsive image boundaries fitting within the device's dimensions
  const { displayWidth, displayHeight } = React.useMemo(() => {
    const imgWidth = currentImage.width || screenWidth;
    const imgHeight = currentImage.height || screenHeight;
    const imageRatio = imgWidth / imgHeight;

    // Use full screen width as baseline
    let dWidth = screenWidth;
    let dHeight = screenWidth / imageRatio;

    // If height exceeds the screen, cap it and scale the width
    if (dHeight > screenHeight) {
      dHeight = screenHeight;
      dWidth = screenHeight * imageRatio;
    }

    return { displayWidth: dWidth, displayHeight: dHeight };
  }, [currentImage.width, currentImage.height, screenWidth, screenHeight]);

  return (
    <View 
      style={styles.container}
      onStartShouldSetResponder={() => true}
      onResponderRelease={() => onDeselect()}
    >
      <View style={styles.imageWrapper}>
        <ColorMatrix matrix={activeFilterMatrix}>
          <Image
            key={currentImage.uri}
            source={{ uri: currentImage.uri }}
            resizeMode="contain"
            style={[styles.fullImage, { width: displayWidth, height: displayHeight }]}
          />
        </ColorMatrix>
      </View>

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {!hideTextLayers && textItems.map((item) => (
          <AnimatedTextItem
            key={item.id}
            item={item}
            isSelected={item.id === selectedTextId}
            onUpdate={(updates) => onUpdateTextItem(item.id, updates)}
            onSelect={() => onSelectTextItem(item.id)}
            onDelete={() => onDeleteTextItem(item.id)}
            onDoubleTap={() => onDoubleTapTextItem(item.id)}
          />
        ))}

        {!hideGifs && gifStickers.map((sticker) => (
          <GifSticker
            key={sticker.id}
            sticker={sticker}
            isSelected={sticker.id === selectedTextId}
            onUpdate={(updates) => onUpdateGifSticker?.(sticker.id, updates)}
            onSelect={() => onSelectTextItem(sticker.id)}
            onDelete={() => onDeleteGifSticker?.(sticker.id)}
          />
        ))}

        {!hideLinks && linkStickers.map((sticker) => (
          <LinkSticker
            key={sticker.id}
            sticker={sticker}
            isSelected={sticker.id === selectedTextId}
            onUpdate={(updates) => onUpdateLinkSticker?.(sticker.id, updates)}
            onSelect={() => onSelectTextItem(sticker.id)}
            onDelete={() => onDeleteLinkSticker?.(sticker.id)}
            onDoubleTap={() => onDoubleTapLinkSticker?.(sticker.id)}
          />
        ))}

        {!hidePolls && pollStickers.map((sticker) => (
          <PollSticker
            key={sticker.id}
            sticker={sticker}
            isSelected={sticker.id === selectedTextId}
            onUpdate={(updates) => onUpdatePollSticker?.(sticker.id, updates)}
            onSelect={() => onSelectTextItem(sticker.id)}
            onDelete={() => onDeletePollSticker?.(sticker.id)}
          />
        ))}

        {!hideStickers && stickerItems.map((item) => (
          <DraggableSticker
            key={item.id}
            item={item}
            isSelected={item.id === selectedTextId}
            onUpdate={(id, updates) => onUpdateStickerItem?.(id, updates)}
            onSelect={() => onSelectTextItem(item.id)}
            onDelete={() => onDeleteStickerItem?.(item.id)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    flex: 1,
    // Will be overridden by passed dimensions, but just in case
  },
});
