import React, { useRef, useEffect } from 'react';
import { Message as MessageType } from '../types';
import Message from './Message';

interface MessageListProps {
  messages: MessageType[];
  loading?: boolean;
  isStreaming?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading = false,
  isStreaming = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      const scrollBehavior = messages.length <= 1 ? 'auto' : 'smooth';
      messagesEndRef.current.scrollIntoView({ behavior: scrollBehavior });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto h-full">
      <div className="space-y-2 px-4 py-6 pb-60 w-full">
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-24 opacity-50 text-gray-500 dark:text-gray-400 w-full mb-3">
            <div className="message-bubble ai-message py-3 px-4 w-full max-w-3xl mx-auto bg-white dark:bg-[#1e1e29] dark:border dark:border-[#2a2a35] shadow-md dark:shadow-lg">
              <p className="text-center dark:text-gray-300">Your conversation will appear here</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            // Check if this is the last message and streaming is active
            const isLastMessageStreaming = isStreaming && index === messages.length - 1;

            return (
              <Message key={message.id} message={message} isStreaming={isLastMessageStreaming} />
            );
          })
        )}

        {loading && (
          <div className="flex justify-start mb-4">
            <div className="message-bubble ai-message py-3 px-4 flex items-center space-x-3 bg-white dark:bg-[#1e1e29] dark:border dark:border-[#2a2a35] shadow-md dark:shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[var(--purple-medium)] dark:bg-[#10b981] opacity-70 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-[var(--purple-medium)] dark:bg-[#10b981] opacity-70 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-[var(--purple-medium)] dark:bg-[#10b981] opacity-70 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
};

export default MessageList;
