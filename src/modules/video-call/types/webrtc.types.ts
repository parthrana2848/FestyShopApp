import type { MediaStream } from 'react-native-webrtc';

export type RTCConnectionState =
  | 'new'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed'
  | 'closed';

export type RTCIceGatheringState =
  | 'new'
  | 'gathering'
  | 'complete';

export type RTCSignalingState =
  | 'stable'
  | 'have-local-offer'
  | 'have-remote-offer'
  | 'have-local-pranswer'
  | 'have-remote-pranswer'
  | 'closed';

export interface RTCIceCandidateData {
  candidate?: string;
  sdpMid?: string;
  sdpMLineIndex?: number;
}

export interface RTCSessionDescriptionData {
  type: 'offer' | 'answer';
  sdp: string;
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  iceCandidatePoolSize?: number;
}

export interface RTCIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface WebRTCServiceState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: RTCConnectionState;
  iceGatheringState: RTCIceGatheringState;
  signalingState: RTCSignalingState;
}

export interface WebRTCCallbacks {
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionStateChange: (state: RTCConnectionState) => void;
  onIceCandidate: (candidate: RTCIceCandidateData) => void;
  onIceGatheringStateChange?: (state: RTCIceGatheringState) => void;
  onSignalingStateChange?: (state: RTCSignalingState) => void;
  onNegotiationNeeded?: () => void;
}
