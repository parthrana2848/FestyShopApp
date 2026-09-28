import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  NativeModules,
} from 'react-native';

import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { StoryAudio, StoryTextItem, TextAnimationType, UserStory } from '../types/story';
import { StoryImage } from '../types/story';

import { ColorMatrix } from 'react-native-color-matrix-image-filters';

import {
  FILTERS,
  FilterType,
} from '../constants/filters';

import { FilterSelector } from '../components/FilterSelector';

import * as ImagePicker from 'react-native-image-picker';

import { storyStorage } from '../storage/storyStorage';
import { RootStackParamList } from '../types/navigation';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import ViewShot from 'react-native-view-shot';
import { StoryCanvas } from '../components/story/StoryCanvas';
import { TextEditorModal } from '../components/story/TextEditorModal';
import { FontPresetSelector } from '../components/story/FontPresetSelector';
import { TextToolbar } from '../components/story/TextToolbar';
import { AnimationSelector } from '../components/text/AnimationSelector';
import { useStoryExport } from '../hooks/useStoryExport';
import { detectStoryType } from '../services/media/mediaExport.service';
import { MediaToolkit } from 'react-native-media-toolkit';
import { LocationToolbarButton } from '../components/location/LocationToolbarButton';
import { LocationSearchModal } from '../components/location/LocationSearchModal';
import { StoryLocation } from '../types/location.types';

import { GifToolbarButton } from '../components/gif/GifToolbarButton';
import { GifPickerModal } from '../components/gif/GifPickerModal';
import { GifStickerData, NormalizedGif } from '../types/gif.types';
import { GIF_CONSTANTS } from '../constants/gif.constants';
import { LINK_CONSTANTS } from '../constants/link.constants';

import { LinkToolbarButton } from '../components/link/LinkToolbarButton';
import { AddLinkModal } from '../components/link/AddLinkModal';
import { LinkStickerData } from '../types/link.types';

import { PollCreationModal } from '../components/stickers/PollCreationModal';
import { PollSticker as PollStickerType, StoryStickerItem } from '../types/story';
import { StickerPickerModal } from '../components/stickers/StickerPickerModal';
import { StickerAsset } from '../constants/stickers';
import {
  SafeAreaView
} from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

type EditStoryRouteProp = RouteProp<
  RootStackParamList,
  'EditStory'
>;

interface EditStoryProps {
  route: EditStoryRouteProp;
}

