import { useCallback, useEffect, useRef, useState } from 'react';
import uuid from 'react-native-uuid';
import { chatApiService } from '../services/chatApi.service';
import { socketService } from '../../../modules/video-call/services/socket.service';
import {
  Message,
  MessageStatus,
  SendMessagePayload,
  VoiceMessageMedia,
  GetMessagesParams,
} from '../types/chat.types';

type PendingReaction = {
  userId: string;
  emoji: string;
  action: 'add' | 'remove';
};

type UseMessagesResult = {
  messages: Message[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  sendMessage: (text: string) => Promise<boolean>;
  sendVoiceMessage: (media: {
    uri: string;
    size: number;
    duration: number;
    mimeType: string;
  }) => Promise<boolean>;
  getPlaybackUrlAsync: (key: string) => Promise<string>;
  retryVoiceMessage: (clientMessageId: string) => Promise<boolean>;
  isSending: boolean;
  isUploading: boolean;
  cursor?: string;
  hasMore: boolean;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
};

const getMessageId = (
  message: Pick<Message, '_id' | 'clientMessageId'> & { id?: string },
): string | null => {
  return message._id ?? (message as any).id ?? message.clientMessageId ?? null;
};

const sortMessagesChronologically = (msgs: Message[]): Message[] => {
  return [...msgs].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeA !== timeB) {
      return timeA - timeB;
    }
    const idA = a._id || a.clientMessageId || '';
    const idB = b._id || b.clientMessageId || '';
    return idA.localeCompare(idB);
  });
};

