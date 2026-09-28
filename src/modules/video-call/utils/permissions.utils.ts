import { Platform, Alert, Linking } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import { PERMISSION_STRINGS, COMMON_STRINGS } from '../constants/videoCallStrings';

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable';

const CAMERA_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.CAMERA,
  android: PERMISSIONS.ANDROID.CAMERA,
})!;

const MICROPHONE_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.MICROPHONE,
  android: PERMISSIONS.ANDROID.RECORD_AUDIO,
})!;

function mapResult(result: string): PermissionStatus {
  switch (result) {
    case RESULTS.GRANTED:
    case RESULTS.LIMITED:
      return 'granted';
    case RESULTS.DENIED:
      return 'denied';
    case RESULTS.BLOCKED:
      return 'blocked';
    case RESULTS.UNAVAILABLE:
    default:
      return 'unavailable';
  }
}

export async function checkCameraPermission(): Promise<PermissionStatus> {
  const result = await check(CAMERA_PERMISSION);
  return mapResult(result);
}

export async function checkMicrophonePermission(): Promise<PermissionStatus> {
  const result = await check(MICROPHONE_PERMISSION);
  return mapResult(result);
}

export async function requestCameraPermission(): Promise<PermissionStatus> {
  const result = await request(CAMERA_PERMISSION);
  return mapResult(result);
}

export async function requestMicrophonePermission(): Promise<PermissionStatus> {
  const result = await request(MICROPHONE_PERMISSION);
  return mapResult(result);
}

export async function requestCallPermissions(): Promise<{
  camera: PermissionStatus;
  microphone: PermissionStatus;
}> {
  let camera = await checkCameraPermission();
  let microphone = await checkMicrophonePermission();

  if (camera === 'denied') {
    camera = await requestCameraPermission();
  }

  if (microphone === 'denied') {
    microphone = await requestMicrophonePermission();
  }

  return { camera, microphone };
}

export function showPermissionBlockedAlert(): void {
  Alert.alert(
    PERMISSION_STRINGS.SETTINGS_TITLE,
    PERMISSION_STRINGS.SETTINGS_MESSAGE,
    [
      {
        text: PERMISSION_STRINGS.NOT_NOW,
        style: 'cancel',
      },
      {
        text: PERMISSION_STRINGS.OPEN_SETTINGS,
        onPress: () => {
          openSettings().catch(() => {
            Linking.openSettings();
          });
        },
      },
    ],
  );
}

export async function ensureCallPermissions(): Promise<boolean> {
  const { camera, microphone } = await requestCallPermissions();

  if (camera === 'granted' && microphone === 'granted') {
    return true;
  }

  if (camera === 'blocked' || microphone === 'blocked') {
    showPermissionBlockedAlert();
    return false;
  }

  if (camera !== 'granted' || microphone !== 'granted') {
    Alert.alert(
      PERMISSION_STRINGS.CAMERA_TITLE,
      PERMISSION_STRINGS.CAMERA_MESSAGE,
      [{ text: COMMON_STRINGS.OK }],
    );
    return false;
  }

  return false;
}
