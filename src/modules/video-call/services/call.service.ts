import { store } from '../../../store';
import {
  setCallState,
  setCallRecordId,
  setHasLocalStream,
  setHasRemoteStream,
  setIncomingCall,
  setError,
  resetCallState,
  setCounterValue,
} from '../store/videoCallSlice';
import { socketService } from './socket.service';
import { webRTCService } from './webrtc.service';
import type {
  IncomingCallEvent,
  CallAnsweredEvent,
  IceCandidateEvent,
  CallRejectedEvent,
  CallEndedEvent,
  SocketErrorEvent,
} from '../types/socket.types';
import type { RTCIceCandidateData, RTCConnectionState } from '../types/webrtc.types';
import { ERROR_STRINGS } from '../constants/videoCallStrings';
import InCallManager from 'react-native-incall-manager';

class CallService {
  private currentRemoteUserId: string | null = null;

  /**
   * Initializes socket listeners that bridge server events to Redux + WebRTC.
   * Call once after socket connects and user registers.
   */
  setupSocketListeners(): void {
    socketService.setListeners({
      onIncomingCall: this.handleIncomingCall,
      onCallAnswered: this.handleCallAnswered,
      onIceCandidate: this.handleIceCandidate,
      onCallRejected: this.handleCallRejected,
      onCallEnded: this.handleCallEnded,
      onError: this.handleSocketError,
      onDisconnect: this.handleDisconnect,
      onReconnect: this.handleReconnect,
      onLatestCounterValue:this.handleLatestCounterValue,
    });
  }

  // ----------------------------------------------------------
  // Caller Flow
  // ----------------------------------------------------------

  async initiateCall(receiverId: string, callerId: string): Promise<void> {
    this.currentRemoteUserId = receiverId;

    // 1. Create RTCPeerConnection
    webRTCService.createPeerConnection({
      onRemoteStream: this.onRemoteStream,
      onConnectionStateChange: this.onConnectionStateChange,
      onIceCandidate: this.onLocalIceCandidate,
    });

    // 2 & 3. Get camera + microphone stream
    await webRTCService.getLocalStream();
    store.dispatch(setHasLocalStream(true));

    // 4. Add tracks to peer connection
    webRTCService.addLocalTracks();

    // 5 & 6. Create SDP offer + setLocalDescription
    const offer = await webRTCService.createOffer();

    // Start ringback tone
    InCallManager.start({ media: 'video', ringback: '_BUNDLE_' });

    // 7. Emit call-user
    return new Promise<void>((resolve, reject) => {
      socketService.callUser(
        {
          callerId,
          receiverId,
          offer: {
            type: 'offer',
            sdp: offer.sdp,
          },
        },
        (response) => {
          if (response.success) {
            if (response.callRecordId) {
              store.dispatch(setCallRecordId(response.callRecordId));
            }
            resolve();
          } else {
            reject(new Error(response.message ?? ERROR_STRINGS.CALL_FAILED));
          }
        },
      );
    });
    // Steps 8-11 happen via event listeners (handleCallAnswered)
  }

  // ----------------------------------------------------------
  // Callee Flow
  // ----------------------------------------------------------

