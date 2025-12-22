// src/lib/api/session.service.ts

import { sessionApi } from './client';
import { Session, CreateSessionData } from '@/types/session.types';

export const sessionService = {
  // Create session and get QR code
  async createSession(data: CreateSessionData) {
    return sessionApi.post<{
      success: boolean;
      message: string;
      data: {
        sessionId: string;
        status: string;
        qr?: string;
        phoneNumber?: string;
      };
    }>('/create', { id: data.sessionId || data.phoneNumber });
  },

  // List all active sessions
  async getSessions() {
    return sessionApi.get<{
      success: boolean;
      count: number;
      sessions: Array<{
        sessionId: string;
        status: string;
        phoneNumber: string | null;
        isActive: boolean;
      }>;
    }>('/list');
  },

  // Get session status
  async getSessionStatus(sessionId: string) {
    return sessionApi.get<{
      success: boolean;
      status: string;
      data?: {
        phone: string;
        lastConnected: string;
        retryCount: number;
      };
    }>(`/status/${sessionId}`);
  },

  // Delete session
  async deleteSession(sessionId: string) {
    return sessionApi.delete<{
      success: boolean;
      message: string;
    }>(`/${sessionId}`);
  },

  // Get all sessions from DB (including inactive)
  async getAllSessionsFromDB() {
    return sessionApi.get<{
      success: boolean;
      count: number;
      sessions: Session[];
    }>('/db/all');
  },

  // Restore sessions after restart
  async restoreSessions() {
    return sessionApi.post<{
      success: boolean;
      message: string;
    }>('/restore');
  },
};