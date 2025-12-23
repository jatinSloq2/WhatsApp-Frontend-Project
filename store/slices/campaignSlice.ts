// src/store/slices/campaignSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { campaignService } from "@/lib/api/campaign.service";

const initialState = {
  campaigns: [],
  currentCampaign: null,
  isLoading: false,
  isSending: false,
  error: null,
  uploadProgress: 0,
};

// Async thunks
export const sendSingleMessage = createAsyncThunk(
  "campaign/sendSingle",
  async (data, { rejectWithValue }) => {
    try {
      const response = await campaignService.sendSingleMessage(
        data.sessionId,
        data.receiver,
        data.message
      );

      let apiResponse;
      if (
        response.data &&
        typeof response.data === "object" &&
        "success" in response.data
      ) {
        apiResponse = response.data;
      } else if (
        response &&
        typeof response === "object" &&
        "success" in response
      ) {
        apiResponse = response;
      } else {
        return rejectWithValue("Invalid response structure from server");
      }

      if (!apiResponse.success) {
        return rejectWithValue(apiResponse.message || "Failed to send message");
      }

      // Create campaign record
      const campaign = {
        _id: `campaign_${Date.now()}`,
        sessionId: data.sessionId,
        type: "single",
        receiver: data.receiver,
        message: data.message,
        total: 1,
        sentCount: 1,
        failedCount: 0,
        status: "completed",
        createdAt: new Date().toISOString(),
      };

      return campaign;
    } catch (error) {
      console.error("Send single message error:", error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to send message"
      );
    }
  }
);

export const sendBulkMessage = createAsyncThunk(
  "campaign/sendBulk",
  async (data, { rejectWithValue }) => {
    try {
      const response = await campaignService.sendBulkMessage({
        id: data.sessionId,
        numbers: data.numbers,
        message: data.message,
        delay: data.delay,
      });

      let apiResponse;
      if (
        response.data &&
        typeof response.data === "object" &&
        "success" in response.data
      ) {
        apiResponse = response.data;
      } else if (
        response &&
        typeof response === "object" &&
        "success" in response
      ) {
        apiResponse = response;
      } else {
        return rejectWithValue("Invalid response structure from server");
      }

      if (!apiResponse.success) {
        return rejectWithValue(
          apiResponse.message || "Failed to send bulk messages"
        );
      }

      // Create campaign record
      const campaign = {
        _id: `campaign_${Date.now()}`,
        sessionId: data.sessionId,
        type: "bulk",
        numbers: data.numbers,
        message: data.message,
        total: data.numbers.length,
        sentCount: 0,
        failedCount: 0,
        status: "running",
        createdAt: new Date().toISOString(),
      };

      return campaign;
    } catch (error) {
      console.error("Send bulk message error:", error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to send bulk messages"
      );
    }
  }
);

export const uploadMedia = createAsyncThunk(
  "campaign/uploadMedia",
  async (file, { rejectWithValue }) => {
    try {
      const response = await campaignService.uploadMedia(file);

      let apiResponse;
      if (response.data && typeof response.data === "object") {
        apiResponse = response.data;
      } else if (response && typeof response === "object") {
        apiResponse = response;
      } else {
        return rejectWithValue("Invalid response structure from server");
      }

      return apiResponse.url || apiResponse.data?.url;
    } catch (error) {
      console.error("Upload media error:", error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload media"
      );
    }
  }
);

export const fetchCampaigns = createAsyncThunk(
  "campaign/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await campaignService.getCampaigns(params);
      console.log("API Response:", response.data);

      // Ensure success and that data is an array
      if (!Array.isArray(response.data)) {
        console.log("HU", response.data);
        return rejectWithValue("Failed to fetch campaigns");
      }

      // Map to ensure required fields exist
      const campaigns = response.data.map((c) => ({
        _id: c._id,
        sessionId: c.sessionId,
        type: c.type,
        receiver: c.receiver,
        numbers: c.numbers ?? [],
        message: c.message ?? {},
        total: c.total ?? 0,
        sentCount: c.sentCount ?? 0,
        failedCount: c.failedCount ?? 0,
        status: c.status,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));

      return campaigns;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchCampaignById = createAsyncThunk(
  "campaign/fetchById",
  async (campaignId, { rejectWithValue }) => {
    try {
      const response = await campaignService.getCampaignById(campaignId);

      if (!response.data?.success) {
        return rejectWithValue("Campaign not found");
      }

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice
const campaignSlice = createSlice({
  name: "campaign",
  initialState,
  reducers: {
    setCurrentCampaign: (state, action) => {
      state.currentCampaign = action.payload;
    },
    updateCampaignStatus: (state, action) => {
      const { campaignId, status, sentCount, failedCount } = action.payload;

      state.campaigns = state.campaigns.map((c) =>
        c._id === campaignId
          ? {
              ...c,
              status,
              sentCount: sentCount ?? c.sentCount,
              failedCount: failedCount ?? c.failedCount,
              updatedAt: new Date().toISOString(),
            }
          : c
      );

      if (state.currentCampaign?._id === campaignId) {
        state.currentCampaign = {
          ...state.currentCampaign,
          status,
          sentCount: sentCount ?? state.currentCampaign.sentCount,
          failedCount: failedCount ?? state.currentCampaign.failedCount,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteCampaign: (state, action) => {
      state.campaigns = state.campaigns.filter((c) => c._id !== action.payload);
      if (state.currentCampaign?._id === action.payload) {
        state.currentCampaign = null;
      }
    },
    setUploadProgress: (state, action) => {
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
      });

    // Fetch campaigns
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        console.log("Action.payload", action.payload);
        state.isLoading = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch campaign by ID
    builder
      .addCase(fetchCampaignById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCampaignById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCampaign = action.payload;
      })
      .addCase(fetchCampaignById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
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