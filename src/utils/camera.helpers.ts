/**
 * Camera and Media Picker Helper Utilities
 * Reusable functions for image processing and validation
 */

import { Platform } from 'react-native';
import {
  DEFAULT_IMAGE_DIMENSIONS,
  MINIMUM_IMAGE_DIMENSIONS,
  MAX_FILE_SIZE,
  SUPPORTED_IMAGE_TYPES,
  PICKER_ERROR_CODES,
} from '../constants/camera.constants';
import {
  NormalizedImage,
  NormalizedPickerAsset,
  ImageValidationResult,
  RawPickerResponse,
} from '../types/camera';

/**
 * Ensures a URI has the file:// protocol
 * Handles both iOS and Android path variations
 *
 * @param uri - The URI to normalize
 * @returns File URI with proper protocol
 */
export const ensureFileUri = (uri: string | undefined): string => {
  if (!uri) {
    return '';
  }

  // iOS can return file:// URIs directly
  if (Platform.OS === 'ios') {
    if (!uri.startsWith('file://')) {
      return `file://${uri}`;
    }
    return uri;
  }

  // Android scoped storage returns content:// URIs
  // For Android 10+, we keep content:// URIs as-is
  // For older Android, convert to file://
  if (Platform.OS === 'android') {
    if (uri.startsWith('content://')) {
      return uri;
    }
    if (!uri.startsWith('file://')) {
      return `file://${uri}`;
    }
    return uri;
  }

  return uri;
};

/**
 * Normalizes image dimensions, using fallback values if needed
 * Ensures dimensions are always valid numbers
 *
 * @param width - Image width (can be undefined)
 * @param height - Image height (can be undefined)
 * @returns Normalized dimensions object
 */
export const normalizeImageDimensions = (
  width?: number | null,
  height?: number | null,
): { width: number; height: number } => {
  const normalizedWidth =
    typeof width === 'number' && width > 0 ? width : DEFAULT_IMAGE_DIMENSIONS.width;
  const normalizedHeight =
    typeof height === 'number' && height > 0 ? height : DEFAULT_IMAGE_DIMENSIONS.height;

  return {
    width: normalizedWidth,
    height: normalizedHeight,
  };
};

/**
 * Validates image asset for required fields and constraints
 *
 * @param asset - Asset to validate
 * @returns Validation result with error details if invalid
 */
export const isValidImageAsset = (
  asset: Partial<NormalizedPickerAsset> | undefined | null,
): ImageValidationResult => {
  // Check if asset exists
  if (!asset) {
    return {
      isValid: false,
      error: 'No asset provided',
      errorCode: PICKER_ERROR_CODES.INVALID_ASSET,
    };
  }

  // Check if URI exists
  if (!asset.uri || typeof asset.uri !== 'string') {
    return {
      isValid: false,
      error: 'Missing or invalid URI',
      errorCode: PICKER_ERROR_CODES.MISSING_URI,
    };
  }

  // Validate dimensions
  const width = asset.width ?? DEFAULT_IMAGE_DIMENSIONS.width;
  const height = asset.height ?? DEFAULT_IMAGE_DIMENSIONS.height;

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width < MINIMUM_IMAGE_DIMENSIONS.width ||
    height < MINIMUM_IMAGE_DIMENSIONS.height
  ) {
    return {
      isValid: false,
      error: 'Invalid image dimensions',
      errorCode: PICKER_ERROR_CODES.INVALID_DIMENSIONS,
    };
  }

  // Validate file size if available
  if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'File size exceeds maximum allowed',
      errorCode: PICKER_ERROR_CODES.FILE_SIZE_EXCEEDED,
    };
  }

  // Validate MIME type if available
  if (asset.type && !SUPPORTED_IMAGE_TYPES.includes(asset.type as any)) {
    return {
      isValid: false,
      error: 'Unsupported image type',
      errorCode: PICKER_ERROR_CODES.UNSUPPORTED_TYPE,
    };
  }

  return { isValid: true };
};

