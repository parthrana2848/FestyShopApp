import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import type { AppDispatch } from '../../../store';
import { useAuth } from '../../../context/AuthContext';
import { webRTCService } from '../services/webrtc.service';
import { callService } from '../services/call.service';
import { socketService } from '../services/socket.service';
import { callRecoveryService } from '../services/callRecovery.service';
import {
  selectCallState,
  selectCaller,
  selectReceiver,
  selectCallRecordId,
  selectHasLocalStream,
  selectHasRemoteStream,
  selectIsMuted,
  selectIsCameraEnabled,
  selectIsSpeakerOn,
  selectConnectionStatus,
  selectError,
  selectCallStartTime,
  selectIsInCall,
  selectRemoteParticipant,
  selectCounterValue,
} from '../store/videoCallSelectors';
import {
  setCallState,
  resetCallState,
} from '../store/videoCallSlice';
import {
  initiateCallThunk,
  acceptCallThunk,
  rejectCallThunk,
  endCallThunk,
  toggleMuteThunk,
  toggleCameraThunk,
  toggleSpeakerThunk,
  switchCameraThunk,
  cleanupCallThunk,
} from '../store/videoCallThunks';
import { ensureCallPermissions } from '../utils/permissions.utils';
import { CALL_TIMEOUTS } from '../constants/videoCallTimeouts';
import { VIDEO_CALL_ROUTES } from '../constants/videoCallRoutes';
import type { MediaStream } from 'react-native-webrtc';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function useVideoCall() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();
  const { currentUserQuery, token } = useAuth();
  const currentUser = currentUserQuery.data;
  const outgoingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Selectors
  const callState = useSelector(selectCallState);
  const caller = useSelector(selectCaller);
  const receiver = useSelector(selectReceiver);
  const callRecordId = useSelector(selectCallRecordId);
  const hasLocalStream = useSelector(selectHasLocalStream);
  const hasRemoteStream = useSelector(selectHasRemoteStream);
  const isMuted = useSelector(selectIsMuted);
  const isCameraEnabled = useSelector(selectIsCameraEnabled);
  const isSpeakerOn = useSelector(selectIsSpeakerOn);
  const connectionStatus = useSelector(selectConnectionStatus);
  const error = useSelector(selectError);
  const callStartTime = useSelector(selectCallStartTime);
  const isInCall = useSelector(selectIsInCall);
  const remoteParticipant = useSelector(selectRemoteParticipant);
  const counterValue = useSelector(selectCounterValue);

  // Streams (from service, not Redux)
  const getLocalStream = useCallback((): MediaStream | null => {
    return webRTCService.localStream;
  }, []);

  const getRemoteStream = useCallback((): MediaStream | null => {
    return webRTCService.remoteStream;
  }, []);

  // ----------------------------------------------------------
  // Setup / Teardown — connect socket so user is reachable
  // ----------------------------------------------------------

  useEffect(() => {
    const userId = currentUser?.id;
    if (!userId || !token) {
      return;
    }

    let cancelled = false;

    const connectAndRegister = async () => {
      try {
        if (!socketService.isConnected) {
          await socketService.connect(token);
        }
        if (!cancelled) {
          // socketService.registerUser({ userId });
          socketService.registerUser({
            userId,
            userName: currentUser?.name || `User ${userId.substring(0, 8)}`
          });
          callService.setupSocketListeners();
          callRecoveryService.start();
        }
      } catch (err) {
        console.warn('[useVideoCall] Socket auto-connect failed:', err);
      }
    };

    connectAndRegister();

    return () => {
      cancelled = true;
      callRecoveryService.stop();
      // Do NOT call socketService.clearListeners() here — the socket service is a
      // singleton shared with usePresence. Clearing all listeners wipes presence
      // and call listeners alike, including the critical onCallAnswered handler
      // the caller needs when the receiver answers. Listeners are cleaned up
      // when the socket actually disconnects.
    };
  }, [currentUser?.id, token]);

  // Navigate based on call state
  useEffect(() => {
    switch (callState) {
      case 'incoming':
        navigation.navigate(VIDEO_CALL_ROUTES.INCOMING_CALL as any);
        break;
      case 'outgoing':
        navigation.navigate(VIDEO_CALL_ROUTES.OUTGOING_CALL as any);
        break;
      case 'connecting':
      case 'connected':
        navigation.navigate(VIDEO_CALL_ROUTES.VIDEO_CALL as any);
        break;
      case 'ended':
      case 'rejected':
      case 'failed':
        clearOutgoingTimeout();
        setTimeout(() => {
          dispatch(resetCallState());
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        }, CALL_TIMEOUTS.END_CALL_NAVIGATION_DELAY);
        break;
      default:
        break;
    }
  }, [callState, navigation, dispatch]);

  // ----------------------------------------------------------
  // Outgoing Call Timeout (30s)
  // ----------------------------------------------------------

  useEffect(() => {
    if (callState === 'outgoing') {
      outgoingTimeoutRef.current = setTimeout(() => {
        dispatch(endCallThunk());
      }, CALL_TIMEOUTS.OUTGOING_CALL_TIMEOUT);
    } else {
      clearOutgoingTimeout();
    }

    return () => {
      clearOutgoingTimeout();
    };
  }, [callState, dispatch]);

  const clearOutgoingTimeout = useCallback(() => {
    if (outgoingTimeoutRef.current) {
      clearTimeout(outgoingTimeoutRef.current);
      outgoingTimeoutRef.current = null;
    }
  }, []);

  // ----------------------------------------------------------
  // Actions
  // ----------------------------------------------------------

  const initiateCall = useCallback(
    async (receiverId: string, receiverName?: string) => {
      const hasPermissions = await ensureCallPermissions();
      if (!hasPermissions) {
        return;
      }

      const callerId = currentUser?.id ?? '';
      if (!callerId) {
        console.warn('[useVideoCall] No user ID available');
        return;
      }

      // Ensure socket is connected and user is registered
      if (!socketService.isConnected) {
        await socketService.connect(token ?? undefined);
        socketService.registerUser({ userId: callerId });
        callService.setupSocketListeners();
      }

      dispatch(
        initiateCallThunk({
          callerId,
          callerName: currentUser?.name,
          receiverId,
          receiverName,
        }),
      );
    },
    [dispatch, currentUser],
  );

  const acceptCall = useCallback(() => {
    dispatch(acceptCallThunk());
  }, [dispatch]);

  const rejectCall = useCallback(() => {
    dispatch(rejectCallThunk());
  }, [dispatch]);

  const endCall = useCallback(() => {
    dispatch(endCallThunk());
  }, [dispatch]);

  const toggleMute = useCallback(() => {
    dispatch(toggleMuteThunk());
  }, [dispatch]);

  const toggleCamera = useCallback(() => {
    dispatch(toggleCameraThunk());
  }, [dispatch]);

  const toggleSpeaker = useCallback(() => {
    dispatch(toggleSpeakerThunk());
  }, [dispatch]);

  const switchCamera = useCallback(() => {
    dispatch(switchCameraThunk());
  }, [dispatch]);

  const cleanup = useCallback(() => {
    clearOutgoingTimeout();
    dispatch(cleanupCallThunk());
  }, [dispatch, clearOutgoingTimeout]);

  return {
    // State
    callState,
    caller,
    receiver,
    callRecordId,
    hasLocalStream,
    hasRemoteStream,
    isMuted,
    isCameraEnabled,
    isSpeakerOn,
    connectionStatus,
    error,
    callStartTime,
    isInCall,
    remoteParticipant,
    counterValue,
    // Streams
    getLocalStream,
    getRemoteStream,

    // Actions
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleSpeaker,
    switchCamera,
    cleanup,
  };
}
