import 'react-native-webrtc';
import type RTCIceCandidateEvent from 'react-native-webrtc/lib/typescript/RTCIceCandidateEvent';
import type RTCTrackEvent from 'react-native-webrtc/lib/typescript/RTCTrackEvent';

declare module 'react-native-webrtc' {
  interface RTCPeerConnection {
    addEventListener<K extends keyof RTCPeerConnectionEventMap>(
      type: K,
      listener: (event: RTCPeerConnectionEventMap[K]) => void,
      options?: boolean | AddEventListenerOptions
    ): void;
    
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): void;
    
    removeEventListener<K extends keyof RTCPeerConnectionEventMap>(
      type: K,
      listener: (event: RTCPeerConnectionEventMap[K]) => void,
      options?: boolean | EventListenerOptions
    ): void;
    
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions
    ): void;
  }

  interface RTCPeerConnectionEventMap {
    icecandidate: RTCIceCandidateEvent<'icecandidate'>;
    track: RTCTrackEvent<'track'>;
    connectionstatechange: Event;
    iceconnectionstatechange: Event;
    icegatheringstatechange: Event;
    signalingstatechange: Event;
    negotiationneeded: Event;
    datachannel: Event;
    icecandidateerror: Event;
  }
}
