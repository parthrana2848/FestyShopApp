// All timeout values in milliseconds

export const CALL_TIMEOUTS = {
  /** Server-side ring timeout — caller gives up after this */
  OUTGOING_CALL_TIMEOUT: 30000,

  /** Grace period before showing "reconnecting" UI */
  RECONNECTING_GRACE_PERIOD: 3000,

  /** Max time to wait for reconnection before ending call */
  RECONNECTION_TIMEOUT: 30000,

  /** Socket reconnection delay */
  SOCKET_RECONNECT_DELAY: 1000,

  /** Socket reconnection max delay */
  SOCKET_RECONNECT_MAX_DELAY: 5000,

  /** Socket max reconnection attempts */
  SOCKET_RECONNECT_MAX_ATTEMPTS: 10,

  /** Delay before navigating away after call ends */
  END_CALL_NAVIGATION_DELAY: 1500,

  /** ICE gathering timeout — fallback if gathering stalls */
  ICE_GATHERING_TIMEOUT: 10000,

  /** Background timeout — end call if app is backgrounded too long */
  BACKGROUND_TIMEOUT: 60000,
} as const;

export const ANIMATION_DURATIONS = {
  FADE_IN: 300,
  FADE_OUT: 200,
  SLIDE_UP: 350,
  PULSE: 1500,
  CONTROLS_HIDE: 5000,
} as const;

export const DIMENSIONS = {
  LOCAL_VIDEO_WIDTH: 120,
  LOCAL_VIDEO_HEIGHT: 160,
  LOCAL_VIDEO_MARGIN: 16,
  CONTROL_BUTTON_SIZE: 60,
  CONTROL_BUTTON_SIZE_LARGE: 72,
  CONTROL_ICON_SIZE: 28,
  AVATAR_SIZE_LARGE: 120,
  AVATAR_SIZE_MEDIUM: 80,
  STATUS_BAR_HEIGHT: 44,
} as const;
