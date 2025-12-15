// src/hooks/useSessions.ts

import { useEffect } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useSocket } from './useSocket';
import { Session } from '@/types/session.types';
import toast from 'react-hot-toast';

export const useSessions = () => {
  const {
    sessions,
    currentSession,
    isLoading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    logoutSession,
    setCurrentSession,
    updateSessionInList,
    clearError,
  } = useSessionStore();

  const { on, off } = useSocket();

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    // Listen for session status updates
    const handleSessionStatus = (data: any) => {
      updateSessionInList(data.sessionId, {
        status: data.status,
        connectedAt: data.connectedAt,
        lastSeen: data.lastSeen,
      });

      if (data.status === 'connected') {
        toast.success(`Session ${data.sessionId} connected!`);
      } else if (data.status === 'disconnected') {
        toast.error(`Session ${data.sessionId} disconnected`);
      }
    };

    on('session_status', handleSessionStatus);

    return () => {
      off('session_status', handleSessionStatus);
    };
  }, [on, off, updateSessionInList]);

  return {
    sessions,
    currentSession,
    isLoading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    logoutSession,
    setCurrentSession,
    clearError,
  };
};
