import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './CallControls.styles';
import { VIDEO_CALL_STRINGS } from '../constants/videoCallStrings';
import { formatCallDuration } from '../utils/call.utils';

interface CallControlsProps {
  isMuted: boolean;
  isCameraEnabled: boolean;
  isSpeakerOn: boolean;
  callStartTime: number | null;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleSpeaker: () => void;
  onSwitchCamera: () => void;
  onEndCall: () => void;
}

export const CallControls: React.FC<CallControlsProps> = ({
  isMuted,
  isCameraEnabled,
  isSpeakerOn,
  callStartTime,
  onToggleMute,
  onToggleCamera,
  onToggleSpeaker,
  onSwitchCamera,
  onEndCall,
}) => {
  const [duration, setDuration] = useState('00:00');

  useEffect(() => {
    if (!callStartTime) {
      setDuration('00:00');
      return;
    }

    const interval = setInterval(() => {
      setDuration(formatCallDuration(callStartTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [callStartTime]);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.durationText}>{duration}</Text>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.controlWrapper}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              isMuted && styles.controlButtonActive,
            ]}
            onPress={onToggleMute}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonIcon}>
              {isMuted ? '🔇' : '🎤'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.controlLabel}>
            {isMuted ? VIDEO_CALL_STRINGS.UNMUTE : VIDEO_CALL_STRINGS.MUTE}
          </Text>
        </View>

        <View style={styles.controlWrapper}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              !isCameraEnabled && styles.controlButtonActive,
            ]}
            onPress={onToggleCamera}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonIcon}>
              {isCameraEnabled ? '📹' : '📷'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.controlLabel}>
            {isCameraEnabled
              ? VIDEO_CALL_STRINGS.CAMERA_ON
              : VIDEO_CALL_STRINGS.CAMERA_OFF}
          </Text>
        </View>

        <View style={styles.controlWrapper}>
          <TouchableOpacity
            style={styles.endCallButton}
            onPress={onEndCall}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonIcon}>📞</Text>
          </TouchableOpacity>
          <Text style={styles.controlLabel}>
            {VIDEO_CALL_STRINGS.END_CALL}
          </Text>
        </View>

        <View style={styles.controlWrapper}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onSwitchCamera}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonIcon}>🔄</Text>
          </TouchableOpacity>
          <Text style={styles.controlLabel}>
            {VIDEO_CALL_STRINGS.FLIP_CAMERA}
          </Text>
        </View>

        <View style={styles.controlWrapper}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              isSpeakerOn && styles.controlButtonActive,
            ]}
            onPress={onToggleSpeaker}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonIcon}>
              {isSpeakerOn ? '🔊' : '🔈'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.controlLabel}>
            {VIDEO_CALL_STRINGS.SPEAKER}
          </Text>
        </View>
      </View>
    </View>
  );
};
