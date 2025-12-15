// src/store/slices/sessionSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Session, CreateSessionData } from '@/types/session.types';
import { sessionService } from '@/lib/api/session.service';

interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SessionState = {
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchSessions = createAsyncThunk(
  'session/fetchSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sessionService.getSessions();
      return response.data.sessions;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sessions');
    }
  }
);

export const createSession = createAsyncThunk(
  'session/createSession',
  async (data: CreateSessionData, { rejectWithValue }) => {
    try {
      const response = await sessionService.createSession(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create session');
    }
  }
);

export const getSession = createAsyncThunk(
  'session/getSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await sessionService.getSession(sessionId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get session');
    }
  }
);

export const updateSession = createAsyncThunk(
  'session/updateSession',
  async ({ sessionId, data }: { sessionId: string; data: Partial<Session> }, { rejectWithValue }) => {
    try {
      const response = await sessionService.updateSession(sessionId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update session');
    }
  }
);

export const deleteSession = createAsyncThunk(
  'session/deleteSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      await sessionService.deleteSession(sessionId);
      return sessionId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete session');
    }
  }
);

export const logoutSession = createAsyncThunk(
  'session/logoutSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      await sessionService.logoutSession(sessionId);
      return sessionId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to logout session');
    }
  }
);

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setCurrentSession: (state, action: PayloadAction<Session | null>) => {
      state.currentSession = action.payload;
    },
    updateSessionInList: (state, action: PayloadAction<{ sessionId: string; updates: Partial<Session> }>) => {
      state.sessions = state.sessions.map((s) =>
        s.sessionId === action.payload.sessionId ? { ...s, ...action.payload.updates } : s
      );
      if (state.currentSession?.sessionId === action.payload.sessionId) {
        state.currentSession = { ...state.currentSession, ...action.payload.updates };
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Sessions
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.sessions = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Session
    builder
      .addCase(createSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.sessions.push(action.payload);
        state.currentSession = action.payload;
        state.isLoading = false;
      })
      .addCase(createSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Session
    builder
      .addCase(getSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSession.fulfilled, (state, action) => {
        state.currentSession = action.payload;
        state.isLoading = false;
      })
      .addCase(getSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Session
    builder
      .addCase(updateSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.map((s) =>
          s.sessionId === action.payload.sessionId ? action.payload : s
        );
        if (state.currentSession?.sessionId === action.payload.sessionId) {
          state.currentSession = action.payload;
        }
        state.isLoading = false;
      })
      .addCase(updateSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Session
    builder
      .addCase(deleteSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter((s) => s.sessionId !== action.payload);
        if (state.currentSession?.sessionId === action.payload) {
          state.currentSession = null;
        }
        state.isLoading = false;
      })
      .addCase(deleteSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout Session
    builder
      .addCase(logoutSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.map((s) =>
          s.sessionId === action.payload ? { ...s, status: 'disconnected' as const } : s
        );
        state.isLoading = false;
      })
      .addCase(logoutSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentSession, updateSessionInList, clearError } = sessionSlice.actions;
export default sessionSlice.reducer;