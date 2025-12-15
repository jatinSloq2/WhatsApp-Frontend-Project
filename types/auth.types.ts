// src/types/auth.types.ts

export interface User {
  _id: string;
  email: string;
  username: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  subscriptionTier: 'free' | 'pro' | 'business';
  subscriptionStatus: 'active' | 'cancelled' | 'expired';
  isEmailVerified: boolean;
  isActive: boolean;
  limits: {
    maxSessions: number;
    maxMessagesPerDay: number;
    maxCampaignsPerMonth: number;
    maxChatbots: number;
  };
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  identifier: string; // email or username
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

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

// src/types/api.types.ts

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors: any;
  timestamp: string;
}