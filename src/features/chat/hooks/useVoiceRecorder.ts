import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import Sound from 'react-native-nitro-sound';

export type RecorderState =
  | 'idle'
  | 'recording'
  | 'processing'
  | 'recorded'
  | 'error';

export interface RecordedAudio {
  uri: string;
  size: number;
  duration: number;
  mimeType: string;
}

const MIME_TYPE = 'audio/m4a';

export const useVoiceRecorder = () => {
  const [state, setState] =
    useState<RecorderState>('idle');

  const [duration, setDuration] =
    useState<number>(0);

  const [error, setError] =
    useState<string | null>(null);

  const recordingRef =
    useRef<boolean>(false);

  const mountedRef =
    useRef<boolean>(true);

  const startRecording = useCallback(
    async (): Promise<boolean> => {
      try {
        if (recordingRef.current) {
          return false;
        }

        setError(null);
        setDuration(0);
        setState('recording');

        recordingRef.current = true;

        Sound.addRecordBackListener(event => {
          if (!mountedRef.current) {
            return;
          }

          const currentDuration = Math.floor(
            (event.currentPosition ?? 0) / 1000,
          );

          setDuration(
            Math.max(0, currentDuration),
          );
        });

        await Sound.startRecorder();

        return true;
      } catch (error: unknown) {
        recordingRef.current = false;

        Sound.removeRecordBackListener();

        const message =
          error instanceof Error
            ? error.message
            : 'Failed to start recording';

        setError(message);
        setState('error');

        return false;
      }
    },
    [],
  );

  const stopRecording = useCallback(
    async (): Promise<RecordedAudio | null> => {
      if (!recordingRef.current) {
        return null;
      }

      try {
        setState('processing');

        recordingRef.current = false;

        const uri =
          await Sound.stopRecorder();

        Sound.removeRecordBackListener();

        if (!uri) {
          throw new Error(
            'Recording URI is empty',
          );
        }

        const normalizedUri =
          uri.startsWith('file://')
            ? uri
            : `file://${uri}`;

        const result: RecordedAudio = {
          uri: normalizedUri,
          size: 1,
          duration,
          mimeType: MIME_TYPE,
        };

        setState('recorded');

        return result;
      } catch (error: unknown) {
        recordingRef.current = false;

        Sound.removeRecordBackListener();

        const message =
          error instanceof Error
            ? error.message
            : 'Failed to stop recording';

        setError(message);
        setState('error');

        return null;
      }
    },
    [duration],
  );

  const cancelRecording =
    useCallback(async (): Promise<void> => {
      if (recordingRef.current) {
        recordingRef.current = false;

        try {
          await Sound.stopRecorder();
        } catch {
          // Recorder may already be stopped.
        }
      }

      Sound.removeRecordBackListener();

      setDuration(0);
      setError(null);
      setState('idle');
    }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      Sound.removeRecordBackListener();

      if (recordingRef.current) {
        recordingRef.current = false;

        Sound.stopRecorder().catch(() => {
          // Ignore cleanup errors.
        });
      }
    };
  }, []);

  return {
    state,
    duration,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  };
};