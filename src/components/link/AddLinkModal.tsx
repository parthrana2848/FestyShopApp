import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { validateUrl, extractDomainFromUrl, formatLinkTitle } from '../../services/link/link.service';
import { LINK_CONSTANTS } from '../../constants/link.constants';
import type { LinkValidationResult } from '../../types/link.types';

interface AddLinkModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (url: string, title: string) => void;
  initialUrl?: string;
  initialTitle?: string;
}

/**
 * AddLinkModal provides URL and title input for creating link stickers.
 * Features:
 * - URL validation with live feedback
 * - Auto-suggested title from domain
 * - Character limits
 * - User-friendly error messages
 */
export const AddLinkModal: React.FC<AddLinkModalProps> = ({
  visible,
  onClose,
  onSave,
  initialUrl,
  initialTitle,
}) => {
  const [url, setUrl] = useState(initialUrl || '');
  const [title, setTitle] = useState(initialTitle || '');
  const [validation, setValidation] = useState<LinkValidationResult>({ isValid: false });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setUrl(initialUrl || '');
      setTitle(initialTitle || '');
      setValidation({ isValid: false });
    }
  }, [visible, initialUrl, initialTitle]);

  // Validate URL on change
  useEffect(() => {
    if (url.trim()) {
      const result = validateUrl(url);
      setValidation(result);

      // Auto-suggest title from domain if user hasn't entered one
      if (!title && result.isValid) {
        const suggested = extractDomainFromUrl(url);
        setTitle(suggested);
      }
    } else {
      setValidation({ isValid: false });
    }
  }, [url]);

  const handleSave = async () => {
    if (!validation.isValid || !url.trim() || !title.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      onSave(url.trim(), title.trim());
      onClose();
    } catch (error) {
      console.error('Error saving link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible) return null;

  const isFormValid = validation.isValid && url.trim() && title.trim();
  const titleLength = title.length;
  const showCharacterWarning = titleLength > LINK_CONSTANTS.MAX_TITLE_LENGTH * 0.8;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Add Link Sticker</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              {/* URL Input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>URL</Text>
                <TextInput
                  style={[
                    styles.input,
                    !validation.isValid && url.trim() && styles.inputError,
                  ]}
                  value={url}
                  onChangeText={setUrl}
                  placeholder="https://example.com or myapp://link"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  editable={!isLoading}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
                {url.trim() && !validation.isValid && (
                  <Text style={styles.errorText}>{validation.error}</Text>
                )}
                {validation.isValid && (
                  <Text style={styles.successText}>✓ Valid URL</Text>
                )}
              </View>

              {/* Title Input */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>
                  Sticker Title ({titleLength}/{LINK_CONSTANTS.MAX_TITLE_LENGTH})
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    showCharacterWarning && styles.inputWarning,
                  ]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Link text to display"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  editable={!isLoading}
                  maxLength={LINK_CONSTANTS.MAX_TITLE_LENGTH}
                  multiline
                />
                {showCharacterWarning && (
                  <Text style={styles.warningText}>
                    Getting close to limit
                  </Text>
                )}
              </View>

              {/* Live Preview */}
              {validation.isValid && title.trim() && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>Preview</Text>
                  <View style={styles.previewSticker}>
                    <Text style={styles.previewText}>{formatLinkTitle(title)}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={onClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.saveButton,
                  !isFormValid && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Add Link</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  closeText: {
    color: 'white',
    fontSize: 24,
  },
  form: {
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: 'white',
    fontSize: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  inputError: {
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255,107,107,0.1)',
  },
  inputWarning: {
    borderColor: '#FFD93D',
    backgroundColor: 'rgba(255,217,61,0.1)',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 6,
  },
  successText: {
    color: '#51CF66',
    fontSize: 12,
    marginTop: 6,
  },
  warningText: {
    color: '#FFD93D',
    fontSize: 12,
    marginTop: 6,
  },
  previewSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  previewLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  previewSticker: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  previewText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#0095F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(0, 149, 246, 0.4)',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
