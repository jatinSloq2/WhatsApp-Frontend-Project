// src/hooks/useSocket.ts

import { useEffect, useRef, useCallback } from 'react';
import { socketClient } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';

export const useSocket = () => {
  const { accessToken } = useAuthStore();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (accessToken && !isInitialized.current) {
      socketClient.connect(accessToken);
      isInitialized.current = true;
    }

    return () => {
      if (isInitialized.current) {
        socketClient.disconnect();
        isInitialized.current = false;
      }
    };
  }, [accessToken]);

  const subscribeToSession = useCallback((sessionId: string) => {
    socketClient.subscribeToSession(sessionId);
  }, []);

  const unsubscribeFromSession = useCallback((sessionId: string) => {
    socketClient.unsubscribeFromSession(sessionId);
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    socketClient.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    socketClient.off(event, callback);
  }, []);

  const emit = useCallback((event: string, data: any) => {
    socketClient.emit(event, data);
  }, []);

  return {
    subscribeToSession,
    unsubscribeFromSession,
    on,
    off,
    emit,
    connected: socketClient.connected,
  };
};
