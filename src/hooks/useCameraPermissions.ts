// /**
//  * Camera Permissions Hook
//  * Manages camera and gallery permissions for both iOS and Android
//  * Handles permission states: granted, denied, blocked
//  */

// import { useCallback, useEffect, useState } from 'react';
// import {
//   Platform,
//   PermissionsAndroid,
//   Linking,
//   Alert,
// } from 'react-native';
// import { CameraPermissionState } from '../types/camera';

// /**
//  * Requests camera permissions on Android
//  * Uses PermissionsAndroid API
//  *
//  * @returns Promise resolving to boolean indicating if permission was granted
//  */
// const requestCameraPermissionAndroid = async (): Promise<boolean> => {
//   try {
//     const result = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.CAMERA,
//       {
//         title: 'Camera Permission',
//         message: 'FreshShop needs access to your camera to capture product images',
//         buttonNegative: 'Cancel',
//         buttonPositive: 'OK',
//       },
//     );

//     return result === PermissionsAndroid.RESULTS.GRANTED;
//   } catch (error) {
//     return false;
//   }
// };

// /**
//  * Checks camera permission status on Android
//  * Returns: granted, denied, or never_asked
//  *
//  * @returns Promise resolving to permission status string
//  */
// const checkCameraPermissionAndroid = async (): Promise<string> => {
//   try {
//     const result = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
//     return result ? 'granted' : 'denied';
//   } catch (error) {
//     return 'unknown';
//   }
// };

// /**
//  * Opens app settings on Android/iOS
//  * Allows user to manually enable permissions
//  */
// const openAppSettings = (): void => {
//   if (Platform.OS === 'ios') {
//     Linking.openURL('app-settings:');
//   } else if (Platform.OS === 'android') {
//     Linking.openSettings();
//   }
// };

// /**
//  * Determines if user should be prompted to go to settings
//  * iOS: Permissions API doesn't expose "blocked" state, so we assume manual intervention needed
//  * Android: Can check if permission is permanently denied
//  */
// const shouldPromptSettings = async (): Promise<boolean> => {
//   if (Platform.OS === 'ios') {
//     // iOS doesn't provide a direct API to check if permission is blocked
//     // We rely on user feedback through repeated denials
//     return false;
//   }

//   if (Platform.OS === 'android') {
//     try {
//       // Check if permission is granted
//       const isGranted = await PermissionsAndroid.check(
//         PermissionsAndroid.PERMISSIONS.CAMERA,
//       );
//       return !isGranted;
//     } catch (error) {
//       return false;
//     }
//   }

//   return false;
// };

// /**
//  * Hook for managing camera and gallery permissions
//  * Handles Android and iOS differences
//  *
//  * @returns Permission state and request function
//  */
// export const useCameraPermissions = () => {
//   const [permissionState, setPermissionState] = useState<CameraPermissionState>({
//     hasPermission: false,
//     isBlocked: false,
//     isDenied: false,
//     isLoading: true,
//   });

//   /**
//    * Check current permission status
//    */
//   const checkPermissionStatus = useCallback(async () => {
//     setPermissionState((prev) => ({ ...prev, isLoading: true }));

//     try {
//       if (Platform.OS === 'android') {
//         const status = await checkCameraPermissionAndroid();

//         setPermissionState({
//           hasPermission: status === 'granted',
//           isBlocked: false,
//           isDenied: status === 'denied',
//           isLoading: false,
//         });
//       } else if (Platform.OS === 'ios') {
//         // On iOS, react-native-image-picker handles permission requests
//         // We can only assume permission is granted if user hasn't denied
//         // In practice, the picker will request permission when needed
//         setPermissionState({
//           hasPermission: true, // Optimistic: will request when picker opens
//           isBlocked: false,
//           isDenied: false,
//           isLoading: false,
//         });
//       } else {
//         setPermissionState({
//           hasPermission: true,
//           isBlocked: false,
//           isDenied: false,
//           isLoading: false,
//         });
//       }
//     } catch (error) {
//       // On error, assume permissions need to be requested
//       setPermissionState({
//         hasPermission: false,
//         isBlocked: false,
//         isDenied: false,
//         isLoading: false,
//       });
//     }
//   }, []);

//   /**
//    * Request camera permission
//    */
//   const requestPermission = useCallback(async (): Promise<boolean> => {
//     setPermissionState((prev) => ({ ...prev, isLoading: true }));

//     try {
//       if (Platform.OS === 'android') {
//         const result = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.CAMERA,
//           {
//             title: 'Camera Permission',
//             message: 'FreshShop needs access to your camera to capture product images',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'OK',
//           },
//         );

//         if (result === PermissionsAndroid.RESULTS.GRANTED) {
//           setPermissionState({
//             hasPermission: true,
//             isBlocked: false,
//             isDenied: false,
//             isLoading: false,
//           });
//           return true;
//         }

//         setPermissionState({
//           hasPermission: false,
//           isBlocked: false,
//           isDenied: true,
//           isLoading: false,
//         });

//         return false;
//       } else {
//         // iOS: react-native-image-picker will handle permission requests
//         // Return true optimistically
//         setPermissionState({
//           hasPermission: true,
//           isBlocked: false,
//           isDenied: false,
//           isLoading: false,
//         });
//         return true;
//       }
//     } catch (error) {
//       setPermissionState({
//         hasPermission: false,
//         isBlocked: false,
//         isDenied: false,
//         isLoading: false,
//       });
//       return false;
//     }
//   }, []);

//   /**
//    * Check permissions on mount
//    */
//   useEffect(() => {
//     checkPermissionStatus();
//   }, [checkPermissionStatus]);

//   return {
//     hasPermission: permissionState.hasPermission,
//     isBlocked: permissionState.isBlocked,
//     isDenied: permissionState.isDenied,
//     isLoading: permissionState.isLoading,
//     requestPermission,
//     openSettings: openAppSettings,
//     checkPermission: checkPermissionStatus,
//   };
// };

import { Linking } from 'react-native';

import {
  useCameraPermission,
} from 'react-native-vision-camera';

export const useCameraPermissions = () => {
  const {
    hasPermission,
    requestPermission,
  } = useCameraPermission();

  const openSettings = () => {
    Linking.openSettings();
  };

  return {
    hasPermission,
    isBlocked: false,
    isLoading: false,
    requestPermission,
    openSettings,
  };
};