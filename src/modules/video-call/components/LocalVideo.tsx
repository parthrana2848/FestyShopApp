import React from 'react';
import { View, Text } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import type { MediaStream } from 'react-native-webrtc';
import { styles } from './LocalVideo.styles';
import { VIDEO_CALL_STRINGS } from '../constants/videoCallStrings';

interface LocalVideoProps {
  stream: MediaStream | null;
  isCameraEnabled: boolean;
}

export const LocalVideo: React.FC<LocalVideoProps> = ({
  stream,
  isCameraEnabled,
}) => {
  if (!isCameraEnabled || !stream) {
    return (
      <View style={styles.container}>
        <View style={styles.cameraOffContainer}>
          <Text style={styles.cameraOffText}>
            {VIDEO_CALL_STRINGS.CAMERA_OFF}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RTCView
        streamURL={stream.toURL()}
        style={styles.stream}
        objectFit="cover"
        mirror={true}
        zOrder={1}
      />
      <View style={styles.border} />
    </View>
  );
};