export const EditStoryScreen = ({
  route,
}: EditStoryProps) => {
  const {
    image: initialImage,
    existingStoryId,
    filter: initialFilter,
  } = route.params;

  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList>
    >();



  const [currentImage, setCurrentImage] =
    useState<StoryImage>(initialImage);

  const [currentFilter, setCurrentFilter] =
    useState<FilterType>(
      (initialFilter as FilterType) ||
      'Normal',
    );

  const [textItems, setTextItems] = useState<StoryTextItem[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isTextEditorVisible, setIsTextEditorVisible] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [activePreset, setActivePreset] = useState('classic');
  const [activeAnimation, setActiveAnimation] = useState<TextAnimationType>('none');
  const [audio, setAudio] = useState<StoryAudio | null>(null);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [locationMetadata, setLocationMetadata] = useState<StoryLocation | null>(null);
  const viewShotRef = useRef<any>(null);

  const [gifStickers, setGifStickers] = useState<GifStickerData[]>([]);
  const [isGifPickerVisible, setIsGifPickerVisible] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const [linkStickers, setLinkStickers] = useState<LinkStickerData[]>([]);
  const [isAddLinkModalVisible, setIsAddLinkModalVisible] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkModalInitialUrl, setLinkModalInitialUrl] = useState('');
  const [linkModalInitialTitle, setLinkModalInitialTitle] = useState('');

  const [pollStickers, setPollStickers] = useState<PollStickerType[]>([]);
  const [isPollModalVisible, setIsPollModalVisible] = useState(false);

  const [stickerItems, setStickerItems] = useState<StoryStickerItem[]>([]);
  const [isStickerPickerVisible, setIsStickerPickerVisible] = useState(false);

  useEffect(() => {
    return () => {
      const { AudioPicker } = NativeModules;
      if (AudioPicker) {
        AudioPicker.stopAudio();
      }
    };
  }, []);

  const { exportStory, isExporting } = useStoryExport();

  const activeFilterMatrix =
    (FILTERS.find(
      f => f.id === currentFilter,
    )?.matrix ||
      FILTERS[0].matrix) as any;

  const handleAddText = (text: string) => {
    if (selectedTextId) {
      setTextItems(prev => prev.map(item => item.id === selectedTextId ? { ...item, text } : item));
    } else {
      const newItem: StoryTextItem = {
        id: Date.now().toString() + Math.random().toString(),
        text,
        color: '#FFFFFF',
        fontFamily: 'System',
        fontSize: 36,
        backgroundEnabled: false,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignment: 'center',
        textAlign: 'center',
        animationType: activeAnimation,
        translateX: width / 2 - 50,
        translateY: height / 2 - 50,
        scale: 1,
        rotation: 0,
        zIndex: textItems.length + 1,
        preset: activePreset,
      };
      setTextItems(prev => [...prev, newItem]);
    }
    setIsTextEditorVisible(false);
    setDraftText('');
  };

  const handleUpdateTextItem = (id: string, updates: Partial<StoryTextItem>) => {
    setTextItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleDeleteTextItem = (id: string) => {
    setTextItems(prev => prev.filter(item => item.id !== id));
    if (selectedTextId === id) setSelectedTextId(null);
    if (id === 'music_sticker') {
      handleRemoveAudio();
    }
    if (id === 'location_sticker') {
      setLocationMetadata(null);
    }
  };

  const handleSelectLocation = (location: StoryLocation) => {
    setLocationMetadata(location);
    setIsLocationModalVisible(false);

    const locationTextItem: StoryTextItem = {
      id: 'location_sticker',
      text: location.placeName.split(',')[0], // Use short name for compact sticker
      color: '#0095F6',
      fontFamily: 'System',
      fontSize: 18,
      backgroundEnabled: true,
      backgroundColor: 'rgba(255,255,255,0.9)',
      alignment: 'center',
      textAlign: 'center',
      translateX: width / 2 - 100,
      translateY: height / 2 - 25,
      scale: 1,
      rotation: 0,
      animationType: 'none',
      zIndex: 200,
      preset: 'style_0',
    };

    setTextItems(prev => {
      const filtered = prev.filter(item => item.id !== 'location_sticker');
      return [...filtered, locationTextItem];
    });
  };

  const openTextEditorForNew = () => {
    setSelectedTextId(null);
    setDraftText('');
    setIsTextEditorVisible(true);
  };

  const openTextEditorForExisting = (id: string) => {
    const item = textItems.find(t => t.id === id);
    if (item) {
      setSelectedTextId(id);
      setDraftText(item.text);
      setActivePreset(item.preset || 'classic');
      setActiveAnimation(item.animationType || 'none');
      setIsTextEditorVisible(true);
    }
  };

  const handleSelectMusic = async () => {
    try {
      const { AudioPicker } = NativeModules;
      if (!AudioPicker) {
        throw new Error('AudioPicker native module is not available');
      }

      const audioResult = await AudioPicker.pickAudio();

      const newAudio = {
        uri: audioResult.uri,
        duration: audioResult.duration ? Math.round(audioResult.duration) : 15000,
        filename: audioResult.filename || 'audio',
      };

      setAudio(newAudio);

      // Play the music natively
      AudioPicker.playAudio(audioResult.uri);

      // Create and add a sleek, small, draggable music sticker on the Canvas
      const musicTextItem: StoryTextItem = {
        id: 'music_sticker',
        text: `🎵 ${newAudio.filename.replace(/\.[^/.]+$/, "")}`, // strip file extension for cleaner UI
        color: '#FFFFFF',
        fontFamily: 'System',
        fontSize: 16, // Little bit small
        backgroundEnabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        alignment: 'center',
        textAlign: 'center',
        translateX: width / 2 - 90,
        translateY: height / 2 - 15,
        scale: 1,
        rotation: 0,
        animationType: 'none',
        zIndex: 100,
      };

      setTextItems(prev => {
        const filtered = prev.filter(item => item.id !== 'music_sticker');
        return [...filtered, musicTextItem];
      });

      Alert.alert('Success', 'Music selected successfully!');
    } catch (e: any) {
      if (e.code === 'CANCELLED' || e.message?.includes('cancelled')) {
        // User cancelled, do nothing
        return;
      }
      console.error('Audio pick error', e);
      Alert.alert('Error', 'Failed to select music file.');
    }
  };

  const handleRemoveAudio = () => {
    const { AudioPicker } = NativeModules;
    if (AudioPicker) {
      AudioPicker.stopAudio();
    }
    setAudio(null);
    // Automatically remove the music sticker from the Canvas
    setTextItems(prev => prev.filter(item => item.id !== 'music_sticker'));
  };

  const handleSelectGif = (gif: NormalizedGif) => {
    if (gifStickers.length >= GIF_CONSTANTS.MAX_GIFS_PER_STORY) {
      Alert.alert('Limit Reached', `You can only add up to ${GIF_CONSTANTS.MAX_GIFS_PER_STORY} GIFs to your story.`);
      return;
    }
    const newGif: GifStickerData = {
      id: Date.now().toString() + Math.random().toString(),
      uri: gif.stickerUrl,
      x: width / 2 - 75,
      y: height / 2 - 75,
      scale: 1,
      rotation: 0,
      zIndex: gifStickers.length + 10,
    };
    setGifStickers(prev => [...prev, newGif]);
    setIsGifPickerVisible(false);
  };

  const handleUpdateGifSticker = (id: string, updates: Partial<GifStickerData>) => {
    setGifStickers(prev => prev.map(sticker => sticker.id === id ? { ...sticker, ...updates } : sticker));
  };

  const handleDeleteGifSticker = (id: string) => {
    setGifStickers(prev => prev.filter(sticker => sticker.id !== id));
    if (selectedTextId === id) setSelectedTextId(null);
  };

  const handleSaveLink = (url: string, title: string) => {
    if (editingLinkId) {
      setLinkStickers(prev => prev.map(sticker =>
        sticker.id === editingLinkId ? { ...sticker, url, title } : sticker
      ));
      setEditingLinkId(null);
      setLinkModalInitialUrl('');
      setLinkModalInitialTitle('');
      setIsAddLinkModalVisible(false);
      return;
    }

    if (linkStickers.length >= LINK_CONSTANTS.MAX_LINKS_PER_STORY) {
      Alert.alert('Limit Reached', `You can only add up to ${LINK_CONSTANTS.MAX_LINKS_PER_STORY} link stickers to your story.`);
      return;
    }

    const newLink: LinkStickerData = {
      id: Date.now().toString() + Math.random().toString(),
      url,
      title,
      x: width / 2 - 80,
      y: height / 2 - 15,
      scale: 1,
      rotation: 0,
      zIndex: linkStickers.length + 10,
    };
    setLinkStickers(prev => [...prev, newLink]);
    setIsAddLinkModalVisible(false);
  };

  const handleUpdateLinkSticker = (id: string, updates: Partial<LinkStickerData>) => {
    setLinkStickers(prev => prev.map(sticker => sticker.id === id ? { ...sticker, ...updates } : sticker));
  };

  const handleDeleteLinkSticker = (id: string) => {
    setLinkStickers(prev => prev.filter(sticker => sticker.id !== id));
    if (selectedTextId === id) setSelectedTextId(null);
  };

  const handleEditLinkSticker = (id: string) => {
    const sticker = linkStickers.find((item) => item.id === id);
    if (!sticker) return;

    setEditingLinkId(id);
    setLinkModalInitialUrl(sticker.url);
    setLinkModalInitialTitle(sticker.title);
    setIsAddLinkModalVisible(true);
  };

  const handleAddPoll = (poll: PollStickerType) => {
    const newPoll: PollStickerType = {
      ...poll,
      position: { x: width / 2 - 140, y: height / 2 - 100 },
    };
    setPollStickers(prev => [...prev, newPoll]);
  };

  const handleUpdatePollSticker = (id: string, updates: Partial<PollStickerType>) => {
    setPollStickers(prev => prev.map(sticker => sticker.id === id ? { ...sticker, ...updates } : sticker));
  };

  const handleDeletePollSticker = (id: string) => {
    setPollStickers(prev => prev.filter(sticker => sticker.id !== id));
    if (selectedTextId === id) setSelectedTextId(null);
  };

  const handleAddSticker = useCallback((sticker: StickerAsset) => {
    const newSticker: StoryStickerItem = {
      id: Date.now().toString() + Math.random().toString(),
      type: 'sticker',
      uri: sticker.uri,
      x: width / 2 - 60,
      y: height / 2 - 60,
      scale: 1,
      rotation: 0,
      zIndex: (textItems.length + gifStickers.length + linkStickers.length + pollStickers.length + stickerItems.length) + 1,
      width: 120,
      height: 120,
      stickerType: sticker.type,
    };

    setStickerItems(prev => [...prev, newSticker]);
    setIsStickerPickerVisible(false);
  }, [textItems.length, gifStickers.length, linkStickers.length, pollStickers.length, stickerItems.length]);

  const handleUpdateStickerItem = useCallback((id: string, updates: Partial<StoryStickerItem>) => {
    setStickerItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const handleDeleteStickerItem = useCallback((id: string) => {
    setStickerItems(prev => prev.filter(item => item.id !== id));
    if (selectedTextId === id) setSelectedTextId(null);
  }, [selectedTextId]);

  const handleReplaceImage =
    async () => {
      const result =
        await ImagePicker.launchImageLibrary(
          {
            mediaType: 'photo',
            quality: 1,
          },
        );

      if (result.didCancel) {
        return;
      }

      if (
        result.assets &&
        result.assets.length > 0
      ) {
        const asset = result.assets[0];

        if (!asset.uri) {
          return;
        }

        setCurrentImage({
          uri: asset.uri,
          width: asset.width || width,
          height:
            asset.height || height,
        });
      } else if (result.errorCode) {
        Alert.alert(
          'Error',
          'Failed to pick image',
        );
      }
    };

  const handleSave = async () => {
    try {
      // Clear active sticker selection so dashed borders and delete badges are not captured in the exported file
      setSelectedTextId(null);
      setIsCapturing(true);

      // Wait for a brief frame to let React finish rendering the deselected state in the canvas
      await new Promise(resolve => setTimeout(() => resolve(undefined), 100));

      const hasDynamicContent =
        textItems.some(t => t.animationType && t.animationType !== 'none') ||
        audio ||
        gifStickers.length > 0 ||
        linkStickers.length > 0 ||
        pollStickers.length > 0 ||
        stickerItems.length > 0;

      const draftStory: UserStory = {
        id: existingStoryId || Date.now().toString(),
        uri: currentImage.uri,
        width: currentImage.width,
        height: currentImage.height,
        createdAt: new Date().toISOString(),
        filter: currentFilter,
        username: 'me', // Default username as per requirements
        textLayers: textItems,
        gifStickers,
        linkStickers,
        pollStickers,
        stickerItems,
        audio,
        location: locationMetadata,
        duration: hasDynamicContent ? 15000 : undefined,
        type: detectStoryType({
          id: existingStoryId || Date.now().toString(),
          uri: currentImage.uri,
          width: currentImage.width,
          height: currentImage.height,
          createdAt: new Date().toISOString(),
          filter: currentFilter,
          username: 'me',
          textLayers: textItems,
          gifStickers,
          linkStickers,
          pollStickers,
          stickerItems,
          audio,
          location: locationMetadata,
        }),
      };

      const exportedUri = await exportStory(draftStory, viewShotRef);

      const story: UserStory = {
        ...draftStory,
        uri: exportedUri,
        type: detectStoryType({ ...draftStory, uri: exportedUri }),
      };

      if (existingStoryId) {
        await storyStorage.updateStory(story);
      } else {
        await storyStorage.saveStory(story);
      }

      setIsCapturing(false);

      // Navigate to StoryList screen after saving
      navigation.navigate('StoryList');
    } catch (error) {
      console.error('Failed to save story:', error);
      setIsCapturing(false);
      Alert.alert('Error', 'Failed to save story');
    }
  };

  console.log('Rendering image with URI:', currentImage.uri);

  const selectedTextItem = textItems.find(t => t.id === selectedTextId) || null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        //  edges={[ 'left', 'right',"bottom"]}
        style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              navigation.goBack()
            }
            style={styles.backButton}>
            <Text
              style={styles.headerText}>
              ✕
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}>
            <Text
              style={
                styles.saveButtonText
              }>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }} style={{ flex: 1 }}>
            <StoryCanvas
              currentImage={currentImage}
              activeFilterMatrix={activeFilterMatrix}
              textItems={textItems}
              selectedTextId={selectedTextId}
              onUpdateTextItem={handleUpdateTextItem}
              onDeleteTextItem={handleDeleteTextItem}
              onSelectTextItem={setSelectedTextId}
              onDoubleTapTextItem={openTextEditorForExisting}
              onDeselect={() => setSelectedTextId(null)}
              gifStickers={gifStickers}
              onUpdateGifSticker={handleUpdateGifSticker}
              onDeleteGifSticker={handleDeleteGifSticker}
              linkStickers={linkStickers}
              onUpdateLinkSticker={handleUpdateLinkSticker}
              onDeleteLinkSticker={handleDeleteLinkSticker}
              onDoubleTapLinkSticker={handleEditLinkSticker}
              pollStickers={pollStickers}
              onUpdatePollSticker={handleUpdatePollSticker}
              onDeletePollSticker={handleDeletePollSticker}
              stickerItems={stickerItems}
              onUpdateStickerItem={handleUpdateStickerItem}
              onDeleteStickerItem={handleDeleteStickerItem}
              hideGifs={isCapturing}
              hideTextLayers={isCapturing}
              hidePolls={isCapturing}
              hideLinks={isCapturing}
              hideStickers={isCapturing}
            />
          </ViewShot>
        </View>

        <View style={styles.toolbar}>
          <TouchableOpacity
            style={styles.tool}
            onPress={
              handleReplaceImage
            }>
            <Text
              style={styles.toolText}>
              🖼️
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tool}
            onPress={openTextEditorForNew}>
            <Text
              style={styles.toolText}>
              T
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tool}
            onPress={handleSelectMusic}
          >
            <Text
              style={styles.toolText}>
              🎵
            </Text>
          </TouchableOpacity>

          <LocationToolbarButton onPress={() => setIsLocationModalVisible(true)} />
          <GifToolbarButton onPress={() => setIsGifPickerVisible(true)} />
          <LinkToolbarButton onPress={() => setIsAddLinkModalVisible(true)} />
          <TouchableOpacity
            style={styles.tool}
            onPress={() => setIsPollModalVisible(true)}
          >
            <Text style={styles.toolText}>📊</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tool}
            onPress={() => setIsStickerPickerVisible(true)}
          >
            <Text style={styles.toolText}>😀</Text>
          </TouchableOpacity>
        </View>



        {selectedTextId ? (
          <View style={styles.textToolsContainer}>
            <TextToolbar textItem={selectedTextItem} onUpdate={(updates) => handleUpdateTextItem(selectedTextId, updates)} />
            <AnimationSelector
              selectedAnimation={selectedTextItem?.animationType || activeAnimation}
              onSelect={(preset) => {
                setActiveAnimation(preset as TextAnimationType);
                if (selectedTextId) {
                  handleUpdateTextItem(selectedTextId, { animationType: preset as any });
                }
              }}
            />
            <FontPresetSelector
              activePresetId={selectedTextItem?.preset || activePreset}
              onSelectPreset={(preset) => {
                setActivePreset(preset);
                handleUpdateTextItem(selectedTextId, { preset });
              }}
            />
          </View>
        ) : (
          <FilterSelector
            selectedFilter={
              currentFilter
            }
            onFilterSelect={
              setCurrentFilter
            }
          />
        )}

        <TextEditorModal
          visible={isTextEditorVisible}
          initialText={draftText}
          activePresetId={activePreset}
          onClose={() => setIsTextEditorVisible(false)}
          onSave={handleAddText}
        />

        <LocationSearchModal
          visible={isLocationModalVisible}
          onSelectLocation={handleSelectLocation}
          onClose={() => setIsLocationModalVisible(false)}
        />

        <GifPickerModal
          visible={isGifPickerVisible}
          onClose={() => setIsGifPickerVisible(false)}
          onSelectGif={handleSelectGif}
        />

        <AddLinkModal
          visible={isAddLinkModalVisible}
          onClose={() => {
            setIsAddLinkModalVisible(false);
            setEditingLinkId(null);
            setLinkModalInitialUrl('');
            setLinkModalInitialTitle('');
          }}
          onSave={handleSaveLink}
          initialUrl={linkModalInitialUrl}
          initialTitle={linkModalInitialTitle}
        />

        <PollCreationModal
          visible={isPollModalVisible}
          onClose={() => setIsPollModalVisible(false)}
          onSubmit={handleAddPoll}
        />

        <StickerPickerModal
          visible={isStickerPickerVisible}
          onClose={() => setIsStickerPickerVisible(false)}
          onSelectSticker={handleAddSticker}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },

  header: {
    marginTop: 20,
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor:
      'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },

  saveButton: {
    backgroundColor: '#0095f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },

  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  imageContainer: {
    flex: 1,
    backgroundColor: 'black',
  },

  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullImage: {
    width: width,
    height: height,
  },

  toolbar: {
    position: 'absolute',
    top: 120,
    right: 20,
    gap: 15,
  },

  tool: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  toolText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  textToolsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingBottom: 20,
  },

});