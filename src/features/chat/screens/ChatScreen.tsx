import React, {
  useEffect,
  useState,
} from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  RouteProp,
  useIsFocused,
  useRoute,
} from '@react-navigation/native';

import { RootStackParamList } from '../../../types/navigation';
import { useAuth } from '../../../context/AuthContext';

import { useChatSocket } from '../hooks/useChatSocket';
import { useMessages } from '../hooks/useMessages';
import { useVoicePermissions } from '../hooks/useVoicePermissions';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { useVoicePlayer } from '../hooks/useVoicePlayer';

import { ChatHeader } from '../components/ChatHeader';
import { MessageList } from '../components/MessageList';
import { MessageInput } from '../components/MessageInput';
import { ReactionPickerModal } from '../components/ReactionPickerModal';

type ChatScreenRouteProp = RouteProp<
  RootStackParamList,
  'ChatScreen'
>;

const getMessageId = (message: {
  _id?: string;
  id?: string;
  clientMessageId?: string;
}): string | null => {
  const id =
    message?._id ??
    message?.id ??
    message?.clientMessageId;

  return typeof id === 'string' && id.length > 0
    ? id
    : null;
};

export const ChatScreen = () => {
  const route = useRoute<ChatScreenRouteProp>();

  const {
    conversationId,
    participantName = 'Chat',
  } = route.params;

  const { user: currentUser } = useAuth();

  const currentUserId =
    currentUser?.id ||
    (currentUser as { _id?: string } | null)?._id ||
    '';

  const isFocused = useIsFocused();

  const [
    reactionModalVisible,
    setReactionModalVisible,
  ] = useState(false);

  const [
    selectedMessageId,
    setSelectedMessageId,
  ] = useState<string | null>(null);

  /*
   * IMPORTANT:
   *
   * This identifies which voice message owns
   * the shared audio player.
   *
   * Only this message should show ⏸ and
   * receive the current playback progress.
   */
  const [
    activeVoiceMessageId,
    setActiveVoiceMessageId,
  ] = useState<string | null>(null);

  /*
   * Voice permissions
   */
  const {
    requestPermissions: requestVoicePermissions,
  } = useVoicePermissions();

  /*
   * Voice recorder
   */
  const {
    state: recorderState,
    duration: recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder();

  /*
   * Voice player
   */
  const {
    state: playerState,
    progress,
    play,
    pause,
    seek,
  } = useVoicePlayer();

  /*
   * Socket
   */
  const {
    isConnected,
    error: socketError,
  } = useChatSocket(conversationId);

  /*
   * Messages
   */
  const {
    messages,
    isLoading,
    isError,
    errorMessage,
    sendMessage,
    sendVoiceMessage,
    isSending,
    isUploading,
    loadMore,
    hasMore,
    addReaction,
    getPlaybackUrlAsync,
    removeReaction,
  } = useMessages(
    conversationId,
    currentUserId,
    isFocused,
  );

  const statusText = !isConnected
    ? 'Connecting...'
    : 'Online';

  /*
   * Start voice recording
   */
  const handleStartRecording =
    async (): Promise<void> => {
      try {
        const {
          microphone,
        } = await requestVoicePermissions();

        if (microphone !== 'granted') {
          console.error(
            '[ChatScreen] Microphone permission not granted',
            {
              microphone,
            },
          );

          return;
        }

        const started =
          await startRecording();

        if (!started) {
          console.error(
            '[ChatScreen] Failed to start voice recording',
          );
        }
      } catch (error: unknown) {
        console.error(
          '[ChatScreen] Start recording failed:',
          error,
        );
      }
    };

  /*
   * Stop voice recording
   */
  const handleStopRecording =
    async (): Promise<void> => {
      try {
        const audio =
          await stopRecording();

        console.log(
          '[ChatScreen] Recorded audio:',
          audio,
        );

        if (!audio) {
          console.warn(
            '[ChatScreen] No audio was produced',
          );

          return;
        }

        await sendVoiceMessage(audio);
      } catch (error: unknown) {
        console.error(
          '[ChatScreen] Send voice message failed:',
          error,
        );
      }
    };

  /*
   * Cancel voice recording
   */
  const handleCancelRecording =
    (): void => {
      void cancelRecording();
    };

  /*
   * Play a specific voice message.
   *
   * IMPORTANT:
   * The shared useVoicePlayer has only ONE
   * audio instance.
   *
   * When another message is tapped,
   * changing activeVoiceMessageId makes
   * the UI switch to that message.
   *
   * play(url) should stop/release the previous
   * Sound instance before starting the new one.
   */
  const handlePlayVoice =async (
    messageId: string,
    url: string,
  ): Promise<void> => {
    console.log(
      '[ChatScreen] Play voice message:',
      {
        messageId,
        url,
        previousMessageId:
          activeVoiceMessageId,
      },
    );

    setActiveVoiceMessageId(
      messageId,
    );

    console.log(
      '[ChatScreen] Calling play() with URL:',
      activeVoiceMessageId,
    );
const playbackUrl =await getPlaybackUrlAsync(url);
    void play(playbackUrl);
  };

  /*
   * Pause the currently active voice message.
   */
  const handlePauseVoice = (): void => {
    void pause();
  };

  /*
   * Seek the currently active voice message.
   */
  const handleSeekVoice = (
    position: number,
  ): void => {
    void seek(position);
  };


  console.log('[ChatScreen] Voice player:', {
  playerState,
  activeVoiceMessageId,
  progress,
});
  return (
    <SafeAreaView
      style={styles.container}
      edges={[
        'top',
        'left',
        'right',
        'bottom',
      ]}
    >
      <ChatHeader
        participantName={
          participantName
        }
        statusText={statusText}
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        keyboardVerticalOffset={
          Platform.OS === 'ios'
            ? 0
            : 0
        }
      >
        <View style={styles.chatContent}>
          <View
            style={
              styles.messageListContainer
            }
          >
            <MessageList
              messages={messages}
              currentUserId={
                currentUserId
              }
              isLoading={isLoading}
              isError={
                isError ||
                !!socketError
              }
              errorMessage={
                errorMessage ||
                socketError
              }
              onMessageLongPress={msg => {
                const msgId =
                  getMessageId(msg);

                if (!msgId) {
                  return;
                }
                setSelectedMessageId(
                  msg._id,
                );

                setReactionModalVisible(
                  true,
                );
              }}
              loadMore={loadMore}
              hasMore={hasMore}
              voicePlayerProps={{
                state: playerState,
                progress,

                /*
                 * Tell every MessageBubble which
                 * message currently owns the player.
                 */
                activeMessageId:
                  activeVoiceMessageId,

                /*
                 * IMPORTANT:
                 * Pass messageId + URL.
                 */
                onPlay: (
                  messageId,
                  url,
                ) => {
                  handlePlayVoice(
                    messageId,
                    url,
                  );
                },

                onPause:
                  handlePauseVoice,

                onSeek:
                  handleSeekVoice,
              }}
            />
          </View>

          <View
            style={styles.inputContainer}
          >
            <MessageInput
              onSend={sendMessage}
              onSendVoice={
                sendVoiceMessage
              }
              isSending={isSending}
              isUploading={
                isUploading
              }
              recorderState={
                recorderState
              }
              recordingDuration={
                recordingDuration
              }
              startRecording={
                handleStartRecording
              }
              stopRecording={
                handleStopRecording
              }
              cancelRecording={
                handleCancelRecording
              }
            />
          </View>
        </View>

        <ReactionPickerModal
          visible={
            reactionModalVisible
          }
          onClose={() =>
            setReactionModalVisible(
              false,
            )
          }
          onSelect={emoji => {
            if (!selectedMessageId) {
              return;
            }

            console.log('[ChatScreen] Message to add reaction:', selectedMessageId);
            const msg =
              messages.find(
                message =>
                  getMessageId(
                    message,
                  ) ===
                  selectedMessageId,
              );

              console.log('[ChatScreen] Found message for reaction:', msg);
              console.log("[ChatScreen] messageList", messages);
            if (!msg) {
              return;
            }

            const existing =
              msg.reactions?.find(
                reaction =>
                  reaction.users?.includes(
                    currentUserId,
                  ),
              );

            if (existing) {
              if (
                existing.emoji ===
                emoji
              ) {
                removeReaction(
                  selectedMessageId,
                  emoji,
                );
              } else {
                removeReaction(
                  selectedMessageId,
                  existing.emoji,
                );

                addReaction(
                  selectedMessageId,
                  emoji,
                );
              }
            } else {
              addReaction(
                selectedMessageId,
                emoji,
              );
            }

            setReactionModalVisible(
              false,
            );
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  keyboardContainer: {
    flex: 1,
  },

  chatContent: {
    flex: 1,
  },

  messageListContainer: {
    flex: 1,
  },

  inputContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
});