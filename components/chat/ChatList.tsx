// src/components/chat/ChatList.tsx

import { formatDistanceToNow } from 'date-fns';
import { Chat } from '@/types/chat.types';

interface ChatListProps {
  chats: Chat[];
  selectedChat: string | null;
  onSelectChat: (chatId: string) => void;
}

export default function ChatList({ chats, selectedChat, onSelectChat }: ChatListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {chats.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>No conversations yet</p>
          <p className="text-sm mt-2">Send a message to start chatting</p>
        </div>
      ) : (
        chats.map((chat) => (
          <div
            key={chat.chatId}
            onClick={() => onSelectChat(chat.chatId)}
            className={`
              px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100
              ${selectedChat === chat.chatId ? 'bg-green-50' : ''}
            `}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {chat.profilePicture ? (
                  <img
                    src={chat.profilePicture}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
                    {chat.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{chat.name}</h3>
                  {chat.lastMessage && (
                    <span className="text-xs text-gray-500 ml-2">
                      {formatDistanceToNow(new Date(chat.lastMessage.timestamp), {
                        addSuffix: false,
                      })}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate flex-1">
                    {chat.lastMessage?.content || 'No messages yet'}
                  </p>

                  {chat.unreadCount > 0 && (
                    <span className="ml-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}