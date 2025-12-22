// src/lib/api/campaign.service.ts

import { MessageContent } from "@/store/slices/campaignSlice";
import { sessionApi } from "./client";

export const campaignService = {
  sendSingleMessage: async (
    sessionId: string,
    receiver: string,
    message: MessageContent
  ) => {
    return sessionApi.post(`/messages/send?id=${sessionId}`, {
      receiver,
      message,
    });
  },

  sendBulkMessage: async (data: {
    id: string;
    numbers: string[];
    message: MessageContent;
    delay?: number;
  }) => {
    return sessionApi.post("/messages/bulk", data);
  },

  uploadMedia: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return sessionApi.post("/sessions/upload/media", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
