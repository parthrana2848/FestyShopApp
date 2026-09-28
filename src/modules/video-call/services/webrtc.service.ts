import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
import RTCIceCandidateEvent from 'react-native-webrtc/lib/typescript/RTCIceCandidateEvent';
import RTCTrackEvent from 'react-native-webrtc/lib/typescript/RTCTrackEvent';
import { RTC_CONFIG, MEDIA_CONSTRAINTS } from '../constants/rtcConfig';
import type {
  RTCIceCandidateData,
  RTCSessionDescriptionData,
  RTCConnectionState,
  RTCIceGatheringState,
  RTCSignalingState,
  WebRTCCallbacks,
} from '../types/webrtc.types';

class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private _localStream: MediaStream | null = null;
  private _remoteStream: MediaStream | null = null;
  private iceCandidateQueue: RTCIceCandidateData[] = [];
  private hasRemoteDescription = false;
  private callbacks: WebRTCCallbacks | null = null;

  get localStream(): MediaStream | null {
    return this._localStream;
  }

  get remoteStream(): MediaStream | null {
    return this._remoteStream;
  }

  get connectionState(): RTCConnectionState {
    return (
      (this.peerConnection?.connectionState as RTCConnectionState) ?? 'closed'
    );
  }

  // ----------------------------------------------------------
  // Initialization
  // ----------------------------------------------------------

  createPeerConnection(callbacks: WebRTCCallbacks): RTCPeerConnection {
    this.callbacks = callbacks;

    const config = {
      iceServers: RTC_CONFIG.iceServers,
      iceCandidatePoolSize: RTC_CONFIG.iceCandidatePoolSize,
    };

    this.peerConnection = new RTCPeerConnection(config);
    this._remoteStream = new MediaStream(undefined);

    // ICE candidate handler
    this.peerConnection.addEventListener('icecandidate', (event: RTCIceCandidateEvent<'icecandidate'>) => {
      if (event.candidate) {
        console.log('[WebRTCService] ICE candidate generated:', event.candidate.candidate?.substring(0, 50));
        const candidateData: RTCIceCandidateData = {
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid ?? undefined,
          sdpMLineIndex: event.candidate.sdpMLineIndex ?? undefined,
        };
        this.callbacks?.onIceCandidate(candidateData);
      } else {
        console.log('[WebRTCService] ICE gathering complete');
      }
    });

    // Track handler — remote stream
    this.peerConnection.addEventListener('track', (event: RTCTrackEvent<'track'>) => {
      console.log('[WebRTCService] ontrack fired, kind:', event.track?.kind, 'readyState:', event.track?.readyState);
      if (event.streams && event.streams[0]) {
        this._remoteStream = event.streams[0];
        console.log('[WebRTCService] Remote stream set from event.streams[0], tracks:', this._remoteStream.getTracks().length);
      } else if (event.track) {
        if (!this._remoteStream) {
          this._remoteStream = new MediaStream(undefined);
        }
        this._remoteStream.addTrack(event.track);
        console.log('[WebRTCService] Track added to remote stream, tracks:', this._remoteStream.getTracks().length);
      }
      if (this._remoteStream) {
        this.callbacks?.onRemoteStream(this._remoteStream);
      }
    });

    // Connection state change
    this.peerConnection.addEventListener('connectionstatechange', () => {
      const state = this.peerConnection
        ?.connectionState as RTCConnectionState;
      console.log('[WebRTCService] connectionState:', state);
      if (state) {
        this.callbacks?.onConnectionStateChange(state);
      }
    });

    // ICE connection state — more reliable in react-native-webrtc
    this.peerConnection.addEventListener('iceconnectionstatechange', () => {
      const iceState = this.peerConnection?.iceConnectionState;
      console.log('[WebRTCService] iceConnectionState:', iceState);
      if (iceState === 'connected' || iceState === 'completed') {
        this.callbacks?.onConnectionStateChange('connected');
      } else if (iceState === 'disconnected') {
        this.callbacks?.onConnectionStateChange('disconnected');
      } else if (iceState === 'failed') {
        this.callbacks?.onConnectionStateChange('failed');
      }
    });

    // ICE gathering state change
    this.peerConnection.addEventListener('icegatheringstatechange', () => {
      const state = this.peerConnection
        ?.iceGatheringState as RTCIceGatheringState;
      if (state) {
        this.callbacks?.onIceGatheringStateChange?.(state);
      }
    });

    // Signaling state change
    this.peerConnection.addEventListener('signalingstatechange', () => {
      const state = this.peerConnection
        ?.signalingState as RTCSignalingState;
      if (state) {
        this.callbacks?.onSignalingStateChange?.(state);
      }
    });

    // Negotiation needed
    this.peerConnection.addEventListener('negotiationneeded', () => {
      this.callbacks?.onNegotiationNeeded?.();
    });

    return this.peerConnection;
  }

  // ----------------------------------------------------------
  // Media Stream
  // ----------------------------------------------------------

  async getLocalStream(): Promise<MediaStream> {
    if (this._localStream) {
      return this._localStream;
    }

    const stream = await mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
    this._localStream = stream as MediaStream;
    return this._localStream;
  }

  addLocalTracks(): void {
    if (!this.peerConnection || !this._localStream) {
      throw new Error('PeerConnection or local stream not available');
    }

    this._localStream.getTracks().forEach((track: any) => {
      this.peerConnection!.addTrack(track, this._localStream!);
    });
  }

  // ----------------------------------------------------------
  // SDP Negotiation
  // ----------------------------------------------------------

  async createOffer(): Promise<RTCSessionDescriptionData> {
    if (!this.peerConnection) {
      throw new Error('PeerConnection not created');
    }

    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    await this.peerConnection.setLocalDescription(offer);

    return {
      type: 'offer',
      sdp: offer.sdp!,
    };
  }

  async createAnswer(): Promise<RTCSessionDescriptionData> {
    if (!this.peerConnection) {
      throw new Error('PeerConnection not created');
    }

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    return {
      type: 'answer',
      sdp: answer.sdp!,
    };
  }

  async setRemoteDescription(
    description: RTCSessionDescriptionData,
  ): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('PeerConnection not created');
    }

    const rtcDesc = new RTCSessionDescription(description);
    await this.peerConnection.setRemoteDescription(rtcDesc);
    this.hasRemoteDescription = true;

    // Flush queued ICE candidates
    await this.flushIceCandidateQueue();
  }

  // ----------------------------------------------------------
  // ICE Candidates
  // ----------------------------------------------------------

  async addIceCandidate(candidateData: RTCIceCandidateData): Promise<void> {
    if (!this.hasRemoteDescription) {
      // Queue the candidate — remote description not yet set
      this.iceCandidateQueue.push(candidateData);
      return;
    }

    if (!this.peerConnection) {
      return;
    }

    try {
      const candidate = new RTCIceCandidate(candidateData);
      await this.peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.warn('[WebRTCService] Failed to add ICE candidate:', error);
    }
  }

  private async flushIceCandidateQueue(): Promise<void> {
    if (!this.peerConnection) {
      return;
    }

    const queue = [...this.iceCandidateQueue];
    this.iceCandidateQueue = [];

    for (const candidateData of queue) {
      try {
        const candidate = new RTCIceCandidate(candidateData);
        await this.peerConnection.addIceCandidate(candidate);
      } catch (error) {
        console.warn(
          '[WebRTCService] Failed to add queued ICE candidate:',
          error,
        );
      }
    }
  }

  // ----------------------------------------------------------
  // Media Controls
  // ----------------------------------------------------------

  setAudioEnabled(enabled: boolean): void {
    if (!this._localStream) {
      return;
    }

    this._localStream.getAudioTracks().forEach((track: any) => {
      track.enabled = enabled;
    });
  }

  setVideoEnabled(enabled: boolean): void {
    if (!this._localStream) {
      return;
    }

    this._localStream.getVideoTracks().forEach((track: any) => {
      track.enabled = enabled;
    });
  }

  async switchCamera(): Promise<void> {
    if (!this._localStream) {
      return;
    }

    const videoTracks = this._localStream.getVideoTracks();
    if (videoTracks.length > 0) {
      const track = videoTracks[0] as any;
      if (typeof track._switchCamera === 'function') {
        track._switchCamera();
      }
    }
  }

  // ----------------------------------------------------------
  // Cleanup
  // ----------------------------------------------------------

  cleanup(): void {
    // Stop local stream tracks
    if (this._localStream) {
      this._localStream.getTracks().forEach((track: any) => {
        track.stop();
      });
      this._localStream = null;
    }

    // Stop remote stream tracks
    if (this._remoteStream) {
      this._remoteStream.getTracks().forEach((track: any) => {
        track.stop();
      });
      this._remoteStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Reset state
    this.iceCandidateQueue = [];
    this.hasRemoteDescription = false;
    this.callbacks = null;
  }
}

export const webRTCService = new WebRTCService();
