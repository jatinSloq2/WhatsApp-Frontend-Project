// ============================================
// FILE: src/components/chat/MessageList.tsx
// ============================================

import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, Download } from 'lucide-react';
import { Message } from '@/types/chat.types';

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
}

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5]">
      {messages.map((message) => (
        <div
          key={message.messageId}
          className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`
              max-w-md px-4 py-2 rounded-lg shadow
              ${message.direction === 'outgoing' ? 'bg-green-100' : 'bg-white'}
            `}
          >
            {/* Sender name for incoming messages */}
            {message.direction === 'incoming' && message.metadata?.pushName && (
              <p className="text-xs font-semibold text-green-600 mb-1">
                {message.metadata.pushName}
              </p>
            )}

            {/* Message content */}
            {message.type === 'text' && (
              <p className="text-gray-800 whitespace-pre-wrap break-words">
                {message.content.text}
              </p>
            )}

            {message.type === 'image' && (
              <div>
                {message.content.mediaUrl ? (
                  <img
                    src={message.content.mediaUrl}
                    alt="Media"
                    className="w-64 h-48 object-cover rounded mb-2"
                  />
                ) : (
                  <div className="w-64 h-48 bg-gray-200 rounded mb-2 flex items-center justify-center">
                    📷 Image
                  </div>
                )}
                {message.content.caption && (
                  <p className="text-gray-800">{message.content.caption}</p>
                )}
              </div>
            )}

            {message.type === 'document' && (
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                <Download size={20} />
                <span>Document</span>
              </div>
            )}

            {/* Timestamp and status */}
            <div className="flex items-center justify-end space-x-1 mt-1">
              <span className="text-xs text-gray-500">
                {format(new Date(message.timestamp), 'HH:mm')}
              </span>

              {message.direction === 'outgoing' && (
                <span className="text-gray-500">
                  {message.status === 'sent' && <Check size={14} />}
                  {message.status === 'delivered' && <CheckCheck size={14} />}
                  {message.status === 'read' && (
                    <CheckCheck size={14} className="text-blue-500" />
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
