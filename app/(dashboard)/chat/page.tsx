// src/app/(dashboard)/chat/page.tsx

'use client';

import ChatHeader from '@/components/chat/ChatHeader';
import ChatList from '@/components/chat/ChatList';
import MessageInput from '@/components/chat/MessageInput';
import MessageList from '@/components/chat/MessageList';
import { useAppDispatch, useAppSelector } from '@/store/store';
import {
    addMessage,
    loadChats,
    loadMessages,
    markAsRead,
    sendMedia,
    sendMessage,
    setSelectedChat,
    setSelectedSession,
    setTyping,
    updateMessageStatus,
} from '@/store/slices/chatSlice';
import { MoreVertical, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export default function ChatPage() {
  const dispatch = useAppDispatch();
  
  // Redux state
  const {
    chats,
    messages,
    selectedChat,
    selectedSession,
    chatsLoading,
    messagesLoading,
    sendingMessage,
    typingUsers,
  } = useAppSelector((state) => state.chat);

  // Assuming you have a sessions store or get it from somewhere
  const sessions = useAppSelector((state) => state.session?.sessions || []);
  const user = useAppSelector((state) => state.auth?.user);

  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: {
        token: localStorage.getItem('accessToken'),
      },
    });

    newSocket.on('connect', () => {
      console.log('Connected to message service');
    });

    newSocket.on('message_received', (data) => {
      console.log('New message:', data);
      dispatch(addMessage(data.message));
    });

    newSocket.on('message_status', (data) => {
      console.log('Message status updated:', data);
      dispatch(updateMessageStatus({
        messageId: data.messageId,
        status: data.status,
      }));
    });

    newSocket.on('user_typing', ({ chatId, isTyping }) => {
      dispatch(setTyping({ chatId, isTyping }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, dispatch]);

  // Join session room when session changes
  useEffect(() => {
    if (socket && selectedSession) {
      socket.emit('join_session', { sessionId: selectedSession });
      dispatch(loadChats(selectedSession));
    }
  }, [socket, selectedSession, dispatch]);

  // Join chat room and load messages when chat changes
  useEffect(() => {
    if (socket && selectedSession && selectedChat) {
      socket.emit('join_chat', {
        sessionId: selectedSession,
        chatId: selectedChat,
      });
      dispatch(loadMessages({ sessionId: selectedSession, chatId: selectedChat }));
      dispatch(markAsRead({ sessionId: selectedSession, chatId: selectedChat }));
    }
  }, [socket, selectedSession, selectedChat, dispatch]);

  // Set initial session
  useEffect(() => {
    if (sessions.length > 0 && !selectedSession) {
      dispatch(setSelectedSession(sessions[0].sessionId));
    }
  }, [sessions, selectedSession, dispatch]);

  const handleSendMessage = async (
    content: string,
    type: 'text' | 'media' = 'text',
    file?: File
  ) => {
    if (!selectedChat || !selectedSession) return;

    try {
      if (type === 'text') {
        await dispatch(
          sendMessage({
            sessionId: selectedSession,
            to: selectedChat,
            message: content,
          })
        ).unwrap();
      } else if (file) {
        const mediaType = file.type.startsWith('image/')
          ? 'image'
          : file.type.startsWith('video/')
          ? 'video'
          : file.type.startsWith('audio/')
          ? 'audio'
          : 'document';

        await dispatch(
          sendMedia({
            sessionId: selectedSession,
            to: selectedChat,
            file,
            mediaType,
            caption: content || undefined,
          })
        ).unwrap();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (typing: boolean) => {
    if (socket && selectedSession && selectedChat) {
      socket.emit('typing', {
        sessionId: selectedSession,
        chatId: selectedChat,
        isTyping: typing,
      });
    }
  };

  const handleSelectSession = (sessionId: string) => {
    dispatch(setSelectedSession(sessionId));
  };

  const handleSelectChat = (chatId: string) => {
    dispatch(setSelectedChat(chatId));
  };

  const currentChat = chats.find((c) => c.chatId === selectedChat);
  const isTyping = selectedChat ? typingUsers[selectedChat] || false : false;

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar - Chat List */}
      <div className="w-96 border-r border-gray-200 bg-white flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Messages</h2>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <MoreVertical size={20} />
            </button>
          </div>

          {/* Session Selector */}
          <select
            value={selectedSession || ''}
            onChange={(e) => handleSelectSession(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select Session</option>
            {sessions.map((session: any) => (
              <option key={session.sessionId} value={session.sessionId}>
                {session.sessionName} ({session.phoneNumber})
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="mt-3 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Chat List */}
        {chatsLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-500">Loading chats...</div>
          </div>
        ) : (
          <ChatList
            chats={chats}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
          />
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <ChatHeader chat={currentChat} isTyping={isTyping} />

            {/* Messages */}
            {messagesLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-gray-500">Loading messages...</div>
              </div>
            ) : (
              <MessageList messages={messages} currentUserId={user?.id} />
            )}

            {/* Message Input */}
            <MessageInput
              onSend={handleSendMessage}
              onTyping={handleTyping}
              disabled={sendingMessage}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">Select a chat to start messaging</p>
              <p className="text-sm">Choose a conversation from the list</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}