export const VIDEO_CALL_STRINGS = {
  // Incoming Call Screen
  INCOMING_CALL: 'Incoming Video Call',
  INCOMING_CALL_FROM: 'Video call from',
  ACCEPT: 'Accept',
  DECLINE: 'Decline',

  // Outgoing Call Screen
  CALLING: 'Calling...',
  RINGING: 'Ringing...',
  CANCEL: 'Cancel',

  // Video Call Screen
  CONNECTING: 'Connecting...',
  CONNECTED: 'Connected',
  RECONNECTING: 'Reconnecting...',
  CALL_ENDED: 'Call Ended',
  CALL_DURATION: 'Call Duration',

  // Controls
  MUTE: 'Mute',
  UNMUTE: 'Unmute',
  CAMERA_ON: 'Camera On',
  CAMERA_OFF: 'Camera Off',
  SPEAKER: 'Speaker',
  END_CALL: 'End Call',
  FLIP_CAMERA: 'Flip',

  // States
  WAITING_FOR_ANSWER: 'Waiting for answer...',
  NO_ANSWER: 'No Answer',
  CALL_REJECTED: 'Call Declined',
  CALL_FAILED: 'Call Failed',
  MISSED_CALL: 'Missed Call',

  // User Status
  ONLINE: 'Online',
  OFFLINE: 'Offline',
} as const;

export const ERROR_STRINGS = {
  // Socket Errors
  UNAUTHORIZED: 'Authentication failed. Please log in again.',
  INVALID_PAYLOAD: 'Invalid request. Please try again.',
  USER_NOT_FOUND: 'User not found.',
  USER_OFFLINE: 'User is currently offline.',
  CALL_FAILED: 'Call failed. Please try again.',
  INTERNAL_ERROR: 'Something went wrong. Please try again later.',

  // Media Errors
  CAMERA_UNAVAILABLE: 'Camera is not available.',
  MICROPHONE_UNAVAILABLE: 'Microphone is not available.',
  MEDIA_ACCESS_DENIED: 'Camera and microphone access is required for video calls.',

  // WebRTC Errors
  PEER_CONNECTION_FAILED: 'Connection failed. Please try again.',
  ICE_CONNECTION_FAILED: 'Network connection failed.',
  OFFER_CREATION_FAILED: 'Failed to initiate call.',
  ANSWER_CREATION_FAILED: 'Failed to answer call.',

  // Network Errors
  NETWORK_DISCONNECTED: 'Network connection lost.',
  SOCKET_DISCONNECTED: 'Server connection lost.',
  RECONNECTION_FAILED: 'Unable to reconnect. Please check your network.',

  // Generic
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

export const PERMISSION_STRINGS = {
  CAMERA_TITLE: 'Camera Permission Required',
  CAMERA_MESSAGE: 'This app needs camera access to make video calls.',
  MICROPHONE_TITLE: 'Microphone Permission Required',
  MICROPHONE_MESSAGE: 'This app needs microphone access to make video calls.',
  SETTINGS_TITLE: 'Permission Required',
  SETTINGS_MESSAGE: 'Please enable camera and microphone permissions in Settings to make video calls.',
  OPEN_SETTINGS: 'Open Settings',
  NOT_NOW: 'Not Now',
  GRANT_PERMISSION: 'Grant Permission',
} as const;

export const COMMON_STRINGS = {
  OK: 'OK',
  CANCEL: 'Cancel',
  RETRY: 'Retry',
  CLOSE: 'Close',
  UNKNOWN_USER: 'Unknown User',
} as const;
