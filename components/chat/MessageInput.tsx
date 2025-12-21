// ============================================
// FILE: src/components/chat/MessageInput.tsx
// ============================================

import { useState, useRef } from 'react';
import { Send, Paperclip, Smile, Mic } from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string, type?: 'text' | 'media', file?: File) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, onTyping, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout>();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    // Typing indicator
    onTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => onTyping(false), 1000);
  };

  const handleSend = async () => {
    if (!message.trim() || disabled) return;

    try {
      await onSend(message.trim());
      setMessage('');
      onTyping(false);
    } catch (error) {
      console.error('Failed to send:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || disabled) return;

    try {
      await onSend('', 'media', file);
    } catch (error) {
      console.error('Failed to send file:', error);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <div className="flex items-center space-x-2">
        {/* Emoji button */}
        <button className="p-2 hover:bg-gray-100 rounded-full" disabled={disabled}>
          <Smile size={24} className="text-gray-600" />
        </button>

        {/* Attach button */}
        <button
          className="p-2 hover:bg-gray-100 rounded-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip size={24} className="text-gray-600" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,video/*,application/pdf"
        />

        {/* Message input */}
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={disabled}
        />

        {/* Send/Voice button */}
        {message.trim() ? (
          <button
            onClick={handleSend}
            disabled={disabled}
            className="p-2 bg-green-500 hover:bg-green-600 rounded-full text-white disabled:opacity-50"
          >
            <Send size={24} />
          </button>
        ) : (
          <button className="p-2 hover:bg-gray-100 rounded-full" disabled={disabled}>
            <Mic size={24} className="text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
}