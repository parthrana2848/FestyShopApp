import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface PresenceState {
  onlineUserIds: Set<string>;
  userNames: Record<string, string>;
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  error: string | null;
  lastSyncTime: number | null;
}

const initialState: PresenceState = {
  onlineUserIds: new Set(),
  userNames: {},
  connectionStatus: 'disconnected',
  isLoading: false,
  error: null,
  lastSyncTime: null,
};

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    // Connection status
    setConnectionStatus(state, action: PayloadAction<ConnectionStatus>) {
      state.connectionStatus = action.payload;
      if (action.payload === 'connected') {
        state.error = null;
      }
    },

    // Loading state
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    // Error handling
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },

    // Add single user to online set
    addOnlineUser(state, action: PayloadAction<{ userId: string; userName?: string }>) {
      state.onlineUserIds.add(action.payload.userId);
      if (action.payload.userName) {
        state.userNames[action.payload.userId] = action.payload.userName;
      }
    },

    // Remove single user from online set
    removeOnlineUser(state, action: PayloadAction<string>) {
      state.onlineUserIds.delete(action.payload);
      delete state.userNames[action.payload];
    },

    // Replace entire online users list (from server snapshot)
    setOnlineUsers(state, action: PayloadAction<string[]>) {
      state.onlineUserIds = new Set(action.payload);
      state.lastSyncTime = Date.now();
      state.isLoading = false;
      state.error = null;
    },

    // Store user name mappings (e.g. from API fetch)
    setUserName(state, action: PayloadAction<{ userId: string; userName: string }>) {
      state.userNames[action.payload.userId] = action.payload.userName;
    },

    // Clear all online users
    clearOnlineUsers(state) {
      state.onlineUserIds.clear();
      state.userNames = {};
    },

    // Reset to initial state
    resetPresence() {
      return initialState;
    },
  },
});

export const {
  setConnectionStatus,
  setLoading,
  setError,
  addOnlineUser,
  removeOnlineUser,
  setOnlineUsers,
  setUserName,
  clearOnlineUsers,
  resetPresence,
} = presenceSlice.actions;

export default presenceSlice.reducer;
