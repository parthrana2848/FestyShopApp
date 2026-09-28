import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ViewShot from 'react-native-view-shot';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { RootStackParamList } from '../types/navigation';
import { CollageImage, CollageLayout, CollageRatio } from '../types/collage.types';
import { CollageCanvas } from '../components/collage/CollageCanvas';
import { LayoutSelector } from '../components/collage/LayoutSelector';
import { getLayoutsForCount } from '../utils/collage.utils';
import { openMultipleGallery } from '../services/mediaPicker.service';
import { requestGalleryPermission } from '../utils/storyDownloader';
import { NativeModules } from 'react-native';

const { ImageSaver } = NativeModules;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type CollageEditorRouteProp = RouteProp<RootStackParamList, 'CollageEditor'>;

export const CollageEditorScreen = () => {
  const route = useRoute<CollageEditorRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // Received image parameters from Camera screen multiple picker
  const initialPickerAssets = route.params?.images || [];

  // State management
  const [images, setImages] = useState<CollageImage[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<CollageLayout | null>(null);
  const [ratio, setRatio] = useState<CollageRatio>('9:16');
  const [isExporting, setIsExporting] = useState(false);

  const viewShotRef = useRef<any>(null);

  // Initialize selected images on mount
  useEffect(() => {
    if (initialPickerAssets.length > 0) {
      setImages(
        initialPickerAssets.map((asset, index) => ({
          id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
          uri: asset.uri,
        }))
      );
    }
  }, [initialPickerAssets]);

  // Dynamically update layouts and select default when the number of images changes
  useEffect(() => {
    if (images.length > 0) {
      const layouts = getLayoutsForCount(images.length);
      if (layouts && layouts.length > 0) {
        // Preserving the selected layout index if possible, otherwise default to first
        setSelectedLayout(layouts[0]);
      }
    } else {
      setSelectedLayout(null);
    }
  }, [images.length]);

  /**
   * Action: Incremental Add Images
   */
  const handleAddImages = async () => {
    const currentCount = images.length;
    if (currentCount >= 5) {
      Alert.alert('Maximum Limit', 'Maximum 5 images allowed');
      return;
    }

    const remaining = 5 - currentCount;
    const response = await openMultipleGallery(remaining);

    if (response.success && response.assets) {
      if (currentCount + response.assets.length > 5) {
        Alert.alert('Validation Error', 'Maximum 5 images allowed');
        return;
      }

      const newImages = response.assets.map((asset, index) => ({
        id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
        uri: asset.uri,
      }));

      setImages((prev) => [...prev, ...newImages]);
    } else if (response.error && !response.didCancel) {
      Alert.alert('Error', response.error);
    }
  };

  /**
   * Action: Remove Image
   */
  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      if (prev.length <= 1) {
        Alert.alert('Cannot Remove', 'Your collage must contain at least 1 image.');
        return prev;
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  /**
   * Action: Swap layout slots order on gesture swap completed
   */
  const handleOrderChange = useCallback((newOrder: string[]) => {
    setImages((prev) => {
      const ordered = newOrder
        .map((id) => prev.find((img) => img.id === id))
        .filter((img): img is CollageImage => !!img);
      return ordered;
    });
  }, []);

  /**
   * Toggle Collage Ratio (9:16 <=> 1:1)
   */
  const handleToggleRatio = () => {
    setRatio((prev) => (prev === '9:16' ? '1:1' : '9:16'));
  };

  /**
   * Action: Save and Export Collage
   */
  const handleSave = async () => {
    if (!viewShotRef.current || isExporting) return;
    setIsExporting(true);

    // Give React render loop exactly 100ms to fully process state updates and completely hide all 'X' remove buttons
    setTimeout(async () => {
      try {
        // 1. Capture the exact dimensions of the Collage Canvas box (clean and without the X buttons!)
        const capturedUri = await viewShotRef.current.capture();

        // 2. Open in the existing EditStory Screen for overlays, text additions, and story posting
        navigation.navigate('EditStory', {
          image: {
            uri: capturedUri,
            width: ratio === '9:16' ? 1080 : 1080,
            height: ratio === '9:16' ? 1920 : 1080,
          },
        });
      } catch (error) {
        console.error('Failed to export collage:', error);
        Alert.alert('Export Error', 'An error occurred while preparing your collage.');
      } finally {
        setIsExporting(false);
      }
    }, 100);
  };

  const layouts = getLayoutsForCount(images.length);

  return (
    <GestureHandlerRootView style={styles.rootView}>
      <SafeAreaView style={styles.container}>
      {/* 1. Header Toolbar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
          disabled={isExporting}
        >
          <Text style={styles.headerText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Collage Layout</Text>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleSave}
          disabled={isExporting || images.length === 0}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.nextButtonText}>Next</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 2. Ratio Selector Banner */}
      <View style={styles.ratioSelectorContainer}>
        <TouchableOpacity
          style={styles.ratioButton}
          onPress={handleToggleRatio}
          activeOpacity={0.7}
        >
          <Text style={styles.ratioIcon}>📐</Text>
          <Text style={styles.ratioButtonText}>
            Aspect Ratio: <Text style={styles.ratioHighlight}>{ratio}</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. Collage Canvas wrapped in ViewShot inside the component to capture only the canvas box */}
      <View style={styles.canvasContainer}>
        {images.length > 0 && selectedLayout ? (
          <CollageCanvas
            images={images}
            layout={selectedLayout}
            ratio={ratio}
            isExporting={isExporting}
            viewShotRef={viewShotRef}
            onOrderChange={handleOrderChange}
            onRemoveImage={handleRemoveImage}
          />
        ) : (
          <ActivityIndicator size="large" color="#0095f6" />
        )}
      </View>

      {/* 4. Bottom Custom Controls */}
      <View style={styles.bottomToolbar}>
        {selectedLayout && layouts.length > 1 && (
          <LayoutSelector
            layouts={layouts}
            selectedLayoutId={selectedLayout.id}
            onSelectLayout={setSelectedLayout}
          />
        )}

        {/* Action Panel */}
        <View style={styles.actionPanel}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              images.length >= 5 && styles.actionButtonDisabled,
            ]}
            onPress={handleAddImages}
            disabled={images.length >= 5}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonIcon}>🖼️</Text>
            <Text style={styles.actionButtonText}>Add Images ({images.length}/5)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000', // Pure premium dark mode aesthetic
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  nextButton: {
    backgroundColor: '#0095f6', // Brand blue
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  nextButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  ratioSelectorContainer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  ratioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  ratioIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  ratioButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '600',
  },
  ratioHighlight: {
    color: '#0095f6',
    fontWeight: '700',
  },
  canvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewShotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomToolbar: {
    backgroundColor: '#000000',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 20,
  },
  actionPanel: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonDisabled: {
    opacity: 0.5,
    borderColor: 'transparent',
  },
  actionButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
