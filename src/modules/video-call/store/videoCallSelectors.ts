import type { RootState } from '../../../store';
import type {
  CallState,
  ConnectionStatus,
  CallParticipant,
  VideoCallError,
} from '../types/videoCall.types';

const selectVideoCall = (state: RootState) => state.videoCall;

export const selectCallState = (state: RootState): CallState =>
  selectVideoCall(state).callState;

export const selectCaller = (state: RootState): CallParticipant | null =>
  selectVideoCall(state).caller;

export const selectReceiver = (state: RootState): CallParticipant | null =>
  selectVideoCall(state).receiver;

export const selectCallRecordId = (state: RootState): string | null =>
  selectVideoCall(state).callRecordId;

export const selectHasLocalStream = (state: RootState): boolean =>
  selectVideoCall(state).hasLocalStream;

export const selectHasRemoteStream = (state: RootState): boolean =>
  selectVideoCall(state).hasRemoteStream;

export const selectIsMuted = (state: RootState): boolean =>
  selectVideoCall(state).isMuted;

export const selectIsCameraEnabled = (state: RootState): boolean =>
  selectVideoCall(state).isCameraEnabled;

export const selectIsSpeakerOn = (state: RootState): boolean =>
  selectVideoCall(state).isSpeakerOn;

export const selectConnectionStatus = (state: RootState): ConnectionStatus =>
  selectVideoCall(state).connectionStatus;

export const selectError = (state: RootState): VideoCallError | null =>
  selectVideoCall(state).error;

export const selectCallStartTime = (state: RootState): number | null =>
  selectVideoCall(state).callStartTime;

export const selectIsInCall = (state: RootState): boolean => {
  const callState = selectCallState(state);
  return (
    callState === 'connecting' ||
    callState === 'connected' ||
    callState === 'reconnecting'
  );
};

export const selectIsCallActive = (state: RootState): boolean => {
  const callState = selectCallState(state);
  return callState !== 'idle' && callState !== 'ended' && callState !== 'failed';
};

export const selectRemoteParticipant = (state: RootState): CallParticipant | null => {
  const { caller, receiver } = selectVideoCall(state);
  // On the caller's device: receiver is set via setOutgoingCall → returns receiver
  // On the receiver's device: receiver is null, caller is set via setIncomingCall → falls back to caller
  return receiver ?? caller;
};

export const selectCounterValue = (state: RootState): number | null => {
  const setCounter = selectVideoCall(state).counterValue;
  return setCounter;
}

