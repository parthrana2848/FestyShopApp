import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StatusBar, ActivityIndicator } from 'react-native';
import { useVideoCall } from '../hooks/useVideoCall';
import { LocalVideo } from '../components/LocalVideo';
import { RemoteVideo } from '../components/RemoteVideo';
import { CallControls } from '../components/CallControls';
import { styles } from './VideoCallScreen.styles';
import { VIDEO_CALL_STRINGS, COMMON_STRINGS } from '../constants/videoCallStrings';
import type { MediaStream } from 'react-native-webrtc';

export const VideoCallScreen: React.FC = () => {
  const {
    callState,
    remoteParticipant,
    hasLocalStream,
    hasRemoteStream,
    isMuted,
    isCameraEnabled,
    isSpeakerOn,
    error,
    callStartTime,
    getLocalStream,
    getRemoteStream,
    toggleMute,
    toggleCamera,
    toggleSpeaker,
    switchCamera,
    endCall,
  } = useVideoCall();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  // Poll streams from service (non-serializable, cannot live in Redux)
  useEffect(() => {
    // Immediate check
    const initialLocal = getLocalStream();
    const initialRemote = getRemoteStream();
    localStreamRef.current = initialLocal;
    remoteStreamRef.current = initialRemote;
    setLocalStream(initialLocal);
    setRemoteStream(initialRemote);

    const interval = setInterval(() => {
      const ls = getLocalStream();
      const rs = getRemoteStream();
      if (ls !== localStreamRef.current) {
        localStreamRef.current = ls;
        setLocalStream(ls);
      }
      if (rs !== remoteStreamRef.current) {
        remoteStreamRef.current = rs;
        setRemoteStream(rs);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [getLocalStream, getRemoteStream, hasLocalStream, hasRemoteStream]);

  const participantName =
    remoteParticipant?.userName ?? COMMON_STRINGS.UNKNOWN_USER;

  const getStatusText = (): string => {
    switch (callState) {
      case 'connecting':
        return VIDEO_CALL_STRINGS.CONNECTING;
      case 'reconnecting':
        return VIDEO_CALL_STRINGS.RECONNECTING;
      case 'connected':
        return VIDEO_CALL_STRINGS.CONNECTED;
      default:
        return '';
    }
  };

  if (callState === 'ended') {
    return (
      <View style={styles.endedOverlay}>
        <Text style={styles.endedText}>
          {VIDEO_CALL_STRINGS.CALL_ENDED}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Remote Video (full screen) */}
      <RemoteVideo
        stream={remoteStream}
        participantName={participantName}
        statusText={
          !hasRemoteStream ? getStatusText() : undefined
        }
      />

      {/* Local Video (PiP) */}
      <LocalVideo
        stream={localStream}
        isCameraEnabled={isCameraEnabled}
      />

      {/* Reconnecting Overlay */}
      {callState === 'reconnecting' ? (
        <View style={styles.reconnectingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.reconnectingText}>
            {VIDEO_CALL_STRINGS.RECONNECTING}
          </Text>
        </View>
      ) : null}

      {/* Error Overlay */}
      {error && callState === 'failed' ? (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>
            {VIDEO_CALL_STRINGS.CALL_FAILED}
          </Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
        </View>
      ) : null}

      {/* Call Controls */}
      <CallControls
        isMuted={isMuted}
        isCameraEnabled={isCameraEnabled}
        isSpeakerOn={isSpeakerOn}
        callStartTime={callStartTime}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
        onToggleSpeaker={toggleSpeaker}
        onSwitchCamera={switchCamera}
        onEndCall={endCall}
      />
    </View>
  );
};
