import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useVideoCall } from '../hooks/useVideoCall';
import { styles } from './OutgoingCallScreen.styles';
import { VIDEO_CALL_STRINGS, COMMON_STRINGS } from '../constants/videoCallStrings';

export const OutgoingCallScreen: React.FC = () => {
  const { receiver, callState, error, endCall } = useVideoCall();

  const receiverName = receiver?.userName ?? COMMON_STRINGS.UNKNOWN_USER;
  const initial = receiverName.charAt(0).toUpperCase();

  const getStatusText = (): string => {
    switch (callState) {
      case 'outgoing':
        return VIDEO_CALL_STRINGS.CALLING;
      case 'rejected':
        return VIDEO_CALL_STRINGS.CALL_REJECTED;
      case 'failed':
        return VIDEO_CALL_STRINGS.CALL_FAILED;
      default:
        return VIDEO_CALL_STRINGS.CONNECTING;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.topSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.receiverName}>{receiverName}</Text>
        <Text style={styles.callStatus}>{getStatusText()}</Text>
        {error ? (
          <Text style={styles.errorText}>{error.message}</Text>
        ) : null}
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={endCall}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelIcon}>📞</Text>
        </TouchableOpacity>
        <Text style={styles.cancelLabel}>
          {VIDEO_CALL_STRINGS.CANCEL}
        </Text>
      </View>
    </View>
  );
};
