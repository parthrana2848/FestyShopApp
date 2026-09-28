import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BiometricType } from '../../../types/biometric.types';
// import { BiometricType } from '../types/biometric.types';

type Props = {
  visible: boolean;
  biometricType: BiometricType;
  onConfirm: () => void;
  onCancel: () => void;
};

const titleForType = (t: BiometricType) => {
  if (t === 'FaceID') return 'Enable Face ID?';
  if (t === 'TouchID') return 'Enable Touch ID?';
  if (t === 'Fingerprint') return 'Enable Fingerprint?';
  return 'Enable Biometric Login?';
};

const messageForType = (t: BiometricType) => {
  if (t === 'FaceID') return 'Use Face ID to sign in quickly and securely.';
  if (t === 'TouchID') return 'Use Touch ID to sign in quickly and securely.';
  if (t === 'Fingerprint') return 'Use Fingerprint to sign in quickly and securely.';
  return 'Use biometric authentication to sign in quickly and securely.';
};

export const BiometricEnableModal: React.FC<Props> = ({ visible, biometricType, onConfirm, onCancel }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{titleForType(biometricType)}</Text>
          <Text style={styles.message}>{messageForType(biometricType)}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onCancel}>
              <Text style={styles.cancelText}>Not now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirm]} onPress={onConfirm}>
              <Text style={styles.confirmText}>Enable</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '86%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#444',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancel: {
    backgroundColor: '#eee',
  },
  confirm: {
    backgroundColor: '#0a84ff',
  },
  cancelText: {
    color: '#333',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default BiometricEnableModal;
