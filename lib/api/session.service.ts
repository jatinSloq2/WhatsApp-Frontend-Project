// src/lib/api/session.service.ts

import { sessionApi } from './client';
import { Session } from '@/types/session.types';

export interface CreateSessionData {
  sessionId: string;
  phoneNumber: string;
  sessionName: string;
}

export const sessionService = {
  // Create session and get QR code
  async createSession(data: CreateSessionData) {
    // Send ONLY the 'id' field as that's what your API expects
    // The API only needs the sessionId (phone number without country code)
    return sessionApi.post<{
      success: boolean;
      message: string;
      data: {
        sessionId: string;
        status: string;
        qr: string;
      };
    }>('/sessions/create', { 
      id: data.sessionId  // API expects just 'id' field
    });
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
    }>('/sessions/list');
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
    }>(`/sessions/status/${sessionId}`);
  },

  // Delete session
  async deleteSession(sessionId: string) {
    return sessionApi.delete<{
      success: boolean;
      message: string;
    }>(`/sessions/${sessionId}`);
  },

  // Get all sessions from DB (including inactive)
  async getAllSessionsFromDB() {
    return sessionApi.get<{
      success: boolean;
      count: number;
      sessions: Session[];
    }>('/sessions/db/all');
  },

  // Restore sessions after restart
  async restoreSessions() {
    return sessionApi.post<{
      success: boolean;
      message: string;
    }>('/sessions/restore');
  },

  // Save session metadata (sessionName, phoneNumber) to DB
  async saveSessionMetadata(data: {
    sessionId: string;
    sessionName: string;
    phoneNumber: string;
  }) {
    return sessionApi.post<{
      success: boolean;
      message: string;
    }>('/sessions/metadata', data);
  },
};