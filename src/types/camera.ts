/**
 * Camera and Media Picker Type Definitions
 * Defines all types related to camera operations and media picking
 */

import { ImagePickerResponse } from 'react-native-image-picker';

/**
 * Normalized image representation for internal use
 * Ensures consistent shape across Android/iOS
 */
export interface NormalizedImage {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileName?: string;
}

/**
 * Normalized asset from image picker
 * Provides consistent interface for camera and gallery responses
 */
export interface NormalizedPickerAsset {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileName?: string;
  fileSize?: number;
}

/**
 * Media picker response wrapper
 * Normalizes responses from launchCamera and launchImageLibrary
 */
export interface MediaPickerResponse {
  success: boolean;
  asset?: NormalizedPickerAsset;
  error?: string;
  errorCode?: string;
  didCancel?: boolean;
}

/**
 * Raw response from react-native-image-picker
 * Used internally before normalization
 */
export interface RawPickerResponse extends ImagePickerResponse {
  assets?: Array<{
    uri?: string;
    width?: number;
    height?: number;
    fileSize?: number;
    type?: string;
    fileName?: string;
  }>;
}

/**
 * Camera permission state
 */
export interface CameraPermissionState {
  hasPermission: boolean;
  isBlocked: boolean;
  isDenied: boolean;
  isLoading: boolean;
}

/**
 * Image validation result
 */
export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  errorCode?: string;
}
