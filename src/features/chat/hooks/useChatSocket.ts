import { useEffect, useState } from 'react';
import { socketService } from '../../../modules/video-call/services/socket.service';

export function useChatSocket(conversationId?: string) {
  const [isConnected, setIsConnected] = useState(socketService.isConnected);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initSocket = async () => {
      try {
        await socketService.connect();
        if (isMounted) {
          setIsConnected(true);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('[useChatSocket] Connection error:', err?.message || err);
          setError(err?.message || 'Socket connection failed');
          setIsConnected(false);
        }
      }
    };

    initSocket();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle joining and leaving conversation room
  useEffect(() => {
    if (!conversationId || !isConnected) {
      return;
    }

    console.log('[useChatSocket] Joining conversation room:', conversationId);
    socketService.joinConversation(conversationId, (ack) => {
      if (ack?.error) {
        console.error('[useChatSocket] Failed to join conversation:', ack.error);
        setError(ack.error);
      }
    });

    const unsubReconnect = socketService.onReconnect(() => {
      console.log('[useChatSocket] Re-joining conversation room on reconnect:', conversationId);
      socketService.joinConversation(conversationId);
    });

    return () => {
      unsubReconnect();
      console.log('[useChatSocket] Leaving conversation room on unmount:', conversationId);
      socketService.leaveConversation(conversationId);
    };
  }, [conversationId, isConnected]);

  return {
    isConnected,
    error,
    socketId: socketService.socketId,
  };
}