export function useMessages(
  conversationId: string,
  currentUserId?: string,
  isFocused?: boolean,
): UseMessagesResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Ref to track existing message IDs to prevent duplicates
  const messageIdsRef = useRef<Set<string>>(new Set());
  const clientMessageIdsRef = useRef<Set<string>>(new Set());
  const pendingStatusRef = useRef<Map<string, MessageStatus>>(new Map());
  const pendingReactionsRef = useRef<Map<string, PendingReaction[]>>(new Map());
  const isMountedRef = useRef(true);
  const isFocusedRef = useRef(isFocused);

  useEffect(() => {
    isFocusedRef.current = isFocused;
    if (isFocused && messages.length > 0 && currentUserId) {
      messages.forEach(msg => {
        const senderId =
          typeof msg.senderId === 'object'
            ? msg.senderId?._id || (msg.senderId as any)?.id
            : msg.senderId;
        const msgId = msg._id || (msg as any).id;
        if (
          senderId &&
          senderId !== currentUserId &&
          msg.status !== 'read' &&
          msgId
        ) {
          socketService.emitMessageRead({ conversationId, messageId: msgId });
        }
      });
    }
  }, [isFocused, conversationId, currentUserId, messages]);

  // Helper to add unique messages or update existing optimistic ones
  const addUniqueMessages = useCallback((newMsgs: Message[]) => {
    setMessages(prev => {
      let updatedPrev = [...prev];
      const completelyNewMsgs: Message[] = [];

      newMsgs.forEach(msg => {
        const incomingId = msg._id || (msg as any).id;
        const incomingClientMsgId = msg.clientMessageId;

        // Check if matching optimistic or existing message
        const existingIdx = updatedPrev.findIndex(m => {
          if (
            incomingClientMsgId &&
            m.clientMessageId &&
            m.clientMessageId === incomingClientMsgId
          ) {
            return true;
          }
          if (
            incomingId &&
            (m._id === incomingId || (m as any).id === incomingId)
          ) {
            return true;
          }
          return false;
        });

        if (existingIdx >= 0) {
          // Update in place
          updatedPrev[existingIdx] = {
            ...updatedPrev[existingIdx],
            ...msg,
            _id: incomingId || updatedPrev[existingIdx]._id,
          };
          if (incomingId) messageIdsRef.current.add(incomingId);
          if (incomingClientMsgId)
            clientMessageIdsRef.current.add(incomingClientMsgId);
        } else {
          const isDuplicateId = incomingId
            ? messageIdsRef.current.has(incomingId)
            : false;
          const isDuplicateClientId = incomingClientMsgId
            ? clientMessageIdsRef.current.has(incomingClientMsgId)
            : false;

          if (!isDuplicateId && !isDuplicateClientId) {
            completelyNewMsgs.push(msg);
            if (incomingId) messageIdsRef.current.add(incomingId);
            if (incomingClientMsgId)
              clientMessageIdsRef.current.add(incomingClientMsgId);
          }
        }
      });

      if (
        completelyNewMsgs.length === 0 &&
        updatedPrev.length === prev.length
      ) {
        return prev;
      }

      // Apply any buffered status updates / reactions to the new messages
      const processedNew = completelyNewMsgs.map(m => {
        const id = getMessageId(m);
        if (!id) return m;

        // 1. Handle pending status
        const pendingStatus = pendingStatusRef.current.get(id);
        let modified = m;
        if (pendingStatus) {
          const order = (s: MessageStatus) =>
            s === 'sent' ? 0 : s === 'delivered' ? 1 : 2;
          if (order(pendingStatus) > order(m.status || 'sent')) {
            pendingStatusRef.current.delete(id);
            modified = { ...modified, status: pendingStatus };
          }
        }

        // 2. Handle pending reactions
        const pendingReacts = pendingReactionsRef.current.get(id) || [];
        if (pendingReacts.length > 0) {
          const reactions = modified.reactions ? [...modified.reactions] : [];
          pendingReacts.forEach(pr => {
            if (pr.action === 'add') {
              const idx = reactions.findIndex(r => r.emoji === pr.emoji);
              if (idx >= 0) {
                if (!reactions[idx].users.includes(pr.userId)) {
                  reactions[idx].users.push(pr.userId);
                }
              } else {
                reactions.push({ emoji: pr.emoji, users: [pr.userId] });
              }
            } else if (pr.action === 'remove') {
              const idx = reactions.findIndex(r => r.emoji === pr.emoji);
              if (idx >= 0) {
                reactions[idx].users = reactions[idx].users.filter(
                  u => u !== pr.userId,
                );
                if (reactions[idx].users.length === 0) reactions.splice(idx, 1);
              }
            }
          });
          pendingReactionsRef.current.delete(id);
          modified = { ...modified, reactions };
        }

        return modified;
      });

      const combined = [...updatedPrev, ...processedNew];
      return sortMessagesChronologically(combined);
    });
  }, []);

  const applyStatusToMessage = useCallback(
    (messageId: string, status: MessageStatus) => {
      setMessages(prev => {
        let updated = false;
        const next = prev.map(m => {
          const id = getMessageId(m);
          if (
            !id ||
            (id !== messageId &&
              m._id !== messageId &&
              (m as any).id !== messageId &&
              m.clientMessageId !== messageId)
          ) {
            return m;
          }

          const order = (s: MessageStatus) =>
            s === 'sent' ? 0 : s === 'delivered' ? 1 : 2;
          const currentOrder = order(m.status || 'sent');
          const newOrder = order(status);
          if (newOrder > currentOrder) {
            updated = true;
            return { ...m, status };
          }
          return m;
        });

        if (!updated) {
          // buffer if message not present
          pendingStatusRef.current.set(messageId, status);
          return prev;
        }

        return next;
      });
    },
    [],
  );

  const applyReactionAdded = useCallback(
    (messageId: string, emoji: string, userId: string, _id?: string) => {
      setMessages(prev => {
        let found = false;

        const next = prev.map(message => {
          const id = getMessageId(message);

          if (
            id !== messageId &&
            message._id !== messageId &&
            (message as any).id !== messageId &&
            message.clientMessageId !== messageId
          ) {
            return message;
          }

          found = true;

          // Remove user's existing reaction completely.
          const reactions = (message.reactions ?? [])
            .map(reaction => ({
              ...reaction,
              users: reaction.users?.filter(id => id !== userId),
            }))
            .filter(reaction => reaction.users?.length > 0);

          // Add the new reaction.
          const existingReaction = reactions.find(
            reaction => reaction.emoji === emoji,
          );

          if (existingReaction) {
            existingReaction.users.push(userId);
          } else {
            reactions.push({
              emoji,
              users: [userId],
              _id,
            });
          }

          return {
            ...message,
            reactions,
          };
        });

        if (!found) {
          const pending = pendingReactionsRef.current.get(messageId) ?? [];

          pending.push({
            action: 'add',
            emoji,
            userId,
            // _id,
          });

          pendingReactionsRef.current.set(messageId, pending);

          return prev;
        }

        console.log(
          '[useMessages] Applied reaction added:',
          messageId,
          emoji,
          userId,
        );
        return next;
      });
    },
    [],
  );
  const applyReactionRemoved = useCallback(
    (messageId: string, emoji: string, userId: string) => {
      console.log( "messageId", messageId, "emoji", emoji, "userId", userId );
      setMessages(prev => {
        let found = false;
        const next = prev.map(m => {
          const id = getMessageId(m);
          console.log("m", m);
          console.log( "id", id, "m._id", m._id, "(m as any).id", (m as any).id, "m.clientMessageId", m.clientMessageId );
          if (
            !id ||
            (id !== messageId &&
              m._id !== messageId &&
              (m as any).id !== messageId &&
              m.clientMessageId !== messageId)
          ) {
            console.log( "returning m", m );
            return m;
          }
          found = true;
          const reactions = m.reactions ? m.reactions.map(r => ({ ...r })) : [];
          const idx = reactions.findIndex(r => r.emoji === emoji);
          if (idx >= 0) {
            reactions[idx].users = reactions[idx].users.filter(
              u => u !== userId,
            );
            if (reactions[idx].users.length === 0) {
              reactions.splice(idx, 1);
            }
          }
          return { ...m, reactions };
        });

        if (!found) {
          const arr = pendingReactionsRef.current.get(messageId) || [];
          arr.push({ action: 'remove', emoji, userId });
          pendingReactionsRef.current.set(messageId, arr);
          return prev;
        }

        return next;
      });
    },
    [],
  );

  // Fetch initial message history
  const fetchMessages = useCallback(
    async (params?: GetMessagesParams) => {
      setIsLoading(true);
      try {
        const { messages: fetchedMessages, cursor: newCursor } =
          await chatApiService.getMessages(conversationId, params);

        console.log(
          '[useMessages] Fetched messages:',
          JSON.stringify(fetchedMessages),
          'New cursor:',
          newCursor,
        );
        addUniqueMessages(fetchedMessages);
        setCursor(newCursor);
        setHasMore(!!newCursor);
      } catch (e: any) {
        setIsError(true);
        setErrorMessage(e.message);
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, addUniqueMessages],
  );

  useEffect(() => {
    fetchMessages();

    // 1. Message New listener (handles messages from other users and echo/updates)
    const unsubMessageNew = socketService.onMessageNew(
      (incomingMessage: Message) => {
        const msgConvId =
          typeof incomingMessage.conversationId === 'object'
            ? (incomingMessage.conversationId as any)?._id ||
              (incomingMessage.conversationId as any)?.id
            : incomingMessage.conversationId;

        if (msgConvId && msgConvId !== conversationId) {
          return;
        }

        const senderId =
          typeof incomingMessage.senderId === 'object'
            ? incomingMessage.senderId?._id ||
              (incomingMessage.senderId as any)?.id
            : incomingMessage.senderId;

        const isFromOther = senderId && senderId !== currentUserId;
        const msgId = incomingMessage._id || (incomingMessage as any).id;

        if (isFromOther && msgId) {
          socketService.emitMessageDelivered({
            conversationId,
            messageId: msgId,
          });
          if (isFocusedRef.current) {
            socketService.emitMessageRead({ conversationId, messageId: msgId });
          }
        }

        setMessages(prev => {
          const incomingId = incomingMessage._id || (incomingMessage as any).id;
          const incomingClientMsgId = incomingMessage.clientMessageId;

          const existingIndex = prev.findIndex(m => {
            if (
              incomingClientMsgId &&
              m.clientMessageId &&
              m.clientMessageId === incomingClientMsgId
            ) {
              return true;
            }
            if (
              incomingId &&
              (m._id === incomingId || (m as any).id === incomingId)
            ) {
              return true;
            }
            return false;
          });

          let next: Message[];
          if (existingIndex >= 0) {
            next = [...prev];
            next[existingIndex] = {
              ...next[existingIndex],
              ...incomingMessage,
              _id: incomingId || next[existingIndex]._id,
            };
          } else {
            next = [...prev, incomingMessage];
          }

          if (incomingId) messageIdsRef.current.add(incomingId);
          if (incomingClientMsgId)
            clientMessageIdsRef.current.add(incomingClientMsgId);

          return sortMessagesChronologically(next);
        });
      },
    );

    // 2. Message Delivered listener
    const unsubDelivered = socketService.onMessageDelivered((data: any) => {
      if (data?.messageId) {
        applyStatusToMessage(data.messageId, 'delivered');
      }
    });

    // 3. Message Read listener
    const unsubRead = socketService.onMessageRead((data: any) => {
      if (data?.messageId) {
        applyStatusToMessage(data.messageId, 'read');
      }
    });

    // 4. Reaction Added listener
    const unsubReactionAdded = socketService.onReactionAdded((data: any) => {
      if (data?.messageId && data?.reaction.emoji) {
        const userId = data?.userId || currentUserId;
        applyReactionAdded(
          data.messageId,
          data?.reaction.emoji,
          userId,
          data.reaction._id,
        );
      }
    });

    // 5. Reaction Removed listener
    const unsubReactionRemoved = socketService.onReactionRemoved(
      (data: any) => {
        console.log('[useMessages] Reaction removed event received:', data);
        if (data?.messageId && data?.emoji && data?.userId) {
          applyReactionRemoved(data.messageId, data.emoji, data.userId);
        }
      },
    );

    // 6. Chat Error listener
    const unsubChatError = socketService.onChatError((error: any) => {
      console.error('[useMessages] Chat socket error:', error);
    });

    // 7. Reconnect listener
    const unsubReconnect = socketService.onReconnect(async () => {
      await fetchMessages();
    });

    return () => {
      unsubMessageNew();
      unsubDelivered();
      unsubRead();
      unsubReactionAdded();
      unsubReactionRemoved();
      unsubChatError();
      unsubReconnect();
      isMountedRef.current = false;
    };
  }, [
    conversationId,
    currentUserId,
    fetchMessages,
    applyStatusToMessage,
    applyReactionAdded,
    applyReactionRemoved,
  ]);

  const sendMessage = useCallback(
    async (text: string) => {
      const clientMessageId = uuid.v4() as string;
      const optimisticMessage: Message = {
        _id: clientMessageId,
        conversationId,
        senderId: currentUserId || '',
        clientMessageId,
        type: 'text',
        text,
        status: 'sent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      clientMessageIdsRef.current.add(clientMessageId);
      setMessages(prev =>
        sortMessagesChronologically([...prev, optimisticMessage]),
      );
      setIsSending(true);

      try {
        socketService.sendMessage(
          {
            conversationId,
            clientMessageId,
            type: 'text',
            text,
          },
          ack => {
            if (ack?.error) {
              console.error('Message send error:', ack.error);
            }
          },
        );
        return true;
      } catch (e) {
        setIsError(true);
        setErrorMessage('Failed to send message');
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, currentUserId],
  );

  const sendVoiceMessage = useCallback(
    async (media: {
      uri: string;
      size: number;
      duration: number;
      mimeType: string;
    }) => {
      const clientMessageId = uuid.v4() as string;
      const optimisticMessage: Message = {
        _id: clientMessageId,
        conversationId,
        senderId: currentUserId || '',
        clientMessageId,
        type: 'voice',
        text: '',
        media: {
          url: '', // will be updated after S3 upload
          duration: media.duration,
          size: media.size,
          mimeType: media.mimeType,
        },
        status: 'sent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      clientMessageIdsRef.current.add(clientMessageId);
      setMessages(prev =>
        sortMessagesChronologically([...prev, optimisticMessage]),
      );
      setIsUploading(true);

      try {
        // 1. Get presigned URL
        const { uploadUrl, key } = await chatApiService.getPresignedUrl({
          conversationId,
          mimeType: media.mimeType,
          size: media.size,
        });

        console.log('[useMessages] Presigned URL obtained:', uploadUrl, key);

        // 2. Upload to S3 with retry
        let uploadSuccess = false;
        let attempts = 0;
        while (attempts < 3 && !uploadSuccess) {
          try {
            const fileBlob = await fetch(`file://${media.uri}`).then(res =>
              res.blob(),
            );
            const response = await fetch(uploadUrl, {
              method: 'PUT',
              body: fileBlob,
              headers: { 'Content-Type': media.mimeType },
            });
            if (response.ok) {
              uploadSuccess = true;
            }
          } catch (e) {
            attempts++;
            if (attempts === 3) throw e;
          }
        }

        // 3. Send via Socket
        setIsSending(true);
        socketService.sendMessage(
          {
            conversationId,
            clientMessageId,
            type: 'voice',
            voice: {
              url: key,
              duration: media.duration,
              size: media.size,
              mimeType: media.mimeType,
            },
          },
          ack => {
            if (ack?.error) {
              console.error('Voice message send error:', ack.error);
            }
          },
        );

        // Update optimistic message with actual mediaUrl
        setMessages(prev =>
          prev.map(m =>
            m.clientMessageId === clientMessageId
              ? { ...m, voice: { ...m.media!, url: uploadUrl } }
              : m,
          ),
        );

        return true;
      } catch (e: any) {
        setIsError(true);
        setErrorMessage(`Voice upload failed: ${e.message}`);
        return false;
      } finally {
        setIsUploading(false);
        setIsSending(false);
      }
    },
    [conversationId, currentUserId],
  );

  const getPlaybackUrlAsync = useCallback(
    async (key: string): Promise<string> => {
      try {
        setIsLoading(true);
        const playbackUrl = await chatApiService.getPlaybackUrl({ key });
        return playbackUrl;
      } catch (e) {
        console.error(
          '[useMessages] Failed to get playback URL for key:',
          key,
          e,
        );
        return '';
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const retryVoiceMessage = useCallback(
    async (clientMessageId: string) => {
      const msg = messages.find(m => m.clientMessageId === clientMessageId);
      if (!msg || !msg.media) return false;

      setIsSending(true);
      try {
        socketService.sendMessage(
          {
            conversationId,
            clientMessageId,
            type: 'voice',
            voice: msg.media,
          },
          ack => {
            if (ack?.error) {
              console.error('Voice retry error:', ack.error);
            }
          },
        );
        return true;
      } catch (e) {
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, messages],
  );

  const addReaction = useCallback(
    (messageId: string, emoji: string) => {
      if (!currentUserId) return;
      // Optimistically update UI
      applyReactionAdded(messageId, emoji, currentUserId);
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(messageId);
      if (!isObjectId) {
        // MessageId is a clientMessageId (optimistic). Store pending reaction to be sent later when the real _id arrives.
        const arr = pendingReactionsRef.current.get(messageId) || [];
        arr.push({ action: 'add', emoji, userId: currentUserId });
        pendingReactionsRef.current.set(messageId, arr);
        return;
      }
      socketService.emitReactionAdd({ conversationId, messageId, emoji });
    },
    [conversationId, currentUserId, applyReactionAdded],
  );

  const removeReaction = useCallback(
    (messageId: string, emoji: string) => {
      console.log('[useMessages] Removing reaction:', {
        messageId,
        emoji,
        currentUserId,
      });

      if (!currentUserId) return;
      applyReactionRemoved(messageId, emoji, currentUserId);
      socketService.emitReactionRemove({ conversationId, messageId, emoji });
    },
    [conversationId, currentUserId, applyReactionRemoved],
  );

  return {
    messages,
    isLoading,
    isError,
    errorMessage,
    sendMessage,
    sendVoiceMessage,
    getPlaybackUrlAsync,
    retryVoiceMessage,
    isSending,
    isUploading,
    cursor,
    hasMore,
    refetch: fetchMessages,
    loadMore: async () => {
      if (!cursor || isFetchingMore) return;
      setIsFetchingMore(true);
      try {
        const { messages: moreMsgs, cursor: nextCursor } =
          await chatApiService.getMessages(conversationId, { cursor });
        addUniqueMessages(moreMsgs);
        setCursor(nextCursor);
        setHasMore(!!nextCursor);
      } catch (e) {
        console.error('[useMessages] Error loading more messages:', e);
      } finally {
        setIsFetchingMore(false);
      }
    },
    addReaction,
    removeReaction,
  };
}
