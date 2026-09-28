/**
 * Media Picker Service
 * Abstracts react-native-image-picker logic and normalizes responses
 * Isolates picker implementation from UI layer
 */

import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  CAMERA_PICKER_OPTIONS,
  GALLERY_PICKER_OPTIONS,
  PICKER_ERROR_CODES,
  PICKER_TIMEOUT,
} from '../constants/camera.constants';
import {
  MediaPickerResponse,
  NormalizedPickerAsset,
  RawPickerResponse,
} from '../types/camera';
import {
  normalizePickerAsset,
  normalizeMultiplePickerAssets,
  handleMediaPickerError,
  isCompletelyValidImage,
} from '../utils/camera.helpers';

/**
 * Opens device camera for photo capture
 * Handles permission requests and normalizes response
 *
 * @returns Promise with normalized media response
 */
export const openCamera = async (): Promise<MediaPickerResponse> => {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      resolve({
        success: false,
        error: 'Camera operation timed out',
        errorCode: PICKER_ERROR_CODES.UNKNOWN_ERROR,
      });
    }, PICKER_TIMEOUT);

    try {
      launchCamera(CAMERA_PICKER_OPTIONS, (response: RawPickerResponse) => {
        clearTimeout(timeoutId);

        // Handle user cancellation
        if (response.didCancel) {
          resolve({
            success: false,
            didCancel: true,
            error: 'Camera cancelled',
            errorCode: PICKER_ERROR_CODES.CANCELLED,
          });
          return;
        }

        // Handle errors from camera
        if (response.errorCode) {
          const { message, code } = handleMediaPickerError(response.errorMessage);
          resolve({
            success: false,
            error: message,
            errorCode: code,
          });
          return;
        }

        // Normalize asset from response
        const asset = normalizePickerAsset(response);

        // Validate normalized asset
        if (!isCompletelyValidImage(asset)) {
          const { message, code } = handleMediaPickerError('Invalid asset returned from camera');
          resolve({
            success: false,
            error: message,
            errorCode: code,
          });
          return;
        }

        // Success case
        resolve({
          success: true,
          asset,
        });
      });
    } catch (error) {
      clearTimeout(timeoutId);
      const { message, code } = handleMediaPickerError(error);
      resolve({
        success: false,
        error: message,
        errorCode: code,
      });
    }
  });
};

/**
 * Opens device gallery for image selection
 * Supports single image selection only
 * Handles scoped storage on Android
 *
 * @returns Promise with normalized media response
 */
export const openGallery = async (): Promise<MediaPickerResponse> => {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      resolve({
        success: false,
        error: 'Gallery operation timed out',
        errorCode: PICKER_ERROR_CODES.UNKNOWN_ERROR,
      });
    }, PICKER_TIMEOUT);

    try {
      launchImageLibrary(GALLERY_PICKER_OPTIONS, (response: RawPickerResponse) => {
        clearTimeout(timeoutId);

        // Handle user cancellation
        if (response.didCancel) {
          resolve({
            success: false,
            didCancel: true,
            error: 'Gallery selection cancelled',
            errorCode: PICKER_ERROR_CODES.CANCELLED,
          });
          return;
        }

        // Handle errors from gallery
        if (response.errorCode) {
          const { message, code } = handleMediaPickerError(response.errorMessage);
          resolve({
            success: false,
            error: message,
            errorCode: code,
          });
          return;
        }

        // Normalize asset from response
        const asset = normalizePickerAsset(response);

        // Validate normalized asset
        if (!isCompletelyValidImage(asset)) {
          const { message, code } = handleMediaPickerError('Invalid asset returned from gallery');
          resolve({
            success: false,
            error: message,
            errorCode: code,
          });
          return;
        }

        // Success case
        resolve({
          success: true,
          asset,
        });
      });
    } catch (error) {
      clearTimeout(timeoutId);
      const { message, code } = handleMediaPickerError(error);
      resolve({
        success: false,
        error: message,
        errorCode: code,
      });
    }
  });
};

/**
 * Opens device gallery for picking multiple images
 * Used for collage editor
 *
 * @param limit - Maximum number of images to select
 * @returns Promise with normalized assets array
 */
export const openMultipleGallery = async (
  limit: number = 5,
): Promise<{
  success: boolean;
  assets?: NormalizedPickerAsset[];
  error?: string;
  errorCode?: string;
  didCancel?: boolean;
}> => {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      resolve({
        success: false,
        error: 'Gallery operation timed out',
        errorCode: PICKER_ERROR_CODES.UNKNOWN_ERROR,
      });
    }, PICKER_TIMEOUT);

    try {
      launchImageLibrary(
        {
          mediaType: 'photo',
          selectionLimit: limit,
          quality: 0.8,
          presentationStyle: 'fullScreen',
          includeBase64: false,
        },
        (response: RawPickerResponse) => {
          clearTimeout(timeoutId);

          if (response.didCancel) {
            resolve({
              success: false,
              didCancel: true,
              error: 'Gallery selection cancelled',
              errorCode: PICKER_ERROR_CODES.CANCELLED,
            });
            return;
          }

          if (response.errorCode) {
            const { message, code } = handleMediaPickerError(response.errorMessage);
            resolve({
              success: false,
              error: message,
              errorCode: code,
            });
            return;
          }

          const assets = normalizeMultiplePickerAssets(response);

          if (assets.length === 0) {
            const { message, code } = handleMediaPickerError('No valid images selected');
            resolve({
              success: false,
              error: message,
              errorCode: code,
            });
            return;
          }

          resolve({
            success: true,
            assets,
          });
        },
      );
    } catch (error) {
      clearTimeout(timeoutId);
      const { message, code } = handleMediaPickerError(error);
      resolve({
        success: false,
        error: message,
        errorCode: code,
      });
    }
  });
};

/**
 * Validates picker response before use
 * Useful for defensive programming
 *
 * @param response - Response to validate
 * @returns True if response is valid and has an asset
 */
export const isValidPickerResponse = (response: MediaPickerResponse): boolean => {
  return response.success && !!response.asset;
};

/**
 * Gets user-friendly error message from picker response
 *
 * @param response - Media picker response
 * @returns Human-readable error message or empty string if no error
 */
export const getPickerErrorMessage = (response: MediaPickerResponse): string => {
  if (response.success) {
    return '';
  }

  if (response.didCancel) {
    return 'Image selection was cancelled';
  }

  return response.error || 'An error occurred while selecting an image';
};