  async acceptCall(callerId: string): Promise<void> {
    this.currentRemoteUserId = callerId;
    const state = store.getState();
    const incomingOffer = this.pendingOffer;

    if (!incomingOffer) {
      throw new Error('No pending offer to accept');
    }

    // 4. Create RTCPeerConnection
    webRTCService.createPeerConnection({
      onRemoteStream: this.onRemoteStream,
      onConnectionStateChange: this.onConnectionStateChange,
      onIceCandidate: this.onLocalIceCandidate,
    });

    // Get local media
    await webRTCService.getLocalStream();
    store.dispatch(setHasLocalStream(true));

    // Add local tracks
    webRTCService.addLocalTracks();

    // 5. setRemoteDescription(offer)
    await webRTCService.setRemoteDescription(incomingOffer);

    // 6 & 7. Create answer + setLocalDescription
    const answer = await webRTCService.createAnswer();

    // Start InCallManager
    InCallManager.start({ media: 'video' });
    InCallManager.setForceSpeakerphoneOn(true);

    // 8. Emit answer-call
    return new Promise<void>((resolve, reject) => {
      socketService.answerCall(
        {
          callerId,
          answer: {
            type: 'answer',
            sdp: answer.sdp,
          },
        },
        (response) => {
          if (response.success) {
            store.dispatch(setCallState('connecting'));
            resolve();
          } else {
            reject(
              new Error(response.message ?? ERROR_STRINGS.ANSWER_CREATION_FAILED),
            );
          }
        },
      );
    });
    // Steps 9-10 happen via ICE exchange listeners
  }

  // ----------------------------------------------------------
  // End / Reject
  // ----------------------------------------------------------

  async rejectCall(callerId: string): Promise<void> {
    if (!socketService.isConnected) {
      console.warn('[CallService] Socket not connected — rejecting call locally');
      InCallManager.stop({ busytone: '_BUNDLE_' });
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.warn('[CallService] rejectCall acknowledgement timed out');
        InCallManager.stop({ busytone: '_BUNDLE_' });
        resolve();
      }, 5000);

