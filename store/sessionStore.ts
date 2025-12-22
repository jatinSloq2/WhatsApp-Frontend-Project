// src/store/slices/sessionSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { sessionService } from '@/lib/api/session.service';

export interface Session {
  _id?: string;
  sessionId: string;
  sessionName: string;
  phoneNumber: string;
  status: 'initializing' | 'qr_waiting' | 'connected' | 'disconnected' | 'no_session';
  qrCode?: string;
  lastConnected?: string;
  lastDisconnected?: string;
  retryCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  connectedAt?: string;
  lastSeen?: string;
}

interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  error: string | null;
  qrCode: string | null;
}

const initialState: SessionState = {
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,
  qrCode: null,
};

// Async thunks
export const createSession = createAsyncThunk(
  'session/create',
  async (data: { phoneNumber: string; sessionName: string }, { rejectWithValue }) => {
    try {
      // Generate sessionId from phone number
      const sessionId = data.phoneNumber.replace(/[^0-9]/g, '');
      
      const response = await sessionService.createSession({ 
        sessionId,
        phoneNumber: data.phoneNumber,
        sessionName: data.sessionName 
      });

      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to create session');
      }

      return {
        sessionId: response.data.data.sessionId,
        sessionName: data.sessionName,
        phoneNumber: data.phoneNumber,
        status: response.data.data.status as Session['status'],
        qrCode: response.data.data.qr,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create session');
    }
  }
);

export const fetchSessions = createAsyncThunk(
  'session/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sessionService.getSessions();
      
      if (!response.data.success) {
        return rejectWithValue('Failed to fetch sessions');
      }

      // Map API response to Session format
      return response.data.sessions.map(s => ({
        sessionId: s.sessionId,
        sessionName: s.sessionId, // Use sessionId as name if not available
        phoneNumber: s.phoneNumber || '',
        status: s.status as Session['status'],
        isActive: s.isActive,
        createdAt: new Date().toISOString(),
      }));
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sessions');
    }
  }
);

export const getSessionStatus = createAsyncThunk(
  'session/getStatus',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await sessionService.getSessionStatus(sessionId);
      
      return {
        sessionId,
        status: response.data.status as Session['status'],
        phoneNumber: response.data.data?.phone || null,
        lastConnected: response.data.data?.lastConnected || null,
        retryCount: response.data.data?.retryCount || 0,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get session status');
    }
  }
);

export const deleteSession = createAsyncThunk(
  'session/delete',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await sessionService.deleteSession(sessionId);
      
      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to delete session');
      }

      return sessionId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete session');
    }
  }
);

export const fetchAllSessionsFromDB = createAsyncThunk(
  'session/fetchAllFromDB',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sessionService.getAllSessionsFromDB();
      
      if (!response.data.success) {
        return rejectWithValue('Failed to fetch sessions from DB');
      }

      return response.data.sessions;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sessions');
    }
  }
);

// Slice
const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setCurrentSession: (state, action: PayloadAction<Session | null>) => {
      state.currentSession = action.payload;
    },
    updateSessionInList: (state, action: PayloadAction<{ sessionId: string; updates: Partial<Session> }>) => {
      const { sessionId, updates } = action.payload;
      
      state.sessions = state.sessions.map(s =>
        s.sessionId === sessionId ? { ...s, ...updates } : s
      );

      if (state.currentSession?.sessionId === sessionId) {
        state.currentSession = { ...state.currentSession, ...updates };
      }
    },
    setQRCode: (state, action: PayloadAction<string | null>) => {
      state.qrCode = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create session
    builder
      .addCase(createSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.isLoading = false;
        const newSession = action.payload as Session;
        state.sessions.push(newSession);
        state.currentSession = newSession;
        state.qrCode = newSession.qrCode || null;
      })
      .addCase(createSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch sessions
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessions = action.payload as Session[];
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get session status
    builder
      .addCase(getSessionStatus.fulfilled, (state, action) => {
        const { sessionId, status, phoneNumber, lastConnected, retryCount } = action.payload;
        
        state.sessions = state.sessions.map(s =>
          s.sessionId === sessionId
            ? {
                ...s,
                status,
                phoneNumber: phoneNumber || s.phoneNumber,
                lastConnected: lastConnected || s.lastConnected,
                retryCount: retryCount ?? s.retryCount,
              }
            : s
        );

        if (state.currentSession?.sessionId === sessionId) {
          state.currentSession = {
            ...state.currentSession,
            status,
            phoneNumber: phoneNumber || state.currentSession.phoneNumber,
            lastConnected: lastConnected || state.currentSession.lastConnected,
            retryCount: retryCount ?? state.currentSession.retryCount,
          };
        }
      });

    // Delete session
    builder
      .addCase(deleteSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessions = state.sessions.filter(s => s.sessionId !== action.payload);
        
        if (state.currentSession?.sessionId === action.payload) {
          state.currentSession = null;
        }
      })
      .addCase(deleteSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch all from DB
    builder
      .addCase(fetchAllSessionsFromDB.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllSessionsFromDB.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchAllSessionsFromDB.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentSession, updateSessionInList, setQRCode, clearError } = sessionSlice.actions;
export default sessionSlice.reducer;