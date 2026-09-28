import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  AppState,
  AppStateStatus,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Camera,
  useCameraDevice,
} from 'react-native-vision-camera';

import {
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';

import { CaptureButton } from '../components/CaptureButton';
import { useCameraPermissions } from '../hooks/useCameraPermissions';
import { RootStackParamList } from '../types/navigation';
import { StoryImage } from '../types/story';
import { openMultipleGallery } from '../services/mediaPicker.service';

import { SafeAreaView } from 'react-native-safe-area-context';
import { runOnJS } from 'react-native-reanimated';

/**
 * Loading Overlay Component
 */
const LoadingOverlay = () => (
  <View style={styles.loadingOverlay}>
    <ActivityIndicator size="large" color="white" />
    <Text style={styles.loadingText}>Processing image...</Text>
  </View>
);

export const CameraScreen = () => {
  const [latestGalleryImage, setLatestGalleryImage] = useState<string>('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  /**
   * Navigation Focus & UI Lifetime Keys
   */
  const isFocused = useIsFocused();
  const [cameraKey, setCameraKey] = useState<number>(0);

  // Force-reset native textures when coming back to focus
  useEffect(() => {
    if (isFocused) {
      setCameraKey(prev => prev + 1);
    }
  }, [isFocused]);

  /**
   * App State Management
   */
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  /**
   * Camera Permissions Hook
   */
  const { hasPermission, requestPermission } = useCameraPermissions();

  /**
   * Vision Camera Ref & Target Selection
   */
  const cameraRef = useRef<Camera>(null);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back');
  const device = useCameraDevice(cameraPosition);

  /**
   * Runtime Guard Locks
   */
  const isMountedRef = useRef(true);
  const isNavigatingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Hardware Zoom Factor Controls
   */
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = useMemo(() => Math.min(device?.maxZoom ?? 1, 8), [device]);
  const [zoom, setZoom] = useState<number>(1);

  // Synchronize zoom state baseline once the active hardware initializes
  useEffect(() => {
    if (device) {
      setZoom(device.minZoom ?? 1);
    }
  }, [device]);

  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.5, maxZoom));
  }, [maxZoom]);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.5, minZoom));
  }, [minZoom]);

  /**
   * Flash & Torch State
   */
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');

  const toggleFlash = useCallback(() => {
    setFlashMode(prev => (prev === 'off' ? 'on' : 'off'));
  }, []);

  /**
   * Camera Position Swapping
   */
  const switchCamera = useCallback(() => {
    setCameraPosition(prev => (prev === 'back' ? 'front' : 'back'));
  }, []);

  /**
   * Gesture Architecture
   */
  const doubleTapGesture = useMemo(() => {
    return Gesture.Tap()
      .numberOfTaps(2)
      .maxDuration(250)
      .onEnd((_event, success) => {
        'worklet';
        if (success) {
          runOnJS(switchCamera)();
        }
      });
  }, [switchCamera]);

  const composedGesture = useMemo(() => {
    return Gesture.Simultaneous(doubleTapGesture);
  }, [doubleTapGesture]);

  /**
   * Evaluate Active Frame Lifelines
   */
  const isActive = useMemo(() => {
    return isFocused && (appState === 'active' || appState === 'unknown');
  }, [appState, isFocused]);

  /**
   * AppState Hooks
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      setAppState(nextState);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Auto-Request Permission Cascade
   */
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  /**
   * Safe Stack Router Triggers
   */
  const navigateToEditStory = useCallback(
    (image: StoryImage) => {
      if (!isMountedRef.current || isNavigatingRef.current) return;

      isNavigatingRef.current = true;
      setIsLoading(false);

      try {
        navigation.navigate('EditStory', { image });
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 500);
      } catch (error) {
        setIsLoading(false);
        isNavigatingRef.current = false;
        Alert.alert('Navigation Error', 'Failed to open editor');
      }
    },
    [navigation],
  );

  /**
   * Capture Shutter Executions
   */
  const handleCapture = useCallback(async () => {
    try {
      if (isLoading || !cameraRef.current) return;

      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert('Permission Required', 'Camera permission is required');
          return;
        }
      }

      setIsLoading(true);

      const photo = await cameraRef.current.takePhoto({
        flash: flashMode,
        enableShutterSound: false,
      });

      if (!photo?.path) {
        throw new Error('Photo capture failed');
      }

      const storyImage: StoryImage = {
        uri: `file://${photo.path}`,
        width: photo.width,
        height: photo.height,
      };

      navigateToEditStory(storyImage);
    } catch (error) {
      console.log('Capture Error:', error);
      setIsLoading(false);
      Alert.alert('Capture Error', 'Failed to capture image');
    }
  }, [flashMode, hasPermission, isLoading, navigateToEditStory, requestPermission]);

  /**
   * Media Gallery Launchers
   */
  const handleGalleryOpen = useCallback(async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);

      const response = await openMultipleGallery(5);

      if (response.didCancel) {
        setIsLoading(false);
        return;
      }

      if (!response.success || !response.assets || response.assets.length === 0) {
        setIsLoading(false);
        Alert.alert('Gallery Error', response.error || 'Failed to select images');
        return;
      }

      if (response.assets.length === 1) {
        const asset = response.assets[0];
        const storyImage: StoryImage = {
          uri: asset.uri || '',
          width: asset.width || 0,
          height: asset.height || 0,
        };
        navigateToEditStory(storyImage);
      } else {
        const selectedImages = response.assets.map((asset, index) => ({
          id: `${Date.now()}-${index}`,
          uri: asset.uri || '',
        }));

        setIsLoading(false);
        navigation.navigate('CollageEditor', { images: selectedImages });
      }
    } catch (error) {
      console.log('Gallery Error:', error);
      setIsLoading(false);
      Alert.alert('Gallery Error', 'Unexpected error occurred');
    }
  }, [isLoading, navigation, navigateToEditStory]);

  /**
   * Unmount Safety Cleans
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * UI Fallback: Blocked Permissions
   */
  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Camera permission required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * UI Fallback: Initializing Native Drivers
   */
  if (!device) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.text}>Loading camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* GESTURE DETECTOR LAYER */}
      <GestureDetector gesture={composedGesture}>
        {/* Layout Wrapper protects the hardware render layer from crashing */}
        <View style={StyleSheet.absoluteFill}>
          <Camera
            key={cameraKey}
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isActive}
            photo={true}
            zoom={zoom}
            torch={flashMode}
            enableZoomGesture={false} // Managed via button control state formulas
          />
        </View>
      </GestureDetector>

      {/* USER INTERFACE OVERLAY */}
      {/* pointerEvents="box-none" prevents container dimensions from hijacking underlying gestures */}
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        {/* TOP BAR BRANDING & CONFIGS */}
        <View style={styles.topBar} >
          <Text style={styles.title}>Story</Text>
          <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
            <Text style={styles.flashButtonText}>⚡️{flashMode}</Text>
          </TouchableOpacity>
        </View>

        {/* FLOATING ZOOM SIDEBAR CONTROLS */}
        <View style={styles.zoomContainer}>
          <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
            <Text style={styles.zoomText}>+</Text>
          </TouchableOpacity>
          <Text style={styles.zoomIndicatorText}>{zoom.toFixed(1)}x</Text>
          <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
            <Text style={styles.zoomText}>-</Text>
          </TouchableOpacity>
        </View>

        {/* BOTTOM HUD MODULES */}
        <View style={styles.bottomControls} pointerEvents="box-none">
          {/* GALLERY ACCESSIBILITY LINK */}
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={handleGalleryOpen}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <View style={styles.galleryPreview} />
          </TouchableOpacity>

          {/* CENTRAL SHUTTER SHOT */}
          <CaptureButton onPress={handleCapture} disabled={isLoading} />

          {/* STRUCTURAL BALANCE BLOCK */}
          <View style={styles.rightPlaceholder} />
        </View>
      </SafeAreaView>

      {/* CONDITIONAL SYSTEM SPIN WINNERS */}
      {isLoading && <LoadingOverlay />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  text: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: 'black',
    fontWeight: '700',
    fontSize: 16,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
  },
  zoomContainer: {
    position: 'absolute',
    right: 20,
    top: '35%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  zoomButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  zoomIndicatorText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '700',
    marginVertical: 2,
  },
  bottomControls: {
    width: '100%',
    paddingBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  galleryButton: {
    width: 60,
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
  },
  galleryPreview: {
    flex: 1,
    backgroundColor: '#333',
  },
  rightPlaceholder: {
    width: 60,
  },
  flashButton: {
    alignSelf: 'flex-end',
    width: 80,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  flashButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
});