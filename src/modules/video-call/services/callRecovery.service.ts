import { AppState, AppStateStatus } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { store } from '../../../store';
import {
  setCallState,
  setConnectionStatus,
  resetCallState,
} from '../store/videoCallSlice';
import { socketService } from './socket.service';
import { callService } from './call.service';
import { webRTCService } from './webrtc.service';
import { CALL_TIMEOUTS } from '../constants/videoCallTimeouts';
import InCallManager from 'react-native-incall-manager';

class CallRecoveryService {
  private appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;
  private netInfoUnsubscribe: (() => void) | null = null;
  private backgroundTimer: ReturnType<typeof setTimeout> | null = null;
  private lastActiveTimestamp: number | null = null;

  start(): void {
    this.startAppStateListener();
    this.startNetInfoListener();
  }

  stop(): void {
    this.stopAppStateListener();
    this.stopNetInfoListener();
    this.clearBackgroundTimer();
  }

  // ----------------------------------------------------------
  // AppState Listener
  // ----------------------------------------------------------

  private startAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange,
    );
  }

  private stopAppStateListener(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }

  private handleAppStateChange = (nextState: AppStateStatus): void => {
    const callState = store.getState().videoCall.callState;
    const isInCall =
      callState === 'connected' ||
      callState === 'connecting' ||
      callState === 'reconnecting';

    if (nextState === 'background' || nextState === 'inactive') {
      this.handleGoingToBackground(isInCall);
    } else if (nextState === 'active') {
      this.handleComingToForeground(isInCall);
    }
  };

  private handleGoingToBackground(isInCall: boolean): void {
    this.lastActiveTimestamp = Date.now();

    if (isInCall) {
      // Keep audio running but disable camera to save resources
      webRTCService.setVideoEnabled(false);

      // Set background timeout — auto-end call after extended background
      this.backgroundTimer = setTimeout(() => {
        const currentCallState = store.getState().videoCall.callState;
        if (
          currentCallState === 'connected' ||
          currentCallState === 'reconnecting'
        ) {
          const remoteUserId =
            store.getState().videoCall.receiver?.userId ??
            store.getState().videoCall.caller?.userId;
          if (remoteUserId) {
            callService.endCall(remoteUserId);
          }
          callService.cleanup();
          InCallManager.stop();
          store.dispatch(resetCallState());
        }
      }, CALL_TIMEOUTS.BACKGROUND_TIMEOUT);
    }
  }

  private handleComingToForeground(isInCall: boolean): void {
    this.clearBackgroundTimer();

    if (isInCall) {
      // Re-enable camera if it was on before
      const isCameraEnabled = store.getState().videoCall.isCameraEnabled;
      if (isCameraEnabled) {
        webRTCService.setVideoEnabled(true);
      }

      // Check if socket is still connected; reconnect if needed
      if (!socketService.isConnected) {
        store.dispatch(setCallState('reconnecting'));
        socketService.connect().catch((error) => {
          console.error(
            '[CallRecoveryService] Failed to reconnect socket:',
            error,
          );
        });
      }
    }

    this.lastActiveTimestamp = null;
  }

  // ----------------------------------------------------------
  // NetInfo Listener
  // ----------------------------------------------------------

  private startNetInfoListener(): void {
    this.netInfoUnsubscribe = NetInfo.addEventListener(
      this.handleNetInfoChange,
    );
  }

  private stopNetInfoListener(): void {
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
      this.netInfoUnsubscribe = null;
    }
  }

  private handleNetInfoChange = (state: NetInfoState): void => {
    const callState = store.getState().videoCall.callState;

    if (state.isConnected) {
      store.dispatch(setConnectionStatus('connected'));

      // If we were reconnecting, try to restore socket
      if (callState === 'reconnecting' && !socketService.isConnected) {
        socketService.connect().catch((error) => {
          console.error(
            '[CallRecoveryService] Failed to reconnect after network restore:',
            error,
          );
          store.dispatch(setConnectionStatus('failed'));
        });
      }
    } else {
      store.dispatch(setConnectionStatus('disconnected'));

      if (
        callState === 'connected' ||
        callState === 'connecting'
      ) {
        store.dispatch(setCallState('reconnecting'));
      }
    }
  };

  // ----------------------------------------------------------
  // Private Helpers
  // ----------------------------------------------------------

  private clearBackgroundTimer(): void {
    if (this.backgroundTimer) {
      clearTimeout(this.backgroundTimer);
      this.backgroundTimer = null;
    }
  }
}

export const callRecoveryService = new CallRecoveryService();
