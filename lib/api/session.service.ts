// src/lib/api/session.service.ts

import { sessionApi } from './client';
import { Session, CreateSessionData } from '@/types/session.types';

export const sessionService = {
  async createSession(data: CreateSessionData) {
    return sessionApi.post<Session>('/sessions', data);
  },

  async getSessions() {
    return sessionApi.get<{ sessions: Session[]; count: number }>('/sessions');
  },

  async getSession(sessionId: string) {
    return sessionApi.get<Session>(`/sessions/${sessionId}`);
  },

  async getQRCode(sessionId: string) {
    return sessionApi.get<{ qr: string; text: string }>(`/sessions/${sessionId}/qr`);
  },

  async getSessionStatus(sessionId: string) {
    return sessionApi.get<{
      sessionId: string;
      status: string;
      connectedAt?: string;
      lastSeen?: string;
    }>(`/sessions/${sessionId}/status`);
  },

  async updateSession(sessionId: string, data: Partial<Session>) {
    return sessionApi.put<Session>(`/sessions/${sessionId}`, data);
  },

  async logoutSession(sessionId: string) {
    return sessionApi.post(`/sessions/${sessionId}/logout`);
  },

  async deleteSession(sessionId: string) {
    return sessionApi.delete(`/sessions/${sessionId}`);
  },
};