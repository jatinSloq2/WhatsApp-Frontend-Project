// src/lib/api/chat.service.ts

import axios from 'axios';
import {
  Chat,
  Message,
  SendMessagePayload,
  SendMediaPayload,
  LoadMessagesPayload,
  SearchMessagesPayload,
} from '@/types/chat.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003';

// Create axios instance with default config
const chatApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
chatApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const chatService = {
  // Get all chats for a session
  getChats: async (sessionId: string) => {
    const response = await chatApi.get<{ success: boolean; data: { chats: Chat[]; count: number } }>(
      `/messages/sessions/${sessionId}/chats`
    );
    return response.data;
  },

  // Get messages for a chat
  getMessages: async ({ sessionId, chatId, page = 1, limit = 50 }: LoadMessagesPayload) => {
    const response = await chatApi.get<{
      success: boolean;
      data: {
        messages: Message[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      };
    }>(`/messages/sessions/${sessionId}/chats/${chatId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Send text message
  sendMessage: async (payload: SendMessagePayload) => {
    const response = await chatApi.post<{ success: boolean; data: Message }>(
      '/messages/send',
      payload
    );
    return response.data;
  },

  // Send media message
  sendMedia: async ({ sessionId, to, file, mediaType, caption }: SendMediaPayload) => {
    const formData = new FormData();
    formData.append('sessionId', sessionId);
    formData.append('to', to);
    formData.append('media', file);
    formData.append('mediaType', mediaType);
    if (caption) formData.append('caption', caption);

    const response = await chatApi.post<{ success: boolean; data: Message }>(
      '/messages/send-media',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (sessionId: string, chatId: string) => {
    const response = await chatApi.post<{ success: boolean; data: { success: boolean } }>(
      `/messages/sessions/${sessionId}/chats/${chatId}/read`
    );
    return response.data;
  },

  // Delete message
  deleteMessage: async (messageId: string) => {
    const response = await chatApi.delete<{ success: boolean }>(
      `/messages/messages/${messageId}`
    );
    return response.data;
  },

  // Toggle star message
  toggleStar: async (messageId: string) => {
    const response = await chatApi.post<{ success: boolean; data: { messageId: string; isStarred: boolean } }>(
      `/messages/messages/${messageId}/star`
    );
    return response.data;
  },

  // Search messages
  searchMessages: async ({ sessionId, query }: SearchMessagesPayload) => {
    const response = await chatApi.get<{ success: boolean; data: { messages: Message[]; count: number } }>(
      `/messages/sessions/${sessionId}/search`,
      { params: { q: query } }
    );
    return response.data;
  },
};