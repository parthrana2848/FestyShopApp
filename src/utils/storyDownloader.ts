import {
  Alert,
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import {captureRef} from 'react-native-view-shot';

const {ImageSaver} = NativeModules;

/**
 * Request gallery/storage permission
 */
export const requestGalleryPermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  // For Android 10+ (API 29+), no permissions are needed to save to MediaStore.
  if (Number(Platform.Version) >= 29) {
    return true;
  }

  // For Android 9 and below, we need WRITE_EXTERNAL_STORAGE
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
};

/**
 * Capture story and save to gallery
 */
export const downloadStoryImage = async (
  storyRef: React.RefObject<any>,
) => {

  try {

    const hasPermission =
      await requestGalleryPermission();

    if (!hasPermission) {

      Alert.alert(
        'Permission denied',
      );

      return;
    }

    // Capture story view
    const uri = await captureRef(storyRef, {
      format: 'jpg',
      quality: 1,
    });

    // Save to gallery
    await ImageSaver.saveImage(uri);

    Alert.alert(
      'Success',
      'Image saved to gallery',
    );

  } catch (error) {

    console.log(
      'DOWNLOAD_ERROR',
      error,
    );

    Alert.alert(
      'Error',
      'Failed to save image',
    );
  }
};
