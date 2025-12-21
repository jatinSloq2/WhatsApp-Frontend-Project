// ============================================
// FILE: src/components/chat/ChatHeader.tsx
// ============================================

import { Phone, Video, Search, MoreVertical } from 'lucide-react';
import { Chat } from '@/types/chat.types';

interface ChatHeaderProps {
  chat?: Chat;
  isTyping: boolean;
}

export default function ChatHeader({ chat, isTyping }: ChatHeaderProps) {
  if (!chat) return null;

  return (
    <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        {chat.profilePicture ? (
          <img src={chat.profilePicture} alt={chat.name} className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
            {chat.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Info */}
        <div>
          <h3 className="font-semibold text-gray-900">{chat.name}</h3>
          <p className="text-xs text-gray-500">{isTyping ? 'typing...' : chat.phoneNumber}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Search size={20} className="text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Phone size={20} className="text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <Video size={20} className="text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <MoreVertical size={20} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}