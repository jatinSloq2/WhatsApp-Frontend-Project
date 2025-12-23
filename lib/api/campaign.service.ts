// src/lib/api/campaign.service.js

import { sessionApi } from "./client";

export const campaignService = {
  sendSingleMessage: async (sessionId, receiver, message) => {
    return sessionApi.post(`/messages/send?id=${sessionId}`, {
      receiver,
      message,
    });
  },

  sendBulkMessage: async (data) => {
    return sessionApi.post("/messages/bulk", data);
  },

  uploadMedia: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return sessionApi.post("/sessions/upload/media", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getCampaigns: (params) =>
    sessionApi.get("/campaigns", {
      params,
    }),

  getCampaignById: (id) =>
    sessionApi.get(`/campaigns/${id}`),
};