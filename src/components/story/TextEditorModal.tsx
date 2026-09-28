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
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { FONT_PRESETS } from '../../constants/fontPresets';

interface TextEditorModalProps {
  visible: boolean;
  initialText: string;
  activePresetId: string;
  onClose: () => void;
  onSave: (text: string) => void;
}

export const TextEditorModal: React.FC<TextEditorModalProps> = ({
  visible,
  initialText,
  activePresetId,
  onClose,
  onSave,
}) => {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    if (visible) {
      setText(initialText);
    }
  }, [visible, initialText]);

  const activePreset = FONT_PRESETS.find((p) => p.id === activePresetId) || FONT_PRESETS[0];

  const handleDone = () => {
    if (text.trim()) {
      onSave(text.trim());
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
      >
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDone}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[
              styles.input,
              {
                fontFamily: activePreset.fontFamily,
                fontWeight: activePreset.fontWeight as any,
                fontStyle: activePreset.fontStyle,
              },
            ]}
            value={text}
            onChangeText={setText}
            autoFocus
            multiline
            placeholder="Type something..."
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  cancelText: {
    color: 'white',
    fontSize: 16,
  },
  doneText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    color: 'white',
    fontSize: 36,
    textAlign: 'center',
    textAlignVertical: 'center',
    width: '100%',
    minHeight: 220,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});