/**
 * Normalizes raw picker response to consistent format
 * Extracts first asset if available and validates it
 *
 * @param response - Raw picker response
 * @returns Normalized asset or undefined if invalid
 */
export const normalizePickerAsset = (
  response: RawPickerResponse | undefined,
): NormalizedPickerAsset | undefined => {
  if (!response?.assets || !Array.isArray(response.assets) || response.assets.length === 0) {
    return undefined;
  }

  const rawAsset = response.assets[0];
  if (!rawAsset) {
    return undefined;
  }

  const normalized: NormalizedPickerAsset = {
    uri: rawAsset.uri || '',
    width: rawAsset.width || DEFAULT_IMAGE_DIMENSIONS.width,
    height: rawAsset.height || DEFAULT_IMAGE_DIMENSIONS.height,
    type: rawAsset.type,
    fileName: rawAsset.fileName,
    fileSize: rawAsset.fileSize,
  };

  return normalized;
};

/**
 * Normalizes raw picker response for multiple assets
 *
 * @param response - Raw picker response
 * @returns Array of normalized picker assets
 */
export const normalizeMultiplePickerAssets = (
  response: RawPickerResponse | undefined,
): NormalizedPickerAsset[] => {
  if (!response?.assets || !Array.isArray(response.assets)) {
    return [];
  }

  return response.assets
    .map((rawAsset) => ({
      uri: rawAsset.uri || '',
      width: rawAsset.width || DEFAULT_IMAGE_DIMENSIONS.width,
      height: rawAsset.height || DEFAULT_IMAGE_DIMENSIONS.height,
      type: rawAsset.type,
      fileName: rawAsset.fileName,
      fileSize: rawAsset.fileSize,
    }))
    .filter(isCompletelyValidImage);
};

/**
 * Creates a StoryImage object from normalized picker asset
 * Ensures proper URI format and dimensions
 *
 * @param asset - Normalized picker asset
 * @returns StoryImage object ready for navigation
 */
export const createStoryImage = (asset: NormalizedPickerAsset): NormalizedImage => {
  const uri = ensureFileUri(asset.uri);
  const { width, height } = normalizeImageDimensions(asset.width, asset.height);

  return {
    uri,
    width,
    height,
    type: asset.type,
    fileName: asset.fileName,
  };
};

/**
 * Handles errors from media picker operations
 * Returns appropriate error message and code
 *
 * @param error - Error object from picker or operation
 * @returns Error message and code
 */
export const handleMediaPickerError = (
  error: any,
): { message: string; code: string } => {
  if (!error) {
    return {
      message: 'Unknown error occurred',
      code: PICKER_ERROR_CODES.UNKNOWN_ERROR,
    };
  }

  // String error
  if (typeof error === 'string') {
    if (error.toLowerCase().includes('permission')) {
      return {
        message: 'Camera/Gallery permission denied',
        code: PICKER_ERROR_CODES.PERMISSION_DENIED,
      };
    }
    return {
      message: error,
      code: PICKER_ERROR_CODES.UNKNOWN_ERROR,
    };
  }

  // Error object
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes('permission')) {
      return {
        message: 'Camera/Gallery permission denied',
        code: PICKER_ERROR_CODES.PERMISSION_DENIED,
      };
    }
    return {
      message: error.message || 'Unknown error occurred',
      code: PICKER_ERROR_CODES.UNKNOWN_ERROR,
    };
  }

  // Object with message property
  if (error.message) {
    return {
      message: error.message,
      code: error.code || PICKER_ERROR_CODES.UNKNOWN_ERROR,
    };
  }

  return {
    message: 'An unknown error occurred',
    code: PICKER_ERROR_CODES.UNKNOWN_ERROR,
  };
};

/**
 * Validates complete image before navigation
 * Performs all necessary checks in one operation
 *
 * @param asset - Raw asset from picker
 * @returns True if valid, false otherwise
 */
export const isCompletelyValidImage = (
  asset: Partial<NormalizedPickerAsset> | undefined,
): asset is NormalizedPickerAsset => {
  const validation = isValidImageAsset(asset);
  return validation.isValid;
};
