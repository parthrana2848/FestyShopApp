import React, { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Message } from '../types/chat.types';
import { MessageBubble } from './MessageBubble';
import {
  PlaybackProgress,
  PlayerState,
} from '../hooks/useVoicePlayer';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string | null;
  onMessageLongPress?: (message: Message) => void;
  loadMore?: () => void;
  hasMore?: boolean;

  voicePlayerProps?: {
    state: PlayerState;
    progress: PlaybackProgress;

    /**
     * Currently active voice message.
     */
    activeMessageId: string | null;

    /**
     * Play a specific voice message.
     */
    onPlay: (
      messageId: string,
      url: string,
    ) => void;

    onPause: () => void;

    onSeek: (
      pos: number,
    ) => void;
  };
}

const getSenderUserId = (
  senderId: Message['senderId'],
): string | null => {
  if (typeof senderId === 'string') {
    return senderId.length > 0
      ? senderId
      : null;
  }

  if (
    senderId &&
    typeof senderId === 'object'
  ) {
    const id =
      senderId._id ??
      senderId.id;

    return typeof id === 'string' &&
      id.length > 0
      ? id
      : null;
  }

  return null;
};

export const MessageList = ({
  messages,
  currentUserId,
  isLoading,
  isError,
  errorMessage,
  onMessageLongPress,
  loadMore,
  hasMore,
  voicePlayerProps,
}: MessageListProps) => {

  useEffect(() => {
    console.log(
      '[MessageList] Rendering with messages:',
      voicePlayerProps?.activeMessageId,
    );
  }, [voicePlayerProps?.activeMessageId]);
  /*
   * Sort messages so newest message is at
   * index 0 for inverted FlatList.
   */
  const invertedMessages = useMemo(
    () => [...messages].reverse(),
    [messages],
  );

  const renderItem = ({
    item,
  }: {
    item: Message;
  }) => {
    const senderId =
      getSenderUserId(item.senderId);

    const isCurrentUser =
      senderId === currentUserId;

    return (
      <MessageBubble
        message={item}
        isCurrentUser={isCurrentUser}
        onLongPress={onMessageLongPress}
        voicePlayerProps={
          voicePlayerProps
        }
      />
    );
  };

  const keyExtractor = (
    item: Message,
    index: number,
  ): string => {
    return (
      item._id ||
      item.clientMessageId ||
      `msg-${index}`
    );
  };

  if (
    isLoading &&
    messages.length === 0
  ) {
    return (
      <View
        style={styles.centerContainer}
      >
        <ActivityIndicator
          size="large"
          color="#0A84FF"
        />
      </View>
    );
  }

  if (
    isError &&
    messages.length === 0
  ) {
    return (
      <View
        style={styles.centerContainer}
      >
        <Text style={styles.errorText}>
          {errorMessage ||
            'Failed to load message history.'}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={invertedMessages}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      inverted
      style={styles.list}
      contentContainerStyle={
        styles.listContent
      }
      keyboardShouldPersistTaps="handled"
      onEndReached={() => {
        if (
          hasMore &&
          loadMore
        ) {
          loadMore();
        }
      }}
      onEndReachedThreshold={0.2}
      ListEmptyComponent={
        <View
          style={styles.emptyContainer}
        >
          <Text
            style={styles.emptyText}
          >
            No messages yet. Say hi!
          </Text>
        </View>
      }
      extraData={[
  voicePlayerProps?.activeMessageId ?? null,
  voicePlayerProps?.state ?? 'idle',
  voicePlayerProps?.progress.current ?? 0,
]}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },

  listContent: {
    paddingVertical: 12,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
  },

  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
  },
});