      socketService.rejectCall(
        { receiverId: callerId },
        (response) => {
          clearTimeout(timeout);
          if (response.success) {
            InCallManager.stop({ busytone: '_BUNDLE_' });
            resolve();
          } else {
            reject(new Error(response.message));
          }
        },
      );
    });
  }

  async endCall(remoteUserId: string): Promise<void> {
    // If socket is disconnected, resolve immediately — still cleanup locally
    if (!socketService.isConnected) {
      console.warn('[CallService] Socket not connected — ending call locally');
      return;
    }

    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        console.warn('[CallService] endCall acknowledgement timed out');
        resolve();
      }, 5000);

      socketService.endCall(
        { receiverId: remoteUserId },
        (response) => {
          clearTimeout(timeout);
          // Always resolve — we want to cleanup locally even if server fails
          resolve();
        },
      );
    });
  }

  cleanup(): void {
    webRTCService.cleanup();
    this.currentRemoteUserId = null;
    this.pendingOffer = null;
  }

  // ----------------------------------------------------------
  // Pending Offer Storage (for callee flow)
  // ----------------------------------------------------------

  private pendingOffer: { type: 'offer'; sdp: string } | null = null;

  storePendingOffer(offer: { type: 'offer'; sdp: string }): void {
    this.pendingOffer = offer;
  }

  // ----------------------------------------------------------
  // WebRTC Callbacks
  // ----------------------------------------------------------

  private onRemoteStream = (): void => {
    store.dispatch(setHasRemoteStream(true));
  };

  private onConnectionStateChange = (state: RTCConnectionState): void => {
    switch (state) {
      case 'connected':
        store.dispatch(setCallState('connected'));
        InCallManager.stopRingback();
        break;
      case 'disconnected':
        store.dispatch(setCallState('reconnecting'));
        break;
      case 'failed':
        store.dispatch(
          setError({
            code: 'CALL_FAILED',
            message: ERROR_STRINGS.PEER_CONNECTION_FAILED,
          }),
        );
        store.dispatch(setCallState('failed'));
        this.cleanup();
        InCallManager.stop();
        break;
      case 'closed':
        // Handled by endCall flow
        break;
      default:
        break;
    }
  };

  private onLocalIceCandidate = (candidate: RTCIceCandidateData): void => {
    if (this.currentRemoteUserId) {
      socketService.sendIceCandidate({
        receiverId: this.currentRemoteUserId,
        candidate,
      });
    }
  };

  // ----------------------------------------------------------
  // Socket Event Handlers
  // ----------------------------------------------------------

  private handleIncomingCall = (data: IncomingCallEvent): void => {
    console.log('[CallService] Incoming call from:', data.callerId, data.callerName);
    const currentCallState = store.getState().videoCall.callState;

    // Only reject if actively in a call or waiting for answer
    const callsBlockingIncoming = ['incoming', 'outgoing', 'connecting', 'connected'];
    if (callsBlockingIncoming.includes(currentCallState)) {
      socketService.rejectCall({ receiverId: data.callerId });
      return;
    }

    // Store the offer for later use when callee accepts
    this.storePendingOffer(data.offer);

    store.dispatch(
      setIncomingCall({
        caller: {
          userId: data.callerId,
          userName: data.callerName,
        },
        callRecordId: data.callRecordId,
      }),
    );

    // Start ringtone
    InCallManager.start({ media: 'video', ringback: '' });
    // InCallManager.startRingtone('_BUNDLE_');
  };

  private handleCallAnswered = async (data: CallAnsweredEvent): Promise<void> => {
    try {
      store.dispatch(setCallState('connecting'));
      InCallManager.stopRingback();

      // 9. setRemoteDescription(answer)
      await webRTCService.setRemoteDescription(data.answer);

      // InCallManager for video call
      InCallManager.start({ media: 'video' });
      InCallManager.setForceSpeakerphoneOn(true);

      // 10 & 11 happen via ontrack and ICE exchange
    } catch (error) {
      console.error('[CallService] Error handling call answer:', error);
      store.dispatch(
        setError({
          code: 'CALL_FAILED',
          message: ERROR_STRINGS.PEER_CONNECTION_FAILED,
        }),
      );
      store.dispatch(setCallState('failed'));
    }
  };

  private handleIceCandidate = async (data: IceCandidateEvent): Promise<void> => {
    await webRTCService.addIceCandidate(data.candidate);
  };

  private handleCallRejected = (data: CallRejectedEvent): void => {
    store.dispatch(setCallState('rejected'));
    InCallManager.stop({ busytone: '_BUNDLE_' });
    this.cleanup();
  };

  private handleCallEnded = (data: CallEndedEvent): void => {
    store.dispatch(setCallState('ended'));
    InCallManager.stop();
    this.cleanup();
  };

  private handleSocketError = (data: SocketErrorEvent): void => {
    store.dispatch(
      setError({
        code: data.code,
        message: data.message,
        details: data.details,
      }),
    );

    // If call-related error during active call, transition to failed
    const callState = store.getState().videoCall.callState;
    if (
      callState !== 'idle' &&
      callState !== 'ended' &&
      (data.code === 'USER_OFFLINE' ||
        data.code === 'USER_NOT_FOUND' ||
        data.code === 'CALL_FAILED')
    ) {
      store.dispatch(setCallState('failed'));
      InCallManager.stop();
      this.cleanup();
    }
  };

  private handleDisconnect = (_reason: string): void => {
    const callState = store.getState().videoCall.callState;
    if (
      callState === 'connected' ||
      callState === 'connecting'
    ) {
      store.dispatch(setCallState('reconnecting'));
    }
  };

  private handleReconnect = (): void => {
    
    // If the user was in a call when the socket disconnected, we attempt to restore the call state.
    store.dispatch(setCallState('reconnecting'));
    return
    const callState = store.getState().videoCall.callState;
    if (callState === 'reconnecting') {
      // Re-register user and attempt to restore call state
      // The peer connection may still be active via ICE
      const hasRemoteStream = store.getState().videoCall.hasRemoteStream;
      if (hasRemoteStream) {
        store.dispatch(setCallState('connected'));
      }
    }
  };

  private handleLatestCounterValue = (data: { value: number }): void => {
    console.log('[CallService] Latest counter value received:', data.value);
    // Handle the latest counter value as needed

    store.dispatch(setCounterValue(data.value));
  };
}

export const callService = new CallService();
