// src/store/slices/sessionSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { sessionService } from '@/lib/api/session.service';

export interface Session {
  _id?: string;
  sessionId: string;
  sessionName: string;
  phoneNumber: string;
  status: 'initializing' | 'qr_ready' | 'qr_waiting' | 'connected' | 'disconnected' | 'no_session';
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
      // Generate sessionId from phone number (remove +91)
      const sessionId = data.phoneNumber.replace(/[^0-9]/g, '');
      
      console.log('Creating session with:', { sessionId, phoneNumber: data.phoneNumber, sessionName: data.sessionName });
      
      // Step 1: Create session and get QR code
      const response = await sessionService.createSession({ 
        sessionId,
        phoneNumber: data.phoneNumber,
        sessionName: data.sessionName 
      });

      console.log('Full API response:', response);
      console.log('Response.data:', response.data);
      console.log('Type of response:', typeof response);
      console.log('Type of response.data:', typeof response.data);
      
      // CRITICAL FIX: The API response structure is different than expected
      // Check if response.data has the success field OR if response itself has it
      let apiResponse;
      let apiData;
      
      // Case 1: Response is { data: { success, message, data } } (standard Axios)
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        console.log('Case 1: Standard Axios response structure');
        apiResponse = response.data;
        apiData = apiResponse.data;
      }
      // Case 2: Response is { success, message, data } (custom Axios interceptor)
      else if (response && typeof response === 'object' && 'success' in response) {
        console.log('Case 2: Custom interceptor response structure');
        apiResponse = response;
        apiData = response.data;
      }
      // Case 3: Response.data is already the API data (sessionId, status, qr)
      else if (response.data && 'sessionId' in response.data && 'status' in response.data) {
        console.log('Case 3: Response.data is the actual data');
        apiResponse = { success: true };
        apiData = response.data;
      }
      else {
        console.error('Unexpected response structure:', response);
        return rejectWithValue('Invalid response structure from server');
      }

      console.log('Parsed apiResponse:', apiResponse);
      console.log('Parsed apiData:', apiData);

      // Check if response is successful
      if (apiResponse.success === false) {
        console.error('API returned success: false', apiResponse);
        return rejectWithValue(apiResponse.message || 'Failed to create session');
      }

      if (!apiData) {
        console.error('No data in response');
        return rejectWithValue('Invalid response from server');
      }

      // Step 2: Try to save metadata (optional - don't fail if this errors)
      try {
        await sessionService.saveSessionMetadata({
          sessionId: apiData.sessionId,
          sessionName: data.sessionName,
          phoneNumber: data.phoneNumber,
        });
      } catch (metadataError) {
        console.warn('Failed to save metadata:', metadataError);
        // Continue anyway - metadata is optional
      }

      // Return the session object for Redux state
      const newSession = {
        sessionId: apiData.sessionId,
        sessionName: data.sessionName,
        phoneNumber: data.phoneNumber,
        status: apiData.status as Session['status'],
        qrCode: apiData.qr,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      console.log('Returning new session:', newSession);
      return newSession;
    } catch (error: any) {
      console.error('Create session error:', error);
      console.error('Error response:', error.response);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to create session'
      );
    }
  }
);

export const fetchSessions = createAsyncThunk(
  'session/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sessionService.getSessions();

      console.log('Fetch sessions response:', response);
      console.log('Response.data:', response.data);
      
      // Handle different response structures
      let apiResponse;
      let sessions;
      
      // Case 1: Response is { data: { success, count, sessions } } (standard Axios)
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        console.log('Case 1: Standard Axios response');
        apiResponse = response.data;
        sessions = apiResponse.sessions;
      }
      // Case 2: Response is { success, count, sessions } (custom interceptor)
      else if (response && typeof response === 'object' && 'success' in response) {
        console.log('Case 2: Custom interceptor response');
        apiResponse = response;
        sessions = response.sessions;
      }
      else {
        console.error('Unexpected response structure:', response);
        return rejectWithValue('Invalid response structure from server');
      }
      
      if (!apiResponse.success) {
        return rejectWithValue('Failed to fetch sessions');
      }

      if (!sessions || !Array.isArray(sessions)) {
        console.error('No sessions array in response');
        return [];
      }

      console.log('Mapping sessions:', sessions);

      // Map API response to Session format
      const mappedSessions = sessions.map((s: any) => ({
        sessionId: s.sessionId,
        sessionName: s.sessionName || s.sessionId,
        phoneNumber: s.phoneNumber || '',
        status: s.status as Session['status'],
        isActive: s.isActive,
        createdAt: s.createdAt || new Date().toISOString(),
        lastConnected: s.lastConnected,
        qrCode: s.qrCode,
      }));

      console.log('Mapped sessions:', mappedSessions);
      return mappedSessions;
    } catch (error: any) {
      console.error('Fetch sessions error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sessions');
    }
  }
);

