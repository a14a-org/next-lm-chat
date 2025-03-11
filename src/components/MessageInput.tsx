'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiPaperclip, FiArrowUp } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to correctly calculate the new height
      textareaRef.current.style.height = 'auto';
      // Set height based on scrollHeight (content height)
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  // Handle typing indication
  useEffect(() => {
    if (message && !isTyping) {
      setIsTyping(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a new timeout for when typing stops
    if (message) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    } else {
      setIsTyping(false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      setIsTyping(false);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without shift key
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        className={`rounded-3xl shadow-lg transition-all duration-300 p-1 ${
          isFocused ? 'ring-2 ring-[#F39880]' : ''
        }`}
        style={{
          backgroundColor: theme === 'light' ? 'white' : '#1e1e29',
          boxShadow:
            theme === 'light' ? '0 2px 8px rgba(0, 0, 0, 0.05)' : '0 2px 8px rgba(0, 0, 0, 0.3)',
          border: theme === 'light' ? 'none' : '1px solid #2a2a35',
        }}
      >
        <div className="flex items-center">
          {/* File attachment button - disabled for now */}
          <button
            type="button"
            className="p-3 opacity-50 cursor-not-allowed"
            style={{ color: theme === 'light' ? '#9ca3af' : '#6b7280' }}
            disabled
            aria-label="Attach file (not available)"
          >
            <FiPaperclip className="w-5 h-5" />
          </button>

          {/* Message input */}
          <div className="flex-1 relative mx-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask me anything..."
              className={`w-full py-2 px-3 focus:outline-none resize-none max-h-[150px] bg-transparent ${
                theme === 'light' ? 'placeholder:text-gray-400' : 'placeholder:text-gray-500'
              }`}
              style={{
                color: theme === 'light' ? '#1f2937' : '#e5e7eb',
                caretColor: theme === 'light' ? '#1f2937' : '#e5e7eb',
              }}
              rows={1}
              disabled={disabled}
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            className={`p-2 rounded-full transition-colors duration-300 mr-1 ${
              !message.trim() || disabled ? 'cursor-not-allowed' : ''
            }`}
            style={{
              backgroundColor: message.trim()
                ? '#F39880'
                : theme === 'light'
                  ? '#f3f4f6'
                  : '#252532',
              color: message.trim() ? 'white' : theme === 'light' ? '#9ca3af' : '#6b7280',
            }}
            disabled={!message.trim() || disabled}
            aria-label="Send message"
          >
            <FiArrowUp className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Character limit warning */}
      {message.length > 4000 && (
        <div
          className="absolute bottom-full left-0 mb-2 text-xs text-red-500 rounded px-2 py-1 shadow-sm"
          style={{
            backgroundColor: theme === 'light' ? 'white' : '#1e1e29',
            border: theme === 'light' ? '1px solid #e5e7eb' : '1px solid #2a2a35',
          }}
        >
          Message exceeds 4000 characters limit!
        </div>
      )}
    </div>
  );
};

export default MessageInput;
