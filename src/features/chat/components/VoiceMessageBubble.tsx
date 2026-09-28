import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Message } from '../types/chat.types';
import { PlaybackProgress, PlayerState } from '../hooks/useVoicePlayer';

interface VoiceMessageBubbleProps {
  message: Message;
  isSender: boolean;
  playerState: PlayerState;
  activeMessageId: string | null;
  progress: PlaybackProgress;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (position: number) => void;
}

const getMessageId = (message: Message): string | null => {
  const id = message._id ?? message.clientMessageId;

  return typeof id === 'string' && id.length > 0 ? id : null;
};

const formatDuration = (seconds: number): string => {
  const safeSeconds = Math.max(0, Number.isFinite(seconds) ? seconds : 0);

  const minutes = Math.floor(safeSeconds / 60);

  const remainingSeconds = Math.floor(safeSeconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const VoiceMessageBubble = ({
  message,
  isSender,
  playerState,
  activeMessageId,
  progress,
  onPlay,
  onPause,
}: VoiceMessageBubbleProps) => {

  const messageId = getMessageId(message);

  const isActive = messageId !== null && messageId === activeMessageId;

  const isPlaying = isActive && playerState === 'playing';

  if (!message.voice?.url) {
    return;
  }
  const duration =
    message.voice.duration > 0
      ? message.voice.duration
      : isActive
      ? progress.duration
      : 0;

  const currentProgress = isActive
    ? Math.min(Math.max(0, progress.current), duration || progress.current)
    : 0;

  const progressPercentage =
    duration > 0
      ? Math.min(100, Math.max(0, (currentProgress / duration) * 100))
      : 0;

  const handlePress = (): void => {
    if (!messageId) {
      return;
    }

    if (isActive && playerState === 'playing') {
      onPause();
      return;
    }

    onPlay();
  };

  return (
    <View
      style={[styles.container, isSender ? styles.sender : styles.receiver]}
    >
      <TouchableOpacity
        style={styles.playButton}
        activeOpacity={0.7}
        onPress={handlePress}
      >
        <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶️'}</Text>
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercentage}%`,
              },
            ]}
          />
        </View>

        <View style={styles.durationRow}>
          <Text
            style={[
              styles.durationText,
              isSender ? { color: '#FFFFFF' } : { color: '#666' },
            ]}
          >
            {formatDuration(currentProgress)}
          </Text>

          <Text
            style={[
              styles.durationText,
              isSender ? { color: '#FFFFFF' } : { color: '#666' },
            ]}
          >
            {formatDuration(duration)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F0F0F5',
    borderRadius: 15,
    marginVertical: 5,
    // maxWidth: '80%',
  },

  sender: {
    backgroundColor: '#0A84FF',
    // alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },

  receiver: {
    backgroundColor: '#E9E9EB',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
  },

  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  playIcon: {
    fontSize: 20,
  },

  progressContainer: {
    // flex: 1,
    justifyContent: 'center',
    minWidth: 100,
  },

  progressBarBackground: {
    height: 5,
    backgroundColor: '#CCC',
    borderRadius: 3,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: '#075E54',
    borderRadius: 3,
  },

  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  durationText: {
    fontSize: 10,
    color: '#666',
  },
});
