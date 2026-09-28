export type CallState =
  | 'idle'
  | 'incoming'
  | 'outgoing'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'ended'
  | 'rejected'
  | 'failed';

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed';

export interface CallParticipant {
  userId: string;
  userName: string;
}

export interface VideoCallError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface VideoCallState {
  callState: CallState;
  caller: CallParticipant | null;
  receiver: CallParticipant | null;
  callRecordId: string | null;
  hasLocalStream: boolean;
  hasRemoteStream: boolean;
  isMuted: boolean;
  isCameraEnabled: boolean;
  isSpeakerOn: boolean;
  connectionStatus: ConnectionStatus;
  error: VideoCallError | null;
  callStartTime: number | null;
  counterValue: number;
}

export interface InitiateCallParams {
  callerId: string;
  callerName?: string;
  receiverId: string;
  receiverName?: string;
}

export interface IncomingCallParams {
  callerId: string;
  callerName: string;
  offer: {
    type: 'offer';
    sdp: string;
  };
  callRecordId?: string;
}

export interface OneSignalCallPayload {
  type: 'video_call';
  callerId: string;
  callerName: string;
  callRecordId: string;
}
