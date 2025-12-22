// src/types/session.types.ts

export interface Session {
  _id?: string;
  sessionId: string;
  sessionName: string;
  phoneNumber: string;
  status: 'initializing' | 'qr_waiting' | 'connected' | 'disconnected' | 'no_session';
  qrCode?: string;
  lastConnected?: string;
  lastDisconnected?: string;
  qrGenerated?: boolean;
  retryCount?: number;
  isActive: boolean;
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt?: string;
  connectedAt?: string;
  lastSeen?: string;
}

export interface CreateSessionData {
  sessionId?: string;
  phoneNumber: string;
  sessionName: string;
}

export interface SessionStatusResponse {
  sessionId: string;
  status: Session['status'];
  connectedAt?: string;
  lastSeen?: string;
  phoneNumber?: string;
  retryCount?: number;
}