import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';
import videoCallReducer from '../modules/video-call/store/videoCallSlice';
import presenceReducer from '../modules/video-call/store/presenceSlice';

// Enable Immer's MapSet plugin to handle Set and Map objects in state
enableMapSet();

export const store = configureStore({
  reducer: {
    videoCall: videoCallReducer,
    presence: presenceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // MediaStream objects and Set objects are not serializable — ignore these paths
        ignoredActions: [
          'videoCall/setHasLocalStream',
          'videoCall/setHasRemoteStream',
          'presence/setOnlineUsers',
          'presence/addOnlineUser',
          'presence/removeOnlineUser',
          'presence/clearOnlineUsers',
        ],
        ignoredPaths: ['presence.onlineUserIds'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
