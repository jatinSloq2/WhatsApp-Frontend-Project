// src/store/slices/campaignSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { campaignService } from '@/lib/api/campaign.service';

export interface MessageContent {
  text?: string;
  image?: { url: string };
  video?: { url: string };
  audio?: { url: string };
  document?: { url: string };
  caption?: string;
  mimetype?: string;
}

export interface Campaign {
  _id: string;
  name: string;
  sessionId: string;
  sessionName?: string;
  phoneNumber?: string;
  messageType: 'single' | 'bulk';
  receivers: string[];
  message: MessageContent;
  delay?: number;
  status: 'draft' | 'sending' | 'completed' | 'failed';
  totalReceivers: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  completedAt?: string;
}

interface CampaignState {
  campaigns: Campaign[];
  currentCampaign: Campaign | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  uploadProgress: number;
}

const initialState: CampaignState = {
  campaigns: [],
  currentCampaign: null,
  isLoading: false,
  isSending: false,
  error: null,
  uploadProgress: 0,
};

// Async thunks
export const sendSingleMessage = createAsyncThunk(
  'campaign/sendSingle',
  async (
    data: {
      sessionId: string;
      receiver: string;
      message: MessageContent;
      campaignName?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await campaignService.sendSingleMessage(
        data.sessionId,
        data.receiver,
        data.message
      );

      let apiResponse;
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        apiResponse = response.data;
      } else if (response && typeof response === 'object' && 'success' in response) {
        apiResponse = response;
      } else {
        return rejectWithValue('Invalid response structure from server');
      }

      if (!apiResponse.success) {
        return rejectWithValue(apiResponse.message || 'Failed to send message');
      }

      // Create campaign record
      const campaign: Campaign = {
        _id: `campaign_${Date.now()}`,
        name: data.campaignName || `Single Message - ${new Date().toLocaleString()}`,
        sessionId: data.sessionId,
        messageType: 'single',
        receivers: [data.receiver],
        message: data.message,
        status: 'completed',
        totalReceivers: 1,
        sentCount: 1,
        failedCount: 0,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      return campaign;
    } catch (error: any) {
      console.error('Send single message error:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to send message'
      );
    }
  }
);

export const sendBulkMessage = createAsyncThunk(
  'campaign/sendBulk',
  async (
    data: {
      sessionId: string;
      numbers: string[];
      message: MessageContent;
      delay?: number;
      campaignName?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await campaignService.sendBulkMessage({
        id: data.sessionId,
        numbers: data.numbers,
        message: data.message,
        delay: data.delay,
      });

      let apiResponse;
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        apiResponse = response.data;
      } else if (response && typeof response === 'object' && 'success' in response) {
        apiResponse = response;
      } else {
        return rejectWithValue('Invalid response structure from server');
      }

      if (!apiResponse.success) {
        return rejectWithValue(apiResponse.message || 'Failed to send bulk messages');
      }

      // Create campaign record
      const campaign: Campaign = {
        _id: `campaign_${Date.now()}`,
        name: data.campaignName || `Bulk Campaign - ${new Date().toLocaleString()}`,
        sessionId: data.sessionId,
        messageType: 'bulk',
        receivers: data.numbers,
        message: data.message,
        delay: data.delay,
        status: 'sending',
        totalReceivers: data.numbers.length,
        sentCount: 0,
        failedCount: 0,
        createdAt: new Date().toISOString(),
      };

      return campaign;
    } catch (error: any) {
      console.error('Send bulk message error:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to send bulk messages'
      );
    }
  }
);

export const uploadMedia = createAsyncThunk(
  'campaign/uploadMedia',
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await campaignService.uploadMedia(file);

      let apiResponse;
      if (response.data && typeof response.data === 'object') {
        apiResponse = response.data;
      } else if (response && typeof response === 'object') {
        apiResponse = response;
      } else {
        return rejectWithValue('Invalid response structure from server');
      }

      return apiResponse.url || apiResponse.data?.url;
    } catch (error: any) {
      console.error('Upload media error:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to upload media'
      );
    }
  }
);

// Slice
const campaignSlice = createSlice({
  name: 'campaign',
  initialState,
  reducers: {
    setCurrentCampaign: (state, action: PayloadAction<Campaign | null>) => {
      state.currentCampaign = action.payload;
    },
    updateCampaignStatus: (
      state,
      action: PayloadAction<{ campaignId: string; status: Campaign['status']; sentCount?: number; failedCount?: number }>
    ) => {
      const { campaignId, status, sentCount, failedCount } = action.payload;

      state.campaigns = state.campaigns.map((c) =>
        c._id === campaignId
          ? {
              ...c,
              status,
              sentCount: sentCount ?? c.sentCount,
              failedCount: failedCount ?? c.failedCount,
              completedAt: status === 'completed' ? new Date().toISOString() : c.completedAt,
            }
          : c
      );

      if (state.currentCampaign?._id === campaignId) {
        state.currentCampaign = {
          ...state.currentCampaign,
          status,
          sentCount: sentCount ?? state.currentCampaign.sentCount,
          failedCount: failedCount ?? state.currentCampaign.failedCount,
          completedAt: status === 'completed' ? new Date().toISOString() : state.currentCampaign.completedAt,
        };
      }
    },
    deleteCampaign: (state, action: PayloadAction<string>) => {
      state.campaigns = state.campaigns.filter((c) => c._id !== action.payload);
      if (state.currentCampaign?._id === action.payload) {
        state.currentCampaign = null;
      }
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Send single message
    builder
      .addCase(sendSingleMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendSingleMessage.fulfilled, (state, action) => {
        state.isSending = false;
        state.campaigns.unshift(action.payload);
        state.currentCampaign = action.payload;
      })
      .addCase(sendSingleMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload as string;
      });

    // Send bulk message
    builder
      .addCase(sendBulkMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendBulkMessage.fulfilled, (state, action) => {
        state.isSending = false;
        state.campaigns.unshift(action.payload);
        state.currentCampaign = action.payload;
      })
      .addCase(sendBulkMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload as string;
      });

    // Upload media
    builder
      .addCase(uploadMedia.pending, (state) => {
        state.isLoading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadMedia.fulfilled, (state) => {
        state.isLoading = false;
        state.uploadProgress = 100;
      })
      .addCase(uploadMedia.rejected, (state, action) => {
        state.isLoading = false;
        state.uploadProgress = 0;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentCampaign,
  updateCampaignStatus,
  deleteCampaign,
  setUploadProgress,
  clearError,
} = campaignSlice.actions;

export default campaignSlice.reducer;