import AsyncStorage from '@react-native-async-storage/async-storage';
import { BIOMETRIC_ENABLED_KEY } from '../constants/biometric.constants';
import { BiometricPreference } from '../types/biometric.types';
import biometricLogger from '../utils/biometric.logger';

export const biometricStorage = {
  async saveBiometricPreference(value: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, value ? 'true' : 'false');
      biometricLogger.info('[Biometric] Preference saved', { enabled: value });
    } catch (error) {
      biometricLogger.error('[Biometric] Failed to save preference', { message: (error as Error).message });
      throw error;
    }
  },

  async getBiometricPreference(): Promise<BiometricPreference> {
    try {
      const raw = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      if (raw === null) return null;
      return raw === 'true';
    } catch (error) {
      biometricLogger.error('[Biometric] Failed to read preference', { message: (error as Error).message });
      return null;
    }
  },

  async removeBiometricPreference(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
      biometricLogger.info('[Biometric] Preference removed');
    } catch (error) {
      biometricLogger.error('[Biometric] Failed to remove preference', { message: (error as Error).message });
      throw error;
    }
  },
};
