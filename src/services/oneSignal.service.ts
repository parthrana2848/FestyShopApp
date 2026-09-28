import { OneSignal } from 'react-native-onesignal';
import { store } from '../store';
import { setIncomingCall } from '../modules/video-call/store/videoCallSlice';

const VIDEO_CALL_NOTIFICATION_TYPE = 'video_call';

function isVideoCallPayload(
  data: Record<string, unknown>,
): data is Record<string, string> {
  return (
    data.type === VIDEO_CALL_NOTIFICATION_TYPE &&
    typeof data.callerId === 'string' &&
    typeof data.callerName === 'string' &&
    typeof data.callRecordId === 'string'
  );
}

/**
 * Navigation ref — must be set from the app's NavigationContainer.
 * This allows OneSignal handlers to navigate even when the hook isn't mounted.
 */
let navigationRef: any = null;

export function setNavigationRef(ref: any): void {
  navigationRef = ref;
}

function navigateToIncomingCall(): void {
  if (navigationRef?.isReady?.()) {
    navigationRef.navigate('Calls', { screen: 'IncomingCall' });
  }
}

/**
 * Initialize OneSignal notification handlers for video call deep linking.
 * Call this once at app startup (e.g., in App.tsx).
 */
export function setupOneSignalVideoCallHandlers(): void {
  // Foreground notification handler
  OneSignal.Notifications.addEventListener(
    'foregroundWillDisplay',
    (event: any) => {
      const data = event.getNotification().additionalData as
        | Record<string, unknown>
        | undefined;

      if (data && isVideoCallPayload(data)) {
        // Prevent the default notification display — handle in-app
        event.preventDefault();

        const currentCallState = store.getState().videoCall.callState;
        if (currentCallState === 'idle') {
          store.dispatch(
            setIncomingCall({
              caller: {
                userId: data.callerId,
                userName: data.callerName,
              },
              callRecordId: data.callRecordId,
            }),
          );
          navigateToIncomingCall();
        }
      }
      // Let non-video-call notifications display normally
    },
  );

  // Notification click handler (background + killed state)
  OneSignal.Notifications.addEventListener('click', (event: any) => {
    const data = event.notification.additionalData as
      | Record<string, unknown>
      | undefined;

    if (data && isVideoCallPayload(data)) {
      const currentCallState = store.getState().videoCall.callState;
      if (currentCallState === 'idle') {
        store.dispatch(
          setIncomingCall({
            caller: {
              userId: data.callerId,
              userName: data.callerName,
            },
            callRecordId: data.callRecordId,
          }),
        );

        // Navigation may not be ready immediately — delay briefly
        setTimeout(() => {
          navigateToIncomingCall();
        }, 500);
      }
    }
  });
}
