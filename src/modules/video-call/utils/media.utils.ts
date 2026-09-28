import { mediaDevices, MediaStream } from 'react-native-webrtc';
import { MEDIA_CONSTRAINTS, MEDIA_CONSTRAINTS_AUDIO_ONLY } from '../constants/rtcConfig';

export async function getUserMedia(videoEnabled = true): Promise<MediaStream> {
  const constraints = videoEnabled
    ? MEDIA_CONSTRAINTS
    : MEDIA_CONSTRAINTS_AUDIO_ONLY;

  const stream = await mediaDevices.getUserMedia(constraints);
  return stream as MediaStream;
}

export function stopStream(stream: MediaStream | null): void {
  if (!stream) {
    return;
  }

  stream.getTracks().forEach((track: any) => {
    track.stop();
  });
}

export function getAudioTracks(stream: MediaStream | null): any[] {
  if (!stream) {
    return [];
  }
  return stream.getAudioTracks();
}

export function getVideoTracks(stream: MediaStream | null): any[] {
  if (!stream) {
    return [];
  }
  return stream.getVideoTracks();
}

export function setTrackEnabled(
  stream: MediaStream | null,
  kind: 'audio' | 'video',
  enabled: boolean,
): void {
  if (!stream) {
    return;
  }

  const tracks =
    kind === 'audio' ? stream.getAudioTracks() : stream.getVideoTracks();

  tracks.forEach((track: any) => {
    track.enabled = enabled;
  });
}
