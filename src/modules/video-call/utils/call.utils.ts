import { ERROR_STRINGS } from '../constants/videoCallStrings';
import type { SocketErrorCode } from '../types/socket.types';
import type { CallState } from '../types/videoCall.types';

export function formatCallDuration(startTime: number | null): string {
  if (!startTime) {
    return '00:00';
  }

  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const pad = (n: number): string => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${pad(minutes)}:${pad(seconds)}`;
}

export function getErrorMessage(code: SocketErrorCode | string): string {
  switch (code) {
    case 'UNAUTHORIZED':
      return ERROR_STRINGS.UNAUTHORIZED;
    case 'INVALID_PAYLOAD':
      return ERROR_STRINGS.INVALID_PAYLOAD;
    case 'USER_NOT_FOUND':
      return ERROR_STRINGS.USER_NOT_FOUND;
    case 'USER_OFFLINE':
      return ERROR_STRINGS.USER_OFFLINE;
    case 'CALL_FAILED':
      return ERROR_STRINGS.CALL_FAILED;
    case 'INTERNAL_ERROR':
      return ERROR_STRINGS.INTERNAL_ERROR;
    default:
      return ERROR_STRINGS.UNKNOWN_ERROR;
  }
}

export function isCallActiveState(state: CallState): boolean {
  return (
    state === 'incoming' ||
    state === 'outgoing' ||
    state === 'connecting' ||
    state === 'connected' ||
    state === 'reconnecting'
  );
}

export function isCallTerminalState(state: CallState): boolean {
  return (
    state === 'idle' ||
    state === 'ended' ||
    state === 'rejected' ||
    state === 'failed'
  );
}
