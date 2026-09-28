import { RootState } from '../../../store';

// Root selector
export const selectPresence = (state: RootState) => state.presence;

// Online users set
export const selectOnlineUserIds = (state: RootState) => {
  return Array.from(state.presence.onlineUserIds);
};

// Online user count
export const selectOnlineUserCount = (state: RootState) => {
  return state.presence.onlineUserIds.size;
};

// Connection status
export const selectConnectionStatus = (state: RootState) => {
  return state.presence.connectionStatus;
};

// Is connected
export const selectIsConnected = (state: RootState) => {
  return state.presence.connectionStatus === 'connected';
};

// Is connecting/reconnecting
export const selectIsConnecting = (state: RootState) => {
  const status = state.presence.connectionStatus;
  return status === 'connecting' || status === 'reconnecting';
};

// Loading state
export const selectIsLoading = (state: RootState) => {
  return state.presence.isLoading;
};

// Error state
export const selectError = (state: RootState) => {
  return state.presence.error;
};

// Last sync time
export const selectLastSyncTime = (state: RootState) => {
  return state.presence.lastSyncTime;
};

// Check if specific user is online
export const selectIsUserOnline = (state: RootState, userId: string) => {
  return state.presence.onlineUserIds.has(userId);
};

// Get a single user's name by ID
export const selectUserName = (state: RootState, userId: string) => {
  return state.presence.userNames[userId];
};

// Get all stored user names
export const selectUserNames = (state: RootState) => {
  return state.presence.userNames;
};
