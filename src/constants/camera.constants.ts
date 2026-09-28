/**
 * Camera and Media Picker Constants
 * Centralized configuration for all media picker operations
 */

import { Dimensions } from 'react-native';
import { CameraOptions, ImageLibraryOptions } from 'react-native-image-picker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Default image dimensions when not available from picker response
 */
export const DEFAULT_IMAGE_DIMENSIONS = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
} as const;

/**
 * Minimum image dimensions to consider valid
 */
export const MINIMUM_IMAGE_DIMENSIONS = {
  width: 100,
  height: 100,
} as const;

/**
 * Maximum file size in bytes (10 MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Supported image MIME types
 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

/**
 * Camera picker options for launching camera
 * Optimized for story capture
 */
export const CAMERA_PICKER_OPTIONS: CameraOptions = {
  mediaType: 'photo',
  quality: 0.8,
  saveToPhotos: true,
  cameraType: 'back',
  presentationStyle: 'fullScreen',
  includeBase64: false,
};

/**
 * Gallery picker options for selecting images
 * Optimized for single image selection
 */
export const GALLERY_PICKER_OPTIONS: ImageLibraryOptions = {
  mediaType: 'photo',
  selectionLimit: 1,
  quality: 0.8,
  presentationStyle: 'fullScreen',
  includeBase64: false,
};

/**
 * Error codes for image picker operations
 */
export const PICKER_ERROR_CODES = {
  CANCELLED: 'cancelled',
  INVALID_ASSET: 'invalid_asset',
  MISSING_URI: 'missing_uri',
  INVALID_DIMENSIONS: 'invalid_dimensions',
  UNSUPPORTED_TYPE: 'unsupported_type',
  FILE_SIZE_EXCEEDED: 'file_size_exceeded',
  PERMISSION_DENIED: 'permission_denied',
  UNKNOWN_ERROR: 'unknown_error',
} as const;

/**
 * Timeout for image picker operations (ms)
 */
export const PICKER_TIMEOUT = 30000;
