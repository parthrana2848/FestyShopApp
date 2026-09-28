// ============================================================
// Socket.IO Event Payload Types — Single Source of Truth
// ============================================================

// ----------------------------------------------------------
// Common
// ----------------------------------------------------------

export interface SocketCallback {
  success: boolean;
  message?: string;
}

// ----------------------------------------------------------
// Client → Server Event Payloads
// ----------------------------------------------------------

export interface RegisterUserPayload {
  userId: string;
  userName?: string;  
}

export interface RegisterUserCallback extends SocketCallback {}

export interface CallUserPayload {
  callerId: string;
  receiverId: string;
  offer: {
    type: 'offer';
    sdp: string;
  };
}

export interface CallUserCallback extends SocketCallback {
  callRecordId?: string;
}

export interface AnswerCallPayload {
  callerId: string;
  answer: {
    type: 'answer';
    sdp: string;
  };
}

export interface AnswerCallCallback extends SocketCallback {}

export interface IceCandidatePayload {
  receiverId: string;
  candidate: {
    candidate?: string;
    sdpMid?: string;
    sdpMLineIndex?: number;
  };
}

export interface RejectCallPayload {
  receiverId: string;
}

export interface RejectCallCallback extends SocketCallback {}

export interface EndCallPayload {
  receiverId: string;
}

export interface EndCallCallback extends SocketCallback {}

// ----------------------------------------------------------
// Server → Client Event Payloads
// ----------------------------------------------------------

export interface RegisteredEvent {
  userId: string;
  message: string;
}

export interface IncomingCallEvent {
  callerId: string;
  callerName: string;
  offer: {
    type: 'offer';
    sdp: string;
  };
  callRecordId?: string;
}

export interface CallAnsweredEvent {
  receiverId: string;
  receiverName: string;
  answer: {
    type: 'answer';
    sdp: string;
  };
}

export interface IceCandidateEvent {
  senderId: string;
  candidate: {
    candidate?: string;
    sdpMid?: string;
    sdpMLineIndex?: number;
  };
}

export interface CallRejectedEvent {
  receiverId: string;
  reason?: string;
}

export interface CallEndedEvent {
  endedBy: string;
  reason?: string;
}

export interface UserOnlineEvent {
  userId: string;
  userName: string;
}

export interface UserOfflineEvent {
  userId: string;
  userName: string;
}

export type SocketErrorCode =
  | 'UNAUTHORIZED'
  | 'INVALID_PAYLOAD'
  | 'USER_NOT_FOUND'
  | 'USER_OFFLINE'
  | 'CALL_FAILED'
  | 'INTERNAL_ERROR';

export interface SocketErrorEvent {
  code: SocketErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

// ----------------------------------------------------------
// Presence Events
// ----------------------------------------------------------

export interface GetOnlineUsersPayload {
  // No payload needed for GET_ONLINE_USERS
}

export interface OnlineUsersEvent {
  userIds: string[];
}

export interface LatestCounterValueEvent {
  value: number;
}
