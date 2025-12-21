// src/store/sessionStore.ts

import { create } from 'zustand';
import { Session, CreateSessionData } from '@/types/session.types';
import { sessionService } from '@/lib/api/session.service';

interface SessionStore {
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  error: string | null;
  
  fetchSessions: () => Promise<void>;
  createSession: (data: CreateSessionData) => Promise<Session>;
  getSession: (sessionId: string) => Promise<void>;
  getSessionStatus: (sessionId: string) => Promise<{
    sessionId: string;
    status: string;
    connectedAt?: string;
    lastSeen?: string;
  } | null>;
  updateSession: (sessionId: string, data: Partial<Session>) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  logoutSession: (sessionId: string) => Promise<void>;
  setCurrentSession: (session: Session | null) => void;
  updateSessionInList: (sessionId: string, updates: Partial<Session>) => void;
  clearError: () => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,

  fetchSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await sessionService.getSessions();
      set({
        sessions: response.data.sessions,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch sessions',
        isLoading: false,
      });
    }
  },

  createSession: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await sessionService.createSession(data);
      const newSession = response.data;
      
      set((state) => ({
        sessions: [...state.sessions, newSession],
        currentSession: newSession,
        isLoading: false,
      }));
      
      return newSession;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create session',
        isLoading: false,
      });
      throw error;
    }
  },

  getSession: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await sessionService.getSession(sessionId);
      set({
        currentSession: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to get session',
        isLoading: false,
      });
    }
  },

  // New method: Get session status (lightweight, for polling)
  getSessionStatus: async (sessionId) => {
    try {
      const response = await sessionService.getSessionStatus(sessionId);
      const statusData = response.data;
      
      // Update the session in store with new status
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.sessionId === sessionId 
            ? { 
                ...s, 
                status: statusData.status as any,
                connectedAt: statusData.connectedAt || s.connectedAt,
                lastSeen: statusData.lastSeen || s.lastSeen,
              } 
            : s
        ),
        currentSession:
          state.currentSession?.sessionId === sessionId
            ? { 
                ...state.currentSession, 
                status: statusData.status as any,
                connectedAt: statusData.connectedAt || state.currentSession.connectedAt,
                lastSeen: statusData.lastSeen || state.currentSession.lastSeen,
              }
            : state.currentSession,
      }));
      
      return statusData;
    } catch (error: any) {
      console.error('Failed to get session status:', error);
      return null;
    }
  },

  updateSession: async (sessionId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await sessionService.updateSession(sessionId, data);
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.sessionId === sessionId ? response.data : s
        ),
        currentSession:
          state.currentSession?.sessionId === sessionId
            ? response.data
            : state.currentSession,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update session',
        isLoading: false,
      });
    }
  },

  deleteSession: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      await sessionService.deleteSession(sessionId);
      set((state) => ({
        sessions: state.sessions.filter((s) => s.sessionId !== sessionId),
        currentSession:
          state.currentSession?.sessionId === sessionId
            ? null
            : state.currentSession,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete session',
        isLoading: false,
      });
      throw error;
    }
  },

  logoutSession: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      await sessionService.logoutSession(sessionId);
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.sessionId === sessionId
            ? { ...s, status: 'disconnected' as const }
            : s
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to logout session',
        isLoading: false,
      });
      throw error;
    }
  },

  setCurrentSession: (session) => set({ currentSession: session }),

  updateSessionInList: (sessionId, updates) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.sessionId === sessionId ? { ...s, ...updates } : s
      ),
      currentSession:
        state.currentSession?.sessionId === sessionId
          ? { ...state.currentSession, ...updates }
          : state.currentSession,
    }));
  },

  clearError: () => set({ error: null }),
}));