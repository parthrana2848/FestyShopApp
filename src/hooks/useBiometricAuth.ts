import { useCallback, useState } from 'react';
import { isBiometricAvailable, authenticate, enableBiometric as serviceEnable, disableBiometric as serviceDisable, getBiometricType } from '../services/biometric.service';
import { biometricStorage } from '../storage/biometric.storage';
import { BiometricAuthResult, BiometricPreference } from '../types/biometric.types';
import { biometricLogger } from '../utils/biometric.logger';
import { useAuth } from '../context/AuthContext';

export const useBiometricAuth = () => {
  const { loginWithBiometric } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBiometricAvailableOnDevice = useCallback(async () => {
    const res = await isBiometricAvailable();
    return res;
  }, []);

  const isBiometricEnabled = useCallback(async (): Promise<BiometricPreference> => {
    return biometricStorage.getBiometricPreference();
  }, []);

  const enableBiometric = useCallback(async (): Promise<BiometricAuthResult> => {
    setLoading(true);
    setError(null);
    try {
      const auth = await serviceEnable('Confirm biometric to enable');
      if (!auth.success) {
        biometricLogger.warn('User failed biometric enable', { error: auth.errorMessage });
        await biometricStorage.saveBiometricPreference(false);
        return auth;
      }
      await biometricStorage.saveBiometricPreference(true);
      biometricLogger.info('Biometric enabled by user');
      return { success: true };
    } catch (e) {
      const err = e as Error;
      setError(err.message);
      biometricLogger.error('Enable biometric error', { message: err.message });
      return { success: false, errorMessage: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const disableBiometric = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await serviceDisable();
      await biometricStorage.removeBiometricPreference();
      biometricLogger.info('Biometric disabled by user');
    } catch (e) {
      const err = e as Error;
      setError(err.message);
      biometricLogger.error('Disable biometric error', { message: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithBiometrics = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const auth = await authenticate('Unlock with biometrics');
      if (!auth.success) {
        biometricLogger.warn('Biometric login failed', { message: auth.errorMessage });
        return false;
      }
      // delegate to AuthContext to restore session from stored token
      await loginWithBiometric();
      biometricLogger.info('Biometric login succeeded');
      return true;
    } catch (e) {
      const err = e as Error;
      setError(err.message);
      biometricLogger.error('Biometric login exception', { message: err.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [loginWithBiometric]);

  const getBiometryType = useCallback(async () => {
    return getBiometricType();
  }, []);

  return {
    enableBiometric,
    disableBiometric,
    loginWithBiometrics,
    isBiometricAvailable: isBiometricAvailableOnDevice,
    isBiometricEnabled,
    loading,
    error,
    getBiometryType,
  };
};
