import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  setCallState,
  setCaller,
  setError,
  setHasLocalStream,
  setHasRemoteStream,
  setIsMuted,
  setIsCameraEnabled,
  setIsSpeakerOn,
  setOutgoingCall,
  resetCallState,
} from './videoCallSlice';
import { callService } from '../services/call.service';
import { webRTCService } from '../services/webrtc.service';
import type { InitiateCallParams } from '../types/videoCall.types';
import type { RootState } from '../../../store';
import InCallManager from 'react-native-incall-manager';

export const initiateCallThunk = createAsyncThunk<
  void,
  InitiateCallParams,
  { state: RootState }
>('videoCall/initiateCall', async (params, { dispatch, rejectWithValue }) => {
  try {
    dispatch(setCaller({
      userId: params.callerId,
      userName: params.callerName ?? params.callerId,
    }));
    dispatch(
      setOutgoingCall({
        receiver: {
          userId: params.receiverId,
          userName: params.receiverName ?? params.receiverId,
        },
      }),
    );

    await callService.initiateCall(params.receiverId, params.callerId);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to initiate call';
    dispatch(
      setError({
        code: 'CALL_FAILED',
        message,
      }),
    );
    dispatch(setCallState('failed'));
    return rejectWithValue(message);
  }
});

export const acceptCallThunk = createAsyncThunk<
  void,
  void,
  { state: RootState }
>('videoCall/acceptCall', async (_, { dispatch, getState, rejectWithValue }) => {
  try {
    const state = getState();
    const callerId = state.videoCall.caller?.userId;
    if (!callerId) {
      throw new Error('No caller information available');
    }

    // Do NOT dispatch setCallState('connecting') here — acceptCall() already
    // dispatches it after the backend ACKs the answer. Dispatching it early
    // triggers navigation to VideoCallScreen before media/SDP are ready,
    // causing "unexpected call ended" errors if anything in acceptCall fails.
    await callService.acceptCall(callerId);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to accept call';
    dispatch(
      setError({
        code: 'CALL_FAILED',
        message,
      }),
    );
    dispatch(setCallState('failed'));
    return rejectWithValue(message);
  }
});

export const rejectCallThunk = createAsyncThunk<
  void,
  void,
  { state: RootState }
>('videoCall/rejectCall', async (_, { dispatch, getState, rejectWithValue }) => {
  try {
    const state = getState();
    const callerId = state.videoCall.caller?.userId;
    if (!callerId) {
      throw new Error('No caller information available');
    }

    await callService.rejectCall(callerId);
    dispatch(setCallState('rejected'));
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to reject call';
    dispatch(setCallState('rejected'));
    return rejectWithValue(message);
  }
});

export const endCallThunk = createAsyncThunk<
  void,
  void,
  { state: RootState }
>('videoCall/endCall', async (_, { dispatch, getState, rejectWithValue }) => {
  try {
    const state = getState();
    const remoteUserId =
      state.videoCall.receiver?.userId ?? state.videoCall.caller?.userId;

    if (remoteUserId) {
      await callService.endCall(remoteUserId);
    }

    callService.cleanup();
    InCallManager.stop();
    dispatch(setCallState('ended'));
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to end call';
    callService.cleanup();
    InCallManager.stop();
    dispatch(setCallState('ended'));
    return rejectWithValue(message);
  }
});

export const toggleMuteThunk = createAsyncThunk<
  void,
  void,
  { state: RootState }
>('videoCall/toggleMute', async (_, { dispatch, getState }) => {
  const state = getState();
  const newMutedState = !state.videoCall.isMuted;
  webRTCService.setAudioEnabled(!newMutedState);
  dispatch(setIsMuted(newMutedState));
});

export const toggleCameraThunk = createAsyncThunk<
  void,
  void,
  { state: RootState }
>('videoCall/toggleCamera', async (_, { dispatch, getState }) => {
  const state = getState();
  const newCameraState = !state.videoCall.isCameraEnabled;
  webRTCService.setVideoEnabled(newCameraState);
  dispatch(setIsCameraEnabled(newCameraState));
  dispatch(setHasLocalStream(newCameraState));
});

export const toggleSpeakerThunk = createAsyncThunk<
  void,
  void,
  { state: RootState }
>('videoCall/toggleSpeaker', async (_, { dispatch, getState }) => {
  const state = getState();
  const newSpeakerState = !state.videoCall.isSpeakerOn;
  InCallManager.setSpeakerphoneOn(newSpeakerState);
  dispatch(setIsSpeakerOn(newSpeakerState));
});

export const switchCameraThunk = createAsyncThunk<void, void>(
  'videoCall/switchCamera',
  async () => {
    await webRTCService.switchCamera();
  },
);

export const cleanupCallThunk = createAsyncThunk<void, void>(
  'videoCall/cleanup',
  async (_, { dispatch }) => {
    callService.cleanup();
    InCallManager.stop();
    dispatch(resetCallState());
  },
);
