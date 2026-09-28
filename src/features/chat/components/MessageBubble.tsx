// 
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

import { Message } from '../types/chat.types';
import { VoiceMessageBubble } from './VoiceMessageBubble';
import {
  PlaybackProgress,
  PlayerState,
} from '../hooks/useVoicePlayer';

type Props = {
  message: Message;
  isCurrentUser: boolean;
  onLongPress?: (message: Message) => void;

  voicePlayerProps?: {
    state: PlayerState;
    progress: PlaybackProgress;

    /**
     * ID of the voice message currently controlled
     * by the shared audio player.
     */
    activeMessageId: string | null;

    /**
     * Start/play a specific voice message.
     */
    onPlay: (
      messageId: string,
      url: string,
    ) => void;

    /**
     * Pause currently active voice message.
     */
    onPause: () => void;

    /**
     * Seek currently active voice message.
     */
    onSeek: (position: number) => void;
  };
};

const getMessageId = (
  message: Message,
): string | null => {
  const id =
    message._id ??
    // message.id ??
    message.clientMessageId;

  return typeof id === 'string' && id.length > 0
    ? id
    : null;
};

const formatTime = (
  isoString?: string,
): string => {
  if (!isoString) {
    return '';
  }

  try {
    const date = new Date(isoString);

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

export const MessageBubble = ({
  message,
  isCurrentUser,
  onLongPress,
  voicePlayerProps,
}: Props) => {
  const timestamp = formatTime(
    message.createdAt,
  );

  const messageId = getMessageId(message);

  const renderStatus = () => {
    if (!isCurrentUser) {
      return null;
    }

    const status = message.status || 'sent';

    if (status === 'sent') {
      return (
        <Text style={styles.status}>
          ✓
        </Text>
      );
    }

    if (status === 'delivered') {
      return (
        <Text style={styles.status}>
          ✓✓
        </Text>
      );
    }

    if (status === 'read') {
      return (
        <Text
          style={[
            styles.status,
            styles.statusRead,
          ]}
        >
          ✓✓
        </Text>
      );
    }

    return null;
  };

  const renderVoiceMessage = () => {
  if (!voicePlayerProps) {
    return (
      <VoiceMessageBubble
        message={message}
        isSender={isCurrentUser}
        playerState="idle"
        activeMessageId={null}
        progress={{
          current: 0,
          duration: 0,
        }}
        onPlay={() => {}}
        onPause={() => {}}
        onSeek={() => {}}
      />
    );
  }

  if (!messageId || !message.voice?.url) {
    return (
      <VoiceMessageBubble
        message={message}
        isSender={isCurrentUser}
        playerState="idle"
        activeMessageId={null}
        progress={{
          current: 0,
          duration: 0,
        }}
        onPlay={() => {}}
        onPause={() => {}}
        onSeek={() => {}}
      />
    );
  }

  const {
    state,
    progress,
    activeMessageId,
    onPlay,
    onPause,
    onSeek,
  } = voicePlayerProps;

  const isActive = messageId === activeMessageId;

  return (
    <VoiceMessageBubble
      message={message}
      isSender={isCurrentUser}
      playerState={state}
      activeMessageId={activeMessageId}
      progress={isActive ? progress : {
        current: 0,
        duration: progress.duration,
      }}
      onPlay={() => {
        console.log(
          '[MessageBubble] Voice play:',
          messageId,
        );

        onPlay(
          messageId,
          message.voice!.url,
        );
      }}
      onPause={onPause}
      onSeek={onSeek}
    />
  );
};

console.log('[MessageBubble] Voice state:', {
    messageId,
    activeMessageId:
      voicePlayerProps?.activeMessageId,
    playerState:
      voicePlayerProps?.state,
    isActive:
      messageId ===
      voicePlayerProps?.activeMessageId,
  });

  return (
    <View
      style={[
        styles.container,
        isCurrentUser
          ? styles.currentUserContainer
          : styles.otherUserContainer,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onLongPress={() =>
          onLongPress?.(message)
        }
        style={
          isCurrentUser
            ? styles.currentUserTouchable
            : styles.otherUserTouchable
        }
      >
        {message.type === 'voice'
          ? renderVoiceMessage()
          : (
            <View
              style={[
                styles.bubble,
                isCurrentUser
                  ? styles.currentUserBubble
                  : styles.otherUserBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  isCurrentUser
                    ? styles.currentUserText
                    : styles.otherUserText,
                ]}
              >
                {message.text}
              </Text>

              <View style={styles.metaRow}>
                {timestamp ? (
                  <Text
                    style={[
                      styles.timestamp,
                      isCurrentUser
                        ? styles.currentUserTimestamp
                        : styles.otherUserTimestamp,
                    ]}
                  >
                    {timestamp}
                  </Text>
                ) : null}

                {renderStatus()}
              </View>
            </View>
          )}

        {/* Reactions */}
        {message.reactions &&
        message?.reactions.length > 0 ? (
          <View
            style={[
              styles.reactionsRow,
              isCurrentUser
                ? styles.currentUserReactionsRow
                : styles.otherUserReactionsRow,
            ]}
          >
            {message.reactions.map(
              reaction => (
                <View
                key={reaction._id || reaction.emoji}
                  style={styles.reactionPill}
                >
                  <Text
                    style={
                      styles.reactionEmoji
                    }
                  >
                    {reaction.emoji}
                  </Text>

                </View>
              ),
            )}
          </View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
    width: '100%',
    flexDirection: 'row',
  },

  currentUserContainer: {
    justifyContent: 'flex-end',
  },

  otherUserContainer: {
    justifyContent: 'flex-start',
  },

  currentUserTouchable: {
    maxWidth: '78%',
    alignSelf: 'flex-end',
  },

  otherUserTouchable: {
    maxWidth: '78%',
    alignSelf: 'flex-start',
  },

  bubble: {
    maxWidth: '100%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },

  currentUserBubble: {
    backgroundColor: '#0A84FF',
    borderBottomRightRadius: 4,
  },

  otherUserBubble: {
    backgroundColor: '#E9E9EB',
    borderBottomLeftRadius: 4,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },

  currentUserText: {
    color: '#FFFFFF',
  },

  otherUserText: {
    color: '#000000',
  },

  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },

  currentUserTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },

  otherUserTimestamp: {
    color: '#8E8E93',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  status: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 6,
  },

  statusRead: {
    color: '#00C853',
  },

  reactionsRow: {
    flexDirection: 'row',
    marginTop: 6,
    paddingHorizontal: 6,
    flexWrap: 'wrap',
  },

  currentUserReactionsRow: {
    alignSelf: 'flex-end',
  },

  otherUserReactionsRow: {
    alignSelf: 'flex-start',
  },

  reactionPill: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  reactionEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
});