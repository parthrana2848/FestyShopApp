import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, AUTH_TOKEN_KEY } from '../../../constants/api';
import { CHAT_EVENTS } from '../constants/chatEvents';
import { Message, SendMessagePayload, SocketAckResponse } from '../types/chat.types';

export type MessageNewHandler = (message: Message) => void;
export type ChatErrorHandler = (error: any) => void;

class ChatSocketService {
  private socket: Socket | null = null;
  private isConnecting = false;
  private messageNewListeners: Set<MessageNewHandler> = new Set();
  private chatErrorListeners: Set<ChatErrorHandler> = new Set();

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }

  /**
   * Connect to Socket.IO server using Auth Token
   */
  async connect(authToken?: string): Promise<Socket> {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.isConnecting && this.socket) {
      return new Promise<Socket>((resolve) => {
        const checkConn = setInterval(() => {
          if (this.socket?.connected) {
            clearInterval(checkConn);
            resolve(this.socket);
          }
        }, 100);
      });
    }

    this.isConnecting = true;

    try {
      const token = authToken || (await AsyncStorage.getItem(AUTH_TOKEN_KEY));
      if (!token) {
        this.isConnecting = false;
        throw new Error('No authentication token available for Chat Socket');
      }

      const serverUrl = API_BASE_URL;
      if (!serverUrl) {
        this.isConnecting = false;
        throw new Error('Server API_BASE_URL not configured');
      }

      this.socket = io(serverUrl, {
        auth: {
          token,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      this.setupInternalListeners();

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Chat Socket connection timeout'));
        }, 10000);

        this.socket!.once('connect', () => {
          clearTimeout(timeout);
          console.log('[ChatSocketService] Connected:', this.socket?.id);
          resolve();
        });

        this.socket!.once('connect_error', (error: Error) => {
          clearTimeout(timeout);
          console.error('[ChatSocketService] Connection error:', error.message);
          reject(error);
        });
      });

      return this.socket;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Disconnect socket and clear all listeners
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.messageNewListeners.clear();
    this.chatErrorListeners.clear();
    console.log('[ChatSocketService] Disconnected and cleaned listeners');
  }

  /**
   * Join conversation room
   */
  joinConversation(
    conversationId: string,
    callback?: (response: SocketAckResponse) => void,
  ): void {
    if (!this.socket?.connected) {
      console.warn('[ChatSocketService] Cannot join conversation — socket not connected');
      return;
    }

    console.log('[ChatSocketService] Emitting chat:join for conversation:', conversationId);
    this.socket.emit(
      CHAT_EVENTS.CHAT_JOIN,
      { conversationId },
      (res: SocketAckResponse) => {
        console.log('[ChatSocketService] chat:join ACK:', res);
        callback?.(res);
      },
    );
  }

  /**
   * Leave conversation room
   */
  leaveConversation(
    conversationId: string,
    callback?: (response: SocketAckResponse) => void,
  ): void {
    if (!this.socket?.connected) {
      return;
    }

    console.log('[ChatSocketService] Emitting chat:leave for conversation:', conversationId);
    this.socket.emit(
      CHAT_EVENTS.CHAT_LEAVE,
      { conversationId },
      (res: SocketAckResponse) => {
        console.log('[ChatSocketService] chat:leave ACK:', res);
        callback?.(res);
      },
    );
  }

  /**
   * Send text message via socket
   */
  sendMessage(
    payload: SendMessagePayload,
    callback?: (ack: SocketAckResponse) => void,
  ): void {
    if (!this.socket?.connected) {
      console.warn('[ChatSocketService] Cannot send message — socket not connected');
      callback?.({ error: 'Socket not connected' });
      return;
    }

    console.log('[ChatSocketService] Emitting message:send:', payload);
    this.socket.emit(CHAT_EVENTS.MESSAGE_SEND, payload, (ack: SocketAckResponse) => {
      console.log('[ChatSocketService] message:send ACK:', ack);
      callback?.(ack);
    });
  }

  /**
   * Register listener for message:new
   */
  onMessageNew(handler: MessageNewHandler): () => void {
    this.messageNewListeners.add(handler);
    return () => {
      this.messageNewListeners.delete(handler);
    };
  }

  /**
   * Remove listener for message:new
   */
  offMessageNew(handler: MessageNewHandler): void {
    this.messageNewListeners.delete(handler);
  }

  /**
   * Register listener for chat:error
   */
  onChatError(handler: ChatErrorHandler): () => void {
    this.chatErrorListeners.add(handler);
    return () => {
      this.chatErrorListeners.delete(handler);
    };
  }

  /**
   * Remove listener for chat:error
   */
  offChatError(handler: ChatErrorHandler): void {
    this.chatErrorListeners.delete(handler);
  }

  /**
   * Internal listeners setup for broadcasting to subscribers
   */
  private setupInternalListeners(): void {
    if (!this.socket) return;

  }
}

export const chatSocketService = new ChatSocketService();
