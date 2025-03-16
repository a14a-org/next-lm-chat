import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Message as MessageType } from '../types';
import Message from './Message';

// Custom hook for debounced function with specific type for our use case
function useDebounce(fn: (value: boolean) => void, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFn = useCallback(
    (value: boolean) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        fn(value);
      }, delay);
    },
    [fn, delay]
  );

  // Add a method to cancel pending debounced calls
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { debouncedFn, cancel };
}

interface MessageListProps {
  messages: MessageType[];
  loading?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, loading = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [newContentAvailable, setNewContentAvailable] = useState(false);
  const [newContentSeen, setNewContentSeen] = useState(true);
  const lastMessagesLengthRef = useRef(messages.length);
  const lastContentLengthRef = useRef(messages[messages.length - 1]?.content.length || 0);
  const lastScrollPositionRef = useRef(0);
  const userScrolledManuallyRef = useRef(false);
  const previousMessagesRef = useRef<MessageType[]>(messages);
  const isProgrammaticScrollRef = useRef(false);

  // Create debounced version of setNewContentAvailable
  const { debouncedFn: debouncedSetNewContent, cancel: cancelDebouncedSetNewContent } = useDebounce(
    (value: boolean) => {
      setNewContentAvailable(value);
    },
    1250 // 250ms debounce delay
  );

  // Function to handle user-initiated actions - cancels any pending debounced updates
  const handleUserInitiatedContentUpdate = useCallback(
    (value: boolean) => {
      // Cancel any pending debounced updates
      cancelDebouncedSetNewContent();
      // Apply update immediately
      setNewContentAvailable(value);
    },
    [cancelDebouncedSetNewContent]
  );

  // Explicitly track when programmatic scrolls happen
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (!messagesEndRef.current) return;

    // Set flag to indicate this is a programmatic scroll
    isProgrammaticScrollRef.current = true;

    // Perform the scroll
    messagesEndRef.current.scrollIntoView({ behavior });

    // Reset the flag after scroll animation would be complete
    setTimeout(
      () => {
        isProgrammaticScrollRef.current = false;
      },
      behavior === 'smooth' ? 500 : 50
    );
  }, []);

  // Direct user interaction detection - wheel event
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Mouse wheel listener - definite user action
    const handleWheel = () => {
      setAutoScrollEnabled(false);
    };

    // Touch move listener - definite user action on mobile
    const handleTouchMove = () => {
      setAutoScrollEnabled(false);
    };

    // Add direct input event listeners
    container.addEventListener('wheel', handleWheel, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Track scroll events from user interaction
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    // Get current scroll position
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;

    // Check if user is at the bottom of the scroll container
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 30;

    // Detect if this is a manual scroll by checking if our programmatic flag is not set
    const isUserInitiatedScroll =
      !isProgrammaticScrollRef.current && scrollTop !== lastScrollPositionRef.current;

    if (isUserInitiatedScroll) {
      userScrolledManuallyRef.current = true;

      if (isAtBottom) {
        // User manually scrolled to bottom, re-enable auto-scroll
        setAutoScrollEnabled(true);
        // Direct update for user action
        handleUserInitiatedContentUpdate(false);
      } else {
        // User scrolled somewhere else, disable auto-scroll
        setAutoScrollEnabled(false);
      }
    }

    // Update last scroll position
    lastScrollPositionRef.current = scrollTop;
  }, [autoScrollEnabled, handleUserInitiatedContentUpdate]);

  // Check if a new user message was added
  useEffect(() => {
    // If messages array length increased and the last message is from user
    if (messages.length > previousMessagesRef.current.length) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage && latestMessage.role === 'user') {
        // Re-enable auto-scrolling when user sends a new message
        setAutoScrollEnabled(true);
        // Direct update for user action
        handleUserInitiatedContentUpdate(false);
        // Reset content seen state when user sends a message
        setNewContentSeen(false);
      }
    }

    // Update previous messages reference
    previousMessagesRef.current = messages;
  }, [messages, handleUserInitiatedContentUpdate]);

  // Check if new content is available in the latest message
  useEffect(() => {
    // Only check for new content if we're not auto-scrolling
    if (!autoScrollEnabled && messages.length > 0) {
      const currentLastMessage = messages[messages.length - 1];

      // If the message array length changed or the content length increased
      if (
        messages.length !== lastMessagesLengthRef.current ||
        (currentLastMessage && currentLastMessage.content.length > lastContentLengthRef.current)
      ) {
        // Use debounced update for streaming content detection
        debouncedSetNewContent(true);
      }
    }

    // Update refs with current values
    lastMessagesLengthRef.current = messages.length;
    lastContentLengthRef.current = messages[messages.length - 1]?.content.length || 0;
  }, [messages, autoScrollEnabled, debouncedSetNewContent]);

  // Handle scrolling when messages change
  useEffect(() => {
    // Only scroll if auto-scroll is enabled
    if (messagesEndRef.current && autoScrollEnabled) {
      // Use our scroll function that tracks programmatic scrolls
      const scrollBehavior = messages.length <= 1 ? 'auto' : 'smooth';
      scrollToBottom(scrollBehavior);
      // Use debounced update for automatic content hiding
      debouncedSetNewContent(false);
    } else if (messages.length > 0 && !autoScrollEnabled) {
      // If we're not auto-scrolling but there's new content
      // Use debounced update for content detection during streaming
      debouncedSetNewContent(true);
    }
  }, [messages, autoScrollEnabled, scrollToBottom, debouncedSetNewContent]);

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto h-full relative"
      onScroll={handleScroll}
    >
      <div className="space-y-2 px-4 py-6 pb-60 w-full">
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-24 opacity-50 text-gray-500 dark:text-gray-400 w-full mb-3">
            <div className="message-bubble ai-message py-3 px-4 w-full max-w-3xl mx-auto bg-white dark:bg-[#1e1e29] dark:border dark:border-[#2a2a35] shadow-md dark:shadow-lg">
              <p className="text-center dark:text-gray-300">Your conversation will appear here</p>
            </div>
          </div>
        ) : (
          messages.map(message => {
            return <Message key={message.id} message={message} />;
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

      {/* New content indicator */}
      {newContentAvailable && !newContentSeen && (
        <div
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-[var(--purple-medium)] dark:bg-[#10b981] text-white px-4 py-2 rounded-full shadow-md cursor-pointer z-10 flex items-center space-x-1 animate-fade-in"
          onClick={() => {
            setAutoScrollEnabled(true);
            // Direct update for user action
            handleUserInitiatedContentUpdate(false);
            scrollToBottom('smooth');
            // Mark new content as seen
            setNewContentSeen(true);
          }}
        >
          <span>New content</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      )}

      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
};

export default MessageList;
