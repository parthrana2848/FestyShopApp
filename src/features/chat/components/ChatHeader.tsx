import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface ChatHeaderProps {
  participantName?: string;
  participantAvatar?: string;
  statusText?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  participantName = 'Chat',
  participantAvatar,
  statusText = 'Online',
}) => {
  const navigation = useNavigation();

  const avatarUri =
    participantAvatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(participantName)}&background=0A84FF&color=fff`;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.backText}>‹</Text>
      </TouchableOpacity>

      <View style={styles.userInfo}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
        <View style={styles.textContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {participantName}
          </Text>
          {statusText ? <Text style={styles.statusText}>{statusText}</Text> : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    paddingRight: 12,
    justifyContent: 'center',
  },
  backText: {
    fontSize: 32,
    lineHeight: 32,
    color: '#0A84FF',
    fontWeight: '300',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E5E5EA',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  statusText: {
    fontSize: 12,
    color: '#34C759',
    marginTop: 1,
  },
});
