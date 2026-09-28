import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface MessageInputProps {
  onSend: (text: string) => Promise<boolean>;
  onSendVoice: (media: any) => Promise<boolean>;
  isSending?: boolean;
  isUploading?: boolean;
  recorderState: 'idle' | 'recording' | 'processing' | 'recorded' | 'error';
  recordingDuration: number;
  startRecording: () => void;
  stopRecording: () => Promise<void>;
  cancelRecording: () => void;
}

const MAX_CHAR_LIMIT = 2000;

export const MessageInput = ({
  onSend,
  onSendVoice,
  isSending = false,
  isUploading = false,
  recorderState,
  recordingDuration,
  startRecording,
  stopRecording,
  cancelRecording,
}: MessageInputProps) => {
  const [text, setText] = useState('');

  const trimmedText = text.trim();
  const isValid = trimmedText.length > 0 && trimmedText.length <= MAX_CHAR_LIMIT;

  const handleSend = async () => {
    if (!isValid || isSending) return;

    const messageText = text;
    setText(''); // Optimistically clear input

    const success = await onSend(messageText);
    if (!success) {
      // Restore input text if send failed
      setText(messageText);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {recorderState === 'recording' ? (
        <View style={styles.recordingContainer}>
          <TouchableOpacity onPress={cancelRecording} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatDuration(recordingDuration)}</Text>
            <Text style={styles.recordingLabel}>Recording...</Text>
          </View>
          <TouchableOpacity onPress={stopRecording} style={styles.stopButton}>
            <Text style={styles.stopText}>Stop</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Message..."
              placeholderTextColor="#8E8E93"
              value={text}
              onChangeText={setText}
              maxLength={MAX_CHAR_LIMIT}
              multiline
            />
            {text.length > 1800 ? (
              <Text
                style={[
                  styles.charCount,
                  text.length >= MAX_CHAR_LIMIT && styles.charCountWarning,
                ]}
              >
                {text.length}/{MAX_CHAR_LIMIT}
              </Text>
            ) : null}
          </View>

          {trimmedText.length === 0 ? (
            <TouchableOpacity
              style={[
                styles.sendButton,
                (isSending || isUploading) && styles.sendButtonDisabled,
              ]}
              onPress={startRecording}
              disabled={isSending || isUploading}
            >
              {isSending || isUploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.sendButtonText}>🎤</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!isValid || isSending) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!isValid || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                // <Text style={styles.sendButtonText}>-&gt;</Text>
                <Image source={require('../../../assets/paper-plane.png')} style={{height: 20, width: 20}} />
              )}
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 0,
    borderTopColor: '#F0F0F5',
    backgroundColor: '#FFFFFF',
  },
  inputContainer: {
    flex: 1,
    minHeight: 30,
    maxHeight: 120,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    color: '#000000',
    paddingTop: 0,
    paddingBottom: 0,
  },
  charCount: {
    fontSize: 10,
    color: '#8E8E93',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  charCountWarning: {
    color: '#FF3B30',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#075E54',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  recordingLabel: {
    fontSize: 12,
    color: '#666',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  stopButton: {
    padding: 8,
  },
  stopText: {
    color: '#075E54',
    fontWeight: '600',
  },
});
