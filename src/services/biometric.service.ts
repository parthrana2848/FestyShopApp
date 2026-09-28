import ReactNativeBiometrics from 'react-native-biometrics';
import { BiometricAvailability, BiometricAuthResult, BiometricType } from '../types/biometric.types';
import { BIOMETRIC_FACE_ID, BIOMETRIC_FINGERPRINT, BIOMETRIC_TOUCH_ID } from '../constants/biometric.constants';
import biometricLogger from '../utils/biometric.logger';

const rnBiometrics = new ReactNativeBiometrics();

const mapBiometryType = (biometryType: string | null | undefined): BiometricType => {
  if (!biometryType) return null;
  // `react-native-biometrics` returns string identifiers such as 'FaceID', 'TouchID', 'Biometrics' or 'Fingerprint'.
  if (biometryType === 'FaceID') return BIOMETRIC_FACE_ID;
  if (biometryType === 'TouchID') return BIOMETRIC_TOUCH_ID;
  if (biometryType === 'Biometrics' || biometryType === 'Fingerprint') return BIOMETRIC_FINGERPRINT;
  return null;
};

export const isBiometricAvailable = async (): Promise<BiometricAvailability> => {
  try {
    const result = await rnBiometrics.isSensorAvailable();
    const { available, biometryType } = result as { available: boolean; biometryType?: string };
    const mapped = mapBiometryType(biometryType);
    biometricLogger.info('[Biometric] Sensor availability checked', { available, biometryType: mapped });
    return { available: !!available, biometryType: mapped };
  } catch (error) {
    const err = error as Error;
    biometricLogger.error('[Biometric] Sensor availability error', { message: err.message });
    return { available: false, biometryType: null, reason: err.message };
  }
};

export const getBiometricType = async (): Promise<BiometricType> => {
  const avail = await isBiometricAvailable();
  return avail.available ? avail.biometryType : null;
};

export const authenticate = async (promptMessage = 'Authenticate'): Promise<BiometricAuthResult> => {
  try {
    biometricLogger.info('[Biometric] Authentication Started');
    const result = await rnBiometrics.simplePrompt({ promptMessage });
    const { success } = result as { success: boolean };
    if (success) {
      biometricLogger.info('[Biometric] Authentication Success');
      return { success: true };
    }
    biometricLogger.info('[Biometric] Authentication Failed - user cancelled or not recognized');
    return { success: false, errorMessage: 'Authentication failed' };
  } catch (error) {
    const err = error as any;
    // library throws on cancel with message 'User cancelled biometric prompt' or similar
    biometricLogger.warn('[Biometric] Authentication Exception', { message: err?.message ?? String(err) });
    return {
      success: false,
      errorCode: err?.name ?? 'BIOMETRIC_ERROR',
      errorMessage: err?.message ?? 'Unknown biometric error',
    };
  }
};

// enable/disable helpers are intentionally thin: storage of preference is handled in storage helper
export const enableBiometric = async (promptMessage = 'Enable biometric authentication'): Promise<BiometricAuthResult> => {
  return authenticate(promptMessage);
};

export const disableBiometric = async (): Promise<BiometricAuthResult> => {
  // No native teardown required for react-native-biometrics when only using simplePrompt
  biometricLogger.info('[Biometric] Disable requested');
  return { success: true };
};
