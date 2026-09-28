export type BiometricType = 'FaceID' | 'TouchID' | 'Fingerprint' | null;

export interface BiometricAvailability {
  available: boolean;
  biometryType: BiometricType;
  reason?: string;
}

export interface BiometricAuthResult {
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
}

export type BiometricPreference = boolean | null; // true = enabled, false = disabled, null = not set

export interface BiometricError {
  code: string;
  message: string;
}
