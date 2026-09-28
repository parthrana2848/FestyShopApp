import { useState, useEffect } from 'react';
import {
  checkMicrophonePermission,
  checkCameraPermission,
  requestMicrophonePermission,
  requestCameraPermission,
  PermissionStatus,
} from '../../../modules/video-call/utils/permissions.utils';

export type VoicePermissionState = {
  microphone: PermissionStatus;
  camera: PermissionStatus;
  isLoading: boolean;
};

export function useVoicePermissions() {
  const [permissions, setPermissions] = useState<VoicePermissionState>({
    microphone: 'unavailable',
    camera: 'unavailable',
    isLoading: true,
  });

  const checkPermissions = async () => {
    setPermissions(prev => ({ ...prev, isLoading: true }));
    const [mic, cam] = await Promise.all([
      checkMicrophonePermission(),
      checkCameraPermission(),
    ]);
    setPermissions({
      microphone: mic,
      camera: cam,
      isLoading: false,
    });
  };

  const requestPermissions = async (): Promise<{
    microphone: PermissionStatus;
    camera: PermissionStatus;
  }> => {
    const [mic, cam] = await Promise.all([
      requestMicrophonePermission(),
      requestCameraPermission(),
    ]);
    setPermissions({
      microphone: mic,
      camera: cam,
      isLoading: false,
    });
    return { microphone: mic, camera: cam };
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return {
    permissions,
    checkPermissions,
    requestPermissions,
  };
}
