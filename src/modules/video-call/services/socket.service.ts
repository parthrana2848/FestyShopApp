import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import { AUTH_TOKEN_KEY } from '../../../constants/api';
import { CLIENT_EVENTS, SERVER_EVENTS, CONNECTION_EVENTS } from '../constants/videoCallEvents';
import { CALL_TIMEOUTS } from '../constants/videoCallTimeouts';
import type {
  RegisterUserPayload,
  RegisterUserCallback,
  CallUserPayload,
  CallUserCallback,
  AnswerCallPayload,
  AnswerCallCallback,
  IceCandidatePayload,
  RejectCallPayload,
  RejectCallCallback,
  EndCallPayload,
  EndCallCallback,
  RegisteredEvent,
  IncomingCallEvent,
  CallAnsweredEvent,
  IceCandidateEvent,
  CallRejectedEvent,
  CallEndedEvent,
  UserOnlineEvent,
  UserOfflineEvent,
  OnlineUsersEvent,
  SocketErrorEvent,
  LatestCounterValueEvent
} from '../types/socket.types';

type SocketEventHandler<T> = (data: T) => void;

interface SocketListeners {
  onRegistered?: SocketEventHandler<RegisteredEvent>;
  onIncomingCall?: SocketEventHandler<IncomingCallEvent>;
  onCallAnswered?: SocketEventHandler<CallAnsweredEvent>;
  onIceCandidate?: SocketEventHandler<IceCandidateEvent>;
  onCallRejected?: SocketEventHandler<CallRejectedEvent>;
  onCallEnded?: SocketEventHandler<CallEndedEvent>;
  onUserOnline?: SocketEventHandler<UserOnlineEvent>;
  onUserOffline?: SocketEventHandler<UserOfflineEvent>;
  onOnlineUsers?: SocketEventHandler<OnlineUsersEvent>;
  onError?: SocketEventHandler<SocketErrorEvent>;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onConnectError?: (error: Error) => void;
  onReconnect?: () => void;
  onLatestCounterValue?: SocketEventHandler<{ value: number }>;

}

