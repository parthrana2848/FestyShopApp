import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  CallState,
  ConnectionStatus,
  CallParticipant,
  VideoCallError,
  VideoCallState,
} from '../types/videoCall.types';

const initialState: VideoCallState = {
  callState: 'idle',
  caller: null,
  receiver: null,
  callRecordId: null,
  hasLocalStream: false,
  hasRemoteStream: false,
  isMuted: false,
  isCameraEnabled: true,
  isSpeakerOn: true,
  connectionStatus: 'disconnected',
  error: null,
  callStartTime: null,
  counterValue: 0,
};

const videoCallSlice = createSlice({
  name: 'videoCall',
  initialState,
  reducers: {
    setCallState(state, action: PayloadAction<CallState>) {
      state.callState = action.payload;
      if (action.payload === 'connected') {
        state.callStartTime = Date.now();
      }
      if (
        action.payload === 'idle' ||
        action.payload === 'ended' ||
        action.payload === 'failed'
      ) {
        state.callStartTime = null;
      }
    },

    setCaller(state, action: PayloadAction<CallParticipant | null>) {
      state.caller = action.payload;
    },

    setReceiver(state, action: PayloadAction<CallParticipant | null>) {
      state.receiver = action.payload;
    },

    setCallRecordId(state, action: PayloadAction<string | null>) {
      state.callRecordId = action.payload;
    },

    setHasLocalStream(state, action: PayloadAction<boolean>) {
      state.hasLocalStream = action.payload;
    },

    setHasRemoteStream(state, action: PayloadAction<boolean>) {
      state.hasRemoteStream = action.payload;
    },

    setIsMuted(state, action: PayloadAction<boolean>) {
      state.isMuted = action.payload;
    },

    setIsCameraEnabled(state, action: PayloadAction<boolean>) {
      state.isCameraEnabled = action.payload;
    },

    setIsSpeakerOn(state, action: PayloadAction<boolean>) {
      state.isSpeakerOn = action.payload;
    },

    setConnectionStatus(state, action: PayloadAction<ConnectionStatus>) {
      state.connectionStatus = action.payload;
    },

    setError(state, action: PayloadAction<VideoCallError | null>) {
      state.error = action.payload;
    },

    setIncomingCall(
      state,
      action: PayloadAction<{
        caller: CallParticipant;
        callRecordId?: string;
      }>,
    ) {
      state.callState = 'incoming';
      state.caller = action.payload.caller;
      state.callRecordId = action.payload.callRecordId ?? null;
      state.error = null;
    },

    setOutgoingCall(
      state,
      action: PayloadAction<{
        receiver: CallParticipant;
        callRecordId?: string;
      }>,
    ) {
      state.callState = 'outgoing';
      state.receiver = action.payload.receiver;
      state.callRecordId = action.payload.callRecordId ?? null;
      state.error = null;
    },


    setCounterValue(state, action: PayloadAction<number>) {
      state.counterValue = action.payload;
    },

    resetCallState() {
      return initialState;
    },
  },
});

export const {
  setCallState,
  setCaller,
  setReceiver,
  setCallRecordId,
  setHasLocalStream,
  setHasRemoteStream,
  setIsMuted,
  setIsCameraEnabled,
  setIsSpeakerOn,
  setConnectionStatus,
  setError,
  setIncomingCall,
  setOutgoingCall,
  setCounterValue,
  resetCallState,
} = videoCallSlice.actions;

export default videoCallSlice.reducer;
