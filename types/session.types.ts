// src/types/session.types.ts

export interface Session {
  _id: string;
  sessionId: string;
  userId: string;
  phoneNumber: string;
  sessionName: string;
  status: SessionStatus;
  isActive: boolean;
  qrCode?: string;
  connectedAt?: string;
  lastSeen?: string;
  retryCount: number;
  metadata?: {
    waVersion?: string;
    platform?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type SessionStatus = 
  | 'initializing'
  | 'qr_waiting'
  | 'connected'
  | 'disconnected'
  | 'error';

export interface CreateSessionData {
  phoneNumber: string;
  sessionName: string;
}

export interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  error: string | null;
}