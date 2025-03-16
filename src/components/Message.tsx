'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { Message as MessageType } from '../types';
import { FiChevronDown } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { ImageData } from '../utils/image-processing';
import Image from 'next/image';

interface MessageProps {
  message: MessageType;
}

// Function to make emojis display as inline elements
const processEmojis = (text: string): ReactNode[] => {
  // Basic emoji regex (this is a simplified version)
  const emojiRegex = /(\p{Emoji})/gu;

  if (!emojiRegex.test(text)) {
    return [<span key="text">{text}</span>];
  }

  const parts = text.split(emojiRegex);

  return parts.map((part, index) => {
    if (emojiRegex.test(part)) {
      return (
        <span key={index} className="emoji">
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

// Display text with markdown formatting
const TypewriterText: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div
      className="whitespace-pre-wrap leading-normal markdown-content"
      style={{ color: 'inherit' }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {text}
      </ReactMarkdown>
    </div>
  );
};

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const thinkingRef = useRef<HTMLDivElement>(null);

  // Check if thinking is complete (has both opening and closing think tags)
  const isThinkingComplete =
    message.content.includes('<think>') && message.content.includes('</think>');

  // Auto-collapse thinking when it's complete
  useEffect(() => {
    if (isThinkingComplete) {
      setIsThinkingExpanded(false);
    } else if (message.content.includes('<think>')) {
      // If thinking has started but not completed, keep it expanded
      setIsThinkingExpanded(true);
    }
  }, [message.content, isThinkingComplete]);

  useEffect(() => {
    // Auto-scroll to the bottom of the thinking content when expanded
    if (isThinkingExpanded && thinkingRef.current) {
      thinkingRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isThinkingExpanded]);

  const renderMessageContent = () => {
    const mainContent = (
      <>
        <div
          className={`whitespace-pre-wrap ${isUser ? 'user-message-content' : 'markdown-content'}`}
        >
          {isUser ? processEmojis(message.content) : <TypewriterText text={message.content} />}
        </div>

        {message.images && message.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {message.images.map((img, index) => (
              <div
                key={index}
                className="relative cursor-pointer rounded-lg overflow-hidden"
                onClick={() => setSelectedImage(img)}
              >
                <Image
                  src={img.data}
                  alt={`Image ${index + 1}`}
                  className="w-full h-auto object-cover"
                  width={img.metadata.normalizedSize.width}
                  height={img.metadata.normalizedSize.height}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                  {`${img.metadata.normalizedSize.width}x${img.metadata.normalizedSize.height}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );

    if (!message.content.includes('<think>') || isUser) {
      return mainContent;
    }

    // Extract thinking content and the rest of the message
    const thinkingMatch = message.content.match(/<think>([\s\S]*?)<\/think>([\s\S]*)/);

    if (!thinkingMatch) {
      // If we have an opening tag but no closing tag yet (thinking in progress)
      const thinkingInProgressMatch = message.content.match(/<think>([\s\S]*)/);

      if (thinkingInProgressMatch) {
        // Show the thinking in progress
        const thinkingContent = thinkingInProgressMatch[1].trim();

        return (
          <div>
            <div className="mb-3">
              <div
                className="thinking-block thinking-in-progress dark:bg-[#1e1e29] dark:border-gray-700"
                onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                aria-expanded={isThinkingExpanded}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setIsThinkingExpanded(!isThinkingExpanded);
                  }
                }}
              >
                <span className="text-gray-900 dark:text-white flex items-center">
                  AI is thinking
                </span>
                <FiChevronDown
                  className={`transition-transform duration-300 ${isThinkingExpanded ? 'rotate-180' : ''} text-gray-600 dark:text-gray-100`}
                  size={16}
                />
              </div>

              <div
                className={`thinking-content ${isThinkingExpanded ? 'expanded' : ''}`}
                ref={thinkingRef}
              >
                <div className="thinking-box bg-gray-50 border border-gray-200 text-gray-900 dark:bg-[#181820] dark:text-gray-300 dark:border-[#2a2a35]">
                  {thinkingContent}
                </div>
              </div>
            </div>

            {/* Partial response, which might be empty while thinking is in progress */}
            <TypewriterText text="" />
          </div>
        );
      }

      return <TypewriterText text={message.content} />;
    }

    // If we have complete thinking content and a response
    const thinkingContent = thinkingMatch[1].trim();
    const responseContent = thinkingMatch[2].trim();

    return (
      <div>
        <div className="mb-3">
          <div
            className="thinking-block thinking-completed dark:bg-[#1e1e29] dark:border-gray-700"
            onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
            aria-expanded={isThinkingExpanded}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                setIsThinkingExpanded(!isThinkingExpanded);
              }
            }}
          >
            <span className="text-gray-900 dark:text-white font-semibold flex items-center">
              View AI&apos;s thinking
            </span>
            <FiChevronDown
              className={`transition-transform duration-300 ${isThinkingExpanded ? 'rotate-180' : ''} text-gray-600 dark:text-gray-100`}
              size={16}
            />
          </div>

          <div
            className={`thinking-content ${isThinkingExpanded ? 'expanded' : ''}`}
            ref={thinkingRef}
          >
            <div className="thinking-box bg-gray-50 border border-gray-200 text-gray-900 dark:bg-[#181820] dark:text-gray-300 dark:border-[#2a2a35]">
              {thinkingContent}
            </div>
          </div>
        </div>

        {/* The actual response */}
        <TypewriterText text={responseContent} />
      </div>
    );
  };

  return (
    <>
      <div className={`message-bubble ${isUser ? 'user-message' : 'ai-message'}`}>
        {renderMessageContent()}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-[90vh] p-4">
            <Image
              src={selectedImage.data}
              alt="Full size"
              className="max-w-full max-h-[80vh] object-contain"
              width={selectedImage.metadata.originalSize.width}
              height={selectedImage.metadata.originalSize.height}
            />
            <div className="text-white text-center mt-4">
              Original: {selectedImage.metadata.originalSize.width}x
              {selectedImage.metadata.originalSize.height}
              <br />
              Normalized: {selectedImage.metadata.normalizedSize.width}x
              {selectedImage.metadata.normalizedSize.height}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Message;
