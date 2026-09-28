import React from 'react';
import { View, Text } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import type { MediaStream } from 'react-native-webrtc';
import { styles } from './RemoteVideo.styles';
import { VIDEO_CALL_STRINGS, COMMON_STRINGS } from '../constants/videoCallStrings';

interface RemoteVideoProps {
  stream: MediaStream | null;
  participantName: string;
  statusText?: string;
}

export const RemoteVideo: React.FC<RemoteVideoProps> = ({
  stream,
  participantName,
  statusText,
}) => {
  const initial = (participantName || COMMON_STRINGS.UNKNOWN_USER)
    .charAt(0)
    .toUpperCase();

  if (!stream) {
    return (
      <View style={styles.placeholderContainer}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.nameText}>{participantName}</Text>
        {statusText ? (
          <Text style={styles.statusText}>{statusText}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RTCView
        streamURL={stream.toURL()}
        style={styles.stream}
        objectFit="cover"
        zOrder={0}
      />
      <View style={styles.nameOverlay}>
        <Text style={styles.nameText}>{participantName}</Text>
      </View>
    </View>
  );
};