export const getSessionStatus = createAsyncThunk(
  'session/getStatus',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await sessionService.getSessionStatus(sessionId);
      
      console.log('Get session status response:', response);
      console.log('Response.data:', response.data);
      
      // Handle different response structures
      let apiResponse;
      let status;
      let data;
      
      // Case 1: Response is { data: { success, status, data } } (standard Axios)
      if (response.data && typeof response.data === 'object' && 'status' in response.data) {
        console.log('Status Case 1: Standard Axios response');
        apiResponse = response.data;
        status = apiResponse.status;
        data = apiResponse.data;
      }
      // Case 2: Response is { success, status, data } (custom interceptor)
      else if (response && typeof response === 'object' && 'status' in response) {
        console.log('Status Case 2: Custom interceptor response');
        apiResponse = response;
        status = response.status;
        data = response.data;
      }
      else {
        console.error('Unexpected status response structure:', response);
        return rejectWithValue('Invalid response structure from server');
      }
      
      const result = {
        sessionId,
        status: status as Session['status'],
        phoneNumber: data?.phone || null,
        lastConnected: data?.lastConnected || null,
        retryCount: data?.retryCount || 0,
      };
      
      console.log('Returning status result:', result);
      return result;
    } catch (error: any) {
      console.error('Get session status error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to get session status');
    }
  }
);

export const deleteSession = createAsyncThunk(
  'session/delete',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await sessionService.deleteSession(sessionId);
      
      console.log('Delete session response:', response);
      console.log('Response.data:', response.data);
      
      // Handle different response structures
      let apiResponse;
      
      // Case 1: Response is { data: { success, message } } (standard Axios)
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        console.log('Delete Case 1: Standard Axios response');
        apiResponse = response.data;
      }
      // Case 2: Response is { success, message } (custom interceptor)
      else if (response && typeof response === 'object' && 'success' in response) {
        console.log('Delete Case 2: Custom interceptor response');
        apiResponse = response;
      }
      else {
        console.error('Unexpected delete response structure:', response);
        return rejectWithValue('Invalid response structure from server');
      }
      
      if (!apiResponse.success) {
        return rejectWithValue(apiResponse.message || 'Failed to delete session');
      }

      console.log('Session deleted successfully:', sessionId);
      return sessionId;
    } catch (error: any) {
      console.error('Delete session error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete session');
    }
  }
);

export const fetchAllSessionsFromDB = createAsyncThunk(
  'session/fetchAllFromDB',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sessionService.getAllSessionsFromDB();
      
      console.log('Fetch all from DB response:', response);
      console.log('Response.data:', response.data);
      
      // Handle different response structures
      let apiResponse;
      let sessions;
      
      // Case 1: Response is { data: { success, count, sessions } } (standard Axios)
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        console.log('DB Case 1: Standard Axios response');
        apiResponse = response.data;
        sessions = apiResponse.sessions;
      }
      // Case 2: Response is { success, count, sessions } (custom interceptor)
      else if (response && typeof response === 'object' && 'success' in response) {
        console.log('DB Case 2: Custom interceptor response');
        apiResponse = response;
        sessions = response.sessions;
      }
      else {
        console.error('Unexpected DB response structure:', response);
        return rejectWithValue('Invalid response structure from server');
      }
      
      if (!apiResponse.success) {
        return rejectWithValue('Failed to fetch sessions from DB');
      }

      if (!sessions || !Array.isArray(sessions)) {
        console.error('No sessions array in DB response');
        return [];
      }

      console.log('DB sessions:', sessions);
      return sessions;
    } catch (error: any) {
      console.error('Fetch all from DB error:', error);
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
        console.log('Redux: createSession.pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        console.log('Redux: createSession.fulfilled', action.payload);
        state.isLoading = false;
        const newSession = action.payload as Session;
        state.sessions.push(newSession);
        state.currentSession = newSession;
        state.qrCode = newSession.qrCode || null;
      })
      .addCase(createSession.rejected, (state, action) => {
        console.log('Redux: createSession.rejected', action.payload);
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