class SocketService {
  private socket: Socket | null = null;
  private listeners: SocketListeners = {};
  private isConnecting = false;

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }

  async connect(authToken?: string): Promise<void> {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const token = authToken || await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        this.isConnecting = false;
        throw new Error('No authentication token available');
      }

      const serverUrl = Config.API_BASE_URL;
      if (!serverUrl) {
        this.isConnecting = false;
        throw new Error('Server URL not configured');
      }

      this.socket = io(serverUrl, {
        auth: {
          token,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: CALL_TIMEOUTS.SOCKET_RECONNECT_DELAY,
        reconnectionDelayMax: CALL_TIMEOUTS.SOCKET_RECONNECT_MAX_DELAY,
        reconnectionAttempts: CALL_TIMEOUTS.SOCKET_RECONNECT_MAX_ATTEMPTS,
        // forceNew: true,
      });

      this.attachConnectionListeners();
      this.attachServerListeners();

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Socket connection timeout'));
        }, CALL_TIMEOUTS.SOCKET_RECONNECT_MAX_DELAY);

        this.socket!.on(CONNECTION_EVENTS.CONNECT, () => {
          
          clearTimeout(timeout);
          resolve();
        });

        this.socket!.on(CONNECTION_EVENTS.CONNECT_ERROR, (error: Error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
    } finally {
      this.isConnecting = false;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  setListeners(listeners: SocketListeners): void {
    this.listeners = { ...this.listeners, ...listeners };
  }

  clearListeners(): void {
    this.listeners = {};
  }

  // ----------------------------------------------------------
  // Client → Server Emitters
  // ----------------------------------------------------------

  registerUser(
    payload: RegisterUserPayload,
    callback?: (response: RegisterUserCallback) => void,
  ): void {
    this.emit(CLIENT_EVENTS.REGISTER_USER, payload, callback);
  }

  callUser(
    payload: CallUserPayload,
    callback?: (response: CallUserCallback) => void,
  ): void {
    this.emit(CLIENT_EVENTS.CALL_USER, payload, callback);
  }

  answerCall(
    payload: AnswerCallPayload,
    callback?: (response: AnswerCallCallback) => void,
  ): void {
    this.emit(CLIENT_EVENTS.ANSWER_CALL, payload, callback);
  }

  sendIceCandidate(payload: IceCandidatePayload): void {
    this.emit(CLIENT_EVENTS.ICE_CANDIDATE, payload);
  }

  rejectCall(
    payload: RejectCallPayload,
    callback?: (response: RejectCallCallback) => void,
  ): void {
    this.emit(CLIENT_EVENTS.REJECT_CALL, payload, callback);
  }

  endCall(
    payload: EndCallPayload,
    callback?: (response: EndCallCallback) => void,
  ): void {
    this.emit(CLIENT_EVENTS.END_CALL, payload, callback);
  }

  getOnlineUsers(): void {
    this.emit(CLIENT_EVENTS.GET_ONLINE_USERS, {});
  }

  // ----------------------------------------------------------
  // Private
  // ----------------------------------------------------------

  private emit<T, R>(
    event: string,
    payload: T,
    callback?: (response: R) => void,
  ): void {
    if (!this.socket?.connected) {
      console.warn(`[SocketService] Cannot emit "${event}" — socket not connected`);
      return;
    }

    if (callback) {
      this.socket.emit(event, payload, callback);
    } else {
      this.socket.emit(event, payload);
    }
  }

  private attachConnectionListeners(): void {
    if (!this.socket) {
      return;
    }

    this.socket.on(CONNECTION_EVENTS.CONNECT, () => {
      console.log('[SocketService] Connected:', this.socket?.id);
      this.listeners.onConnect?.();
    });

    this.socket.on(CONNECTION_EVENTS.DISCONNECT, (reason: string) => {
      console.log('[SocketService] Disconnected:', reason);
      this.listeners.onDisconnect?.(reason);
    });

    this.socket.on(CONNECTION_EVENTS.CONNECT_ERROR, (error: Error) => {
      console.error('[SocketService] Connection error:', error.message);
      this.listeners.onConnectError?.(error);
    });

    this.socket.io.on('reconnect', () => {
      console.log('[SocketService] Reconnected');
      this.listeners.onReconnect?.();
    });

    this.socket.io.on("reconnect_attempt", attempt => {
    console.log("Trying to reconnect...", attempt);
    this.listeners.onReconnect?.();
});
  }

  private attachServerListeners(): void {
    if (!this.socket) {
      return;
    }

    this.socket.on(
      SERVER_EVENTS.REGISTERED,
      (data: RegisteredEvent) => {
        console.log('[SocketService] Registered:', data.message);
        this.listeners.onRegistered?.(data);
      },
    );

    this.socket.on(
      SERVER_EVENTS.INCOMING_CALL,
      (data: IncomingCallEvent) => {
        console.log('[SocketService] Incoming call from:', data.callerId);
        this.listeners.onIncomingCall?.(data);
      },
    );

    this.socket.on(
      SERVER_EVENTS.CALL_ANSWERED,
      (data: CallAnsweredEvent) => {
        console.log('[SocketService] Call answered by:', data.receiverId);
        this.listeners.onCallAnswered?.(data);
      },
    );

    this.socket.on(
      SERVER_EVENTS.ICE_CANDIDATE,
      (data: IceCandidateEvent) => {
        this.listeners.onIceCandidate?.(data);
      },
    );

    this.socket.on(
      SERVER_EVENTS.CALL_REJECTED,
      (data: CallRejectedEvent) => {
        console.log('[SocketService] Call rejected by:', data.receiverId);
        this.listeners.onCallRejected?.(data);
      },
    );

    this.socket.on(
      SERVER_EVENTS.CALL_ENDED,
      (data: CallEndedEvent) => {
        console.log('[SocketService] Call ended by:', data.endedBy);
        this.listeners.onCallEnded?.(data);
      },
    );

    this.socket.on(
      SERVER_EVENTS.USER_ONLINE,
      (data: UserOnlineEvent) => {
        this.listeners.onUserOnline?.(data);
      },
    );

    this.socket.on(
      SERVER_EVENTS.USER_OFFLINE,
      (data: UserOfflineEvent) => {
        this.listeners.onUserOffline?.(data);
      },
    );

    this.socket.on(
      SERVER_EVENTS.ONLINE_USERS,
      (data: OnlineUsersEvent) => {
        this.listeners.onOnlineUsers?.(data);
      },
    );

    this.socket.on(
      SERVER_EVENTS.ERROR,
      (data: SocketErrorEvent) => {
        console.error('[SocketService] Server error:', data.code, data.message);
        this.listeners.onError?.(data);
      },
    );

    this.socket.on(SERVER_EVENTS.UPDATE_COUNTER_VALUE, (data: LatestCounterValueEvent) => {
      console.log('[SocketService] Updated counter value:', data.value);
      this.listeners.onLatestCounterValue?.(data);
    });

    this.socket.on(SERVER_EVENTS.GET_LATEST_COUNTER_VALUE, (data: LatestCounterValueEvent) => {
      console.log('[SocketService] Latest counter value:', data.value);
      // this.listeners.onLatestCounterValue?.(data);
    });
  }

  private removeAllListeners(): void {
    if (!this.socket) {
      return;
    }

    Object.values(SERVER_EVENTS).forEach((event) => {
      this.socket!.off(event);
    });

    this.socket.off(CONNECTION_EVENTS.CONNECT);
    this.socket.off(CONNECTION_EVENTS.DISCONNECT);
    this.socket.off(CONNECTION_EVENTS.CONNECT_ERROR);
  }
}

export const socketService = new SocketService();
