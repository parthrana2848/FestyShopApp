import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { socketService } from '../services/socket.service';
import {
  setConnectionStatus,
  addOnlineUser,
  removeOnlineUser,
  setOnlineUsers,
  setError,
} from '../store/presenceSlice';
import {
  selectOnlineUserIds,
  selectOnlineUserCount,
  selectConnectionStatus,
  selectIsConnected,
  selectError,
  selectIsUserOnline,
  selectUserNames,
} from '../store/presenceSelectors';
import type { AppDispatch, RootState } from '../../../store';
import { useAuth } from '../../../context/AuthContext';

/**
 * Hook to manage and consume real-time presence state
 *
 * Returns:
 * - onlineUserIds: Array of currently online user IDs
 * - onlineCount: Number of online users
 * - connectionStatus: Current socket connection status
 * - isConnected: Whether socket is connected
 * - error: Error message if any
 * - isUserOnline: Function to check if a specific user is online
 * - getOnlineUsers: Function to request current online users from server
 *
 * Automatically:
 * - Sets up socket listeners for presence events
 * - Requests online users on first connection
 * - Handles USER_ONLINE/USER_OFFLINE updates
 * - Manages connection status
 * - Cleans up listeners on unmount
 */
export function usePresence() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, currentUserQuery } = useAuth();
  const currentUser = currentUserQuery.data;

  // Selectors
  const onlineUserIds = useSelector(selectOnlineUserIds);
  const onlineCount = useSelector(selectOnlineUserCount);
  const connectionStatus = useSelector(selectConnectionStatus);
  const isConnected = useSelector(selectIsConnected);
  const error = useSelector(selectError);
  const userNames = useSelector(selectUserNames);

  // Helper to check if specific user is online
  const isUserOnline = useCallback(
    (userId: string) => {
      return useSelector((state: RootState) => selectIsUserOnline(state, userId));
    },
    [],
  );

  // Helper to request online users from server
  const getOnlineUsers = useCallback(() => {
    socketService.getOnlineUsers();
  }, []);

  // Setup socket listeners for presence events
  useEffect(() => {
    const userId = currentUser?.id;
    if (!userId || !token) {
      return;
    }

    // Listener for connection
    const handleConnect = () => {
      dispatch(setConnectionStatus('connected'));
      // Request current online users list
      socketService.getOnlineUsers();
    };

    // Listener for disconnection
    const handleDisconnect = (reason: string) => {
      dispatch(setConnectionStatus('disconnected'));
      // If disconnect reason is not normal, set error
      if (reason !== 'io client namespace disconnect') {
        dispatch(setError(`Disconnected: ${reason}`));
      }
    };

    // Listener for connection error
    const handleConnectError = (error: Error) => {
      dispatch(setConnectionStatus('disconnected'));
      dispatch(setError(error.message));
    };

    // Listener for reconnection
    const handleReconnect = () => {
      dispatch(setConnectionStatus('connected'));
      dispatch(setError(null));
      // Re-sync online users after reconnection
      socketService.getOnlineUsers();
    };

    // Listener for user online
    const handleUserOnline = (data: { userId: string; userName?: string }) => {
      if (data.userId && data.userId !== userId) {
        dispatch(addOnlineUser({ userId: data.userId, userName: data.userName }));
      }
    };

    // Listener for user offline
    const handleUserOffline = (data: { userId: string }) => {
      if (data.userId) {
        dispatch(removeOnlineUser(data.userId));
      }
    };

    // Listener for online users snapshot
    const handleOnlineUsers = (data: { userIds: string[] }) => {
      if (Array.isArray(data.userIds)) {
        dispatch(setOnlineUsers(data.userIds));
      }
    };

    // Set listeners on socket service
    socketService.setListeners({
      onConnect: handleConnect,
      onDisconnect: handleDisconnect,
      onConnectError: handleConnectError,
      onReconnect: handleReconnect,
      onUserOnline: handleUserOnline,
      onUserOffline: handleUserOffline,
      onOnlineUsers: handleOnlineUsers,
    });

    // Do NOT call socketService.clearListeners() here — the socket service is a
    // singleton shared with useVideoCall / callService. Clearing all listeners
    // would wipe critical call listeners (e.g. onCallAnswered) and break the
    // call flow. Listeners are cleaned up when the socket actually disconnects.
    return () => {
      socketService.setListeners({
        onConnect: undefined,
        onDisconnect: undefined,
        onConnectError: undefined,
        onReconnect: undefined,
        onUserOnline: undefined,
        onUserOffline: undefined,
        onOnlineUsers: undefined,
      });
    };
  }, [dispatch, currentUser?.id, token]);

  return {
    onlineUserIds,
    onlineCount,
    connectionStatus,
    isConnected,
    error,
    userNames,
    isUserOnline,
    getOnlineUsers,
  };
}
