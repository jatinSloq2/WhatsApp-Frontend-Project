// src/hooks/useSessions.ts

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  clearError,
  createSession as createSessionAction,
  deleteSession as deleteSessionAction,
  fetchSessions,
  logoutSession as logoutSessionAction,
  setCurrentSession,
  updateSession as updateSessionAction,
  updateSessionInList,
} from '@/store/slices/sessionSlice';
import { CreateSessionData } from '@/types/session.types';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSocket } from './useSocket';

export const useSessions = () => {
  const dispatch = useAppDispatch();
  const { sessions, currentSession, isLoading, error } = useAppSelector((state) => state.session);
  const { on, off } = useSocket();

  useEffect(() => {
    dispatch(fetchSessions());
  }, [dispatch]);

  useEffect(() => {
    // Listen for session status updates
    const handleSessionStatus = (data: any) => {
      dispatch(updateSessionInList({
        sessionId: data.sessionId,
        updates: {
          status: data.status,
          connectedAt: data.connectedAt,
          lastSeen: data.lastSeen,
        },
      }));

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
  }, [on, off, dispatch]);

  return {
    sessions,
    currentSession,
    isLoading,
    error,
    fetchSessions: () => dispatch(fetchSessions()),
    createSession: (data: CreateSessionData) => dispatch(createSessionAction(data)),
    updateSession: (sessionId: string, data: any) => dispatch(updateSessionAction({ sessionId, data })),
    deleteSession: (sessionId: string) => dispatch(deleteSessionAction(sessionId)),
    logoutSession: (sessionId: string) => dispatch(logoutSessionAction(sessionId)),
    setCurrentSession: (session: any) => dispatch(setCurrentSession(session)),
    clearError: () => dispatch(clearError()),
  };
};