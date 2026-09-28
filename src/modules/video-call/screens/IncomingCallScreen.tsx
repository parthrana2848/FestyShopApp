import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useVideoCall } from '../hooks/useVideoCall';
import { styles } from './IncomingCallScreen.styles';
import { VIDEO_CALL_STRINGS, COMMON_STRINGS } from '../constants/videoCallStrings';

export const IncomingCallScreen: React.FC = () => {
  const { caller, acceptCall, rejectCall } = useVideoCall();

  const callerName = caller?.userName ?? COMMON_STRINGS.UNKNOWN_USER;
  const initial = callerName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.topSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.callerName}>{callerName}</Text>
        <Text style={styles.callLabel}>
          {VIDEO_CALL_STRINGS.INCOMING_CALL}
        </Text>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.actionWrapper}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={rejectCall}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>📞</Text>
          </TouchableOpacity>
          <Text style={styles.actionLabel}>
            {VIDEO_CALL_STRINGS.DECLINE}
          </Text>
        </View>

        <View style={styles.actionWrapper}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={acceptCall}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>📞</Text>
          </TouchableOpacity>
          <Text style={styles.actionLabel}>
            {VIDEO_CALL_STRINGS.ACCEPT}
          </Text>
        </View>
      </View>
    </View>
  );
};
