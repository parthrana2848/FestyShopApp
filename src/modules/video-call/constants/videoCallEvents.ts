// ============================================================
// Socket.IO Event Names — Exact match to API specification
// ============================================================

// Client → Server Events
export const CLIENT_EVENTS = {
  REGISTER_USER: 'register-user',
  CALL_USER: 'call-user',
  ANSWER_CALL: 'answer-call',
  ICE_CANDIDATE: 'ice-candidate',
  REJECT_CALL: 'reject-call',
  END_CALL: 'end-call',
  GET_ONLINE_USERS: 'get-online-users',
} as const;

// Server → Client Events
export const SERVER_EVENTS = {
  REGISTERED: 'registered',
  INCOMING_CALL: 'incoming-call',
  CALL_ANSWERED: 'call-answered',
  ICE_CANDIDATE: 'ice-candidate',
  CALL_REJECTED: 'call-rejected',
  CALL_ENDED: 'call-ended',
  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline',
  ONLINE_USERS: 'online-users',
  GET_LATEST_COUNTER_VALUE: 'counter:getLatest',
  UPDATE_COUNTER_VALUE: 'counter:update',
  ERROR: 'error',
} as const;

// Socket Connection Events
export const CONNECTION_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',
  RECONNECT_ATTEMPT: 'reconnect_attempt',
  RECONNECT_FAILED: 'reconnect_failed',
} as const;
