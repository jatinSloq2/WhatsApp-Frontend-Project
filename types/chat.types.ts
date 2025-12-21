// src/types/chat.types.ts

export interface Message {
  messageId: string;
  chatId: string;
  sessionId: string;
  from: string;
  to: string;
  direction: 'incoming' | 'outgoing';
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  content: {
    text?: string;
    caption?: string;
    mediaUrl?: string;
  };
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  isStarred: boolean;
  isDeleted: boolean;
  metadata?: {
    pushName?: string;
    fromMe: boolean;
    hasMedia: boolean;
    quotedMessageId?: string;
  };
}

export interface Chat {
  chatId: string;
  sessionId: string;
  name: string;
  phoneNumber: string;
  profilePicture?: string;
  isGroup: boolean;
  lastMessage?: {
    content: string;
    timestamp: Date;
    messageId: string;
    type: string;
  };
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  chats: Chat[];
  messages: Message[];
  selectedChat: string | null;
  selectedSession: string | null;
  loading: boolean;
  error: string | null;
  messagesLoading: boolean;
  chatsLoading: boolean;
  sendingMessage: boolean;
  typingUsers: Record<string, boolean>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface SendMessagePayload {
  sessionId: string;
  to: string;
  message: string;
  quotedMessageId?: string;
}

export interface SendMediaPayload {
  sessionId: string;
  to: string;
  file: File;
  mediaType: 'image' | 'video' | 'audio' | 'document';
  caption?: string;
}

export interface LoadMessagesPayload {
  sessionId: string;
  chatId: string;
  page?: number;
  limit?: number;
}

export interface SearchMessagesPayload {
  sessionId: string;
  query: string;
}