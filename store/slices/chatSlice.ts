// src/store/slices/chatSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  ChatState,
  Chat,
  Message,
  SendMessagePayload,
  SendMediaPayload,
  LoadMessagesPayload,
  SearchMessagesPayload,
} from '@/types/chat.types';
import { chatService } from '@/lib/api/chat.service';

const initialState: ChatState = {
  chats: [],
  messages: [],
  selectedChat: null,
  selectedSession: null,
  loading: false,
  error: null,
  messagesLoading: false,
  chatsLoading: false,
  sendingMessage: false,
  typingUsers: {},
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    hasMore: false,
  },
};

// Async Thunks
export const loadChats = createAsyncThunk(
  'chat/loadChats',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await chatService.getChats(sessionId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load chats');
    }
  }
);

export const loadMessages = createAsyncThunk(
  'chat/loadMessages',
  async (payload: LoadMessagesPayload, { rejectWithValue }) => {
    try {
      const response = await chatService.getMessages(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (payload: SendMessagePayload, { rejectWithValue }) => {
    try {
      const response = await chatService.sendMessage(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const sendMedia = createAsyncThunk(
  'chat/sendMedia',
  async (payload: SendMediaPayload, { rejectWithValue }) => {
    try {
      const response = await chatService.sendMedia(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send media');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'chat/markAsRead',
  async ({ sessionId, chatId }: { sessionId: string; chatId: string }, { rejectWithValue }) => {
    try {
      await chatService.markAsRead(sessionId, chatId);
      return { chatId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async (messageId: string, { rejectWithValue }) => {
    try {
      await chatService.deleteMessage(messageId);
      return messageId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete message');
    }
  }
);

export const toggleStar = createAsyncThunk(
  'chat/toggleStar',
  async (messageId: string, { rejectWithValue }) => {
    try {
      const response = await chatService.toggleStar(messageId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle star');
    }
  }
);

export const searchMessages = createAsyncThunk(
  'chat/searchMessages',
  async (payload: SearchMessagesPayload, { rejectWithValue }) => {
    try {
      const response = await chatService.searchMessages(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search messages');
    }
  }
);

// Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSelectedSession: (state, action: PayloadAction<string>) => {
      state.selectedSession = action.payload;
      state.selectedChat = null;
      state.messages = [];
      state.chats = [];
    },
    setSelectedChat: (state, action: PayloadAction<string | null>) => {
      state.selectedChat = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const exists = state.messages.some((m) => m.messageId === action.payload.messageId);
      if (!exists) {
        state.messages.push(action.payload);

        // Update chat's last message and unread count
        const chatIndex = state.chats.findIndex((c) => c.chatId === action.payload.chatId);
        if (chatIndex !== -1) {
          state.chats[chatIndex].lastMessage = {
            content: action.payload.content.text || action.payload.content.caption || '',
            timestamp: action.payload.timestamp,
            messageId: action.payload.messageId,
            type: action.payload.type,
          };
          if (action.payload.direction === 'incoming') {
            state.chats[chatIndex].unreadCount += 1;
          }
        }
      }
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{ messageId: string; status: Message['status'] }>
    ) => {
      const messageIndex = state.messages.findIndex((m) => m.messageId === action.payload.messageId);
      if (messageIndex !== -1) {
        state.messages[messageIndex].status = action.payload.status;
      }
    },
    setTyping: (state, action: PayloadAction<{ chatId: string; isTyping: boolean }>) => {
      state.typingUsers[action.payload.chatId] = action.payload.isTyping;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetChat: (state) => {
      state.selectedChat = null;
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    // Load Chats
    builder.addCase(loadChats.pending, (state) => {
      state.chatsLoading = true;
      state.error = null;
    });
    builder.addCase(loadChats.fulfilled, (state, action) => {
      state.chats = action.payload.chats;
      state.chatsLoading = false;
    });
    builder.addCase(loadChats.rejected, (state, action) => {
      state.chatsLoading = false;
      state.error = action.payload as string;
    });

    // Load Messages
    builder.addCase(loadMessages.pending, (state) => {
      state.messagesLoading = true;
      state.error = null;
    });
    builder.addCase(loadMessages.fulfilled, (state, action) => {
      state.messages = action.payload.messages;
      state.pagination = {
        page: action.payload.pagination.page,
        limit: action.payload.pagination.limit,
        total: action.payload.pagination.total,
        hasMore: action.payload.pagination.page < action.payload.pagination.pages,
      };
      state.messagesLoading = false;
    });
    builder.addCase(loadMessages.rejected, (state, action) => {
      state.messagesLoading = false;
      state.error = action.payload as string;
    });

    // Send Message
    builder.addCase(sendMessage.pending, (state) => {
      state.sendingMessage = true;
      state.error = null;
    });
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      state.messages.push(action.payload);
      state.sendingMessage = false;
    });
    builder.addCase(sendMessage.rejected, (state, action) => {
      state.sendingMessage = false;
      state.error = action.payload as string;
    });

    // Send Media
    builder.addCase(sendMedia.pending, (state) => {
      state.sendingMessage = true;
      state.error = null;
    });
    builder.addCase(sendMedia.fulfilled, (state, action) => {
      state.messages.push(action.payload);
      state.sendingMessage = false;
    });
    builder.addCase(sendMedia.rejected, (state, action) => {
      state.sendingMessage = false;
      state.error = action.payload as string;
    });

    // Mark as Read
    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const chatIndex = state.chats.findIndex((c) => c.chatId === action.payload.chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].unreadCount = 0;
      }
      state.messages = state.messages.map((msg) =>
        msg.chatId === action.payload.chatId && msg.direction === 'incoming'
          ? { ...msg, status: 'read' }
          : msg
      );
    });

    // Delete Message
    builder.addCase(deleteMessage.fulfilled, (state, action) => {
      state.messages = state.messages.filter((m) => m.messageId !== action.payload);
    });

    // Toggle Star
    builder.addCase(toggleStar.fulfilled, (state, action) => {
      const messageIndex = state.messages.findIndex((m) => m.messageId === action.payload.messageId);
      if (messageIndex !== -1) {
        state.messages[messageIndex].isStarred = action.payload.isStarred;
      }
    });

    // Search Messages
    builder.addCase(searchMessages.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(searchMessages.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(searchMessages.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setSelectedSession,
  setSelectedChat,
  addMessage,
  updateMessageStatus,
  setTyping,
  clearError,
  resetChat,
} = chatSlice.actions;

export default chatSlice.reducer;