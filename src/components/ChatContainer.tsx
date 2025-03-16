import React, { useState, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import WelcomeScreen from './WelcomeScreen';
import SettingsPortal from './SettingsPortal';
import { Message } from '../types';
import type { Model } from '../types/index';
import { createMessage } from '../utils/helpers';
import { createChatCompletion, getModels } from '../utils/api-client';
import { APP_CONFIG } from '../utils/config';
import { ImageData } from '../utils/image-processing';
import { trackMessageSent, trackModelChanged } from '../utils/analytics';

const LOCAL_STORAGE_MODEL_KEY = 'next-lm-chat-selected-model';
const LOCAL_STORAGE_MAX_TOKENS_KEY = 'next-lm-chat-max-tokens';
const LOCAL_STORAGE_SYSTEM_MESSAGE_ENABLED_KEY = 'next-lm-chat-system-message-enabled';
const LOCAL_STORAGE_SYSTEM_MESSAGE_CONTENT_KEY = 'next-lm-chat-system-message-content';
const DEFAULT_MAX_TOKENS = 4096;

const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(APP_CONFIG.defaultModel);
  const [maxTokens, setMaxTokens] = useState<number>(DEFAULT_MAX_TOKENS);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingModels, setLoadingModels] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [systemMessageEnabled, setSystemMessageEnabled] = useState<boolean>(false);
  const [systemMessageContent, setSystemMessageContent] = useState<string>('');

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoadingModels(true);
        const modelData = await getModels();
        setModels(modelData);

        // Get the saved model from localStorage if it exists
        const savedModelId = localStorage.getItem(LOCAL_STORAGE_MODEL_KEY);

        // Set the model based on priority:
        // 1. Saved model (if it exists in available models)
        // 2. Default model (if it exists in available models)
        // 3. First available model
        // 4. Keep existing selectedModel if none of the above apply

        if (savedModelId && modelData.some(model => model.id === savedModelId)) {
          setSelectedModel(savedModelId);
        } else if (modelData.some(model => model.id === APP_CONFIG.defaultModel)) {
          setSelectedModel(APP_CONFIG.defaultModel);
        } else if (modelData.length > 0) {
          setSelectedModel(modelData[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch models:', err);
        setError('Failed to load models. Please try again later.');
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, []);

  // Load saved max tokens and system message settings on mount
  useEffect(() => {
    const savedMaxTokens = localStorage.getItem(LOCAL_STORAGE_MAX_TOKENS_KEY);
    if (savedMaxTokens) {
      const parsedValue = parseInt(savedMaxTokens, 10);
      if (!isNaN(parsedValue)) {
        setMaxTokens(parsedValue);
      }
    }

    const savedSystemMessageEnabled = localStorage.getItem(
      LOCAL_STORAGE_SYSTEM_MESSAGE_ENABLED_KEY
    );
    if (savedSystemMessageEnabled) {
      setSystemMessageEnabled(savedSystemMessageEnabled === 'true');
    }

    const savedSystemMessageContent = localStorage.getItem(
      LOCAL_STORAGE_SYSTEM_MESSAGE_CONTENT_KEY
    );
    if (savedSystemMessageContent) {
      setSystemMessageContent(savedSystemMessageContent);
    }
  }, []);

  // When messages change, update welcome screen visibility
  useEffect(() => {
    setShowWelcome(messages.length === 0);
  }, [messages]);

  const handleSendMessage = async (content: string, images?: ImageData[]) => {
    try {
      setError(null);
      setLoading(true);

      // Track message sent
      trackMessageSent(selectedModel, !!images);

      // Create and add user message
      const userMessage = createMessage('user', content, images);
      setMessages(prevMessages => [...prevMessages, userMessage]);

      // Reset any previous streaming state
      setIsStreaming(false);

      try {
        // Prepare messages for API
        const messagesToSend = messages.concat(userMessage).map(({ role, content, images }) => ({
          role,
          content,
          images,
        }));

        // Add system message if enabled
        if (systemMessageEnabled && systemMessageContent.trim()) {
          messagesToSend.unshift({
            role: 'system',
            content: systemMessageContent.trim(),
            images: undefined,
          });
        }

        // Send request to API with streaming enabled
        const response = await createChatCompletion({
          model: selectedModel,
          messages: messagesToSend as Message[],
          stream: true,
          max_tokens: maxTokens,
        });

        // Handle streaming response
        if (response instanceof Response) {
          try {
            console.log('Processing streaming response...');
            // Set streaming to true now that we're receiving the response
            setIsStreaming(true);

            const reader = response.body?.getReader();
            if (!reader) throw new Error('Stream reader not available');

            let fullContent = '';
            let isInThinkingMode = false; // State variable to track thinking mode
            let assistantMessageCreated = false; // Flag to track if we've created the assistant message

            // Create a text decoder to parse the stream
            const decoder = new TextDecoder();
            let buffer = ''; // Buffer for incomplete lines

            // Process the stream
            while (true) {
              try {
                const { done, value } = await reader.read();
                if (done) {
                  console.log('Stream complete');
                  break;
                }

                // Decode the chunk and add to buffer
                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                // Split the buffer by double newlines which separate SSE messages
                const parts = buffer.split('\n\n');

                // Keep the last part in the buffer if it's incomplete (doesn't end with \n\n)
                buffer = parts.pop() || '';

                // Process each complete SSE message
                for (const part of parts) {
                  if (part.trim() === '') continue;

                  // Each SSE message should start with "data: "
                  if (part.startsWith('data: ')) {
                    let data = part.slice(6); // Remove outer "data: " prefix

                    // Handle the double-wrapped format: data: "data: {payload}\n\n"
                    if (data.startsWith('"data: ') && data.endsWith('"')) {
                      // Remove the quotes and extract the inner data
                      data = data.slice(1, -1); // Remove surrounding quotes

                      // Now we have "data: {payload}\n\n"
                      if (data.startsWith('data: ')) {
                        data = data.slice(6); // Remove inner "data: " prefix
                      }

                      // Remove any trailing newlines that got included
                      data = data.replace(/\\n\\n$/, '');
                    }

                    // Check for [DONE] message
                    if (data === '[DONE]') {
                      console.log('Received [DONE] message');
                      continue;
                    }

                    try {
                      // Log the raw data before any processing
                      console.debug('Raw data before processing:', data);

                      // Add more robust error handling for escaped characters
                      try {
                        // The data is a JSON string with escaped quotes, need to parse it
                        // First handle the problematic escaped newlines - this is the key fix
                        // The pattern \\\n in the JSON string is causing problems
                        data = data
                          .replace(/\\\\n/g, '\\n') // Fix doubly escaped newlines
                          .replace(/\\"/g, '"') // Handle escaped quotes
                          .replace(/\\\\/g, '\\'); // Handle escaped backslashes

                        // Log after character replacement
                        console.debug('Data after character replacement:', data.substring(0, 300));
                      } catch (escapeError) {
                        console.error('Error during character unescaping:', escapeError);
                        // Continue with original data if unescaping fails
                      }

                      let parsedData;
                      try {
                        // First try parsing directly
                        parsedData = JSON.parse(data);
                      } catch (jsonError) {
                        // Log detailed information about the JSON parsing error
                        console.error('JSON parse error:', jsonError);
                        console.error('Error position:', (jsonError as SyntaxError).message);
                        console.error('Data causing error:', data);

                        // Try an alternative parsing approach
                        try {
                          // Try removing all remaining escape sequences and parse again
                          const sanitizedData = data.replace(/\\./g, match => {
                            // Preserve common escape sequences
                            if (match === '\\"') return '"';
                            if (match === '\\n') return '\n';
                            if (match === '\\t') return '\t';
                            if (match === '\\r') return '\r';
                            // Remove other escape sequences
                            return match.charAt(1);
                          });

                          parsedData = JSON.parse(sanitizedData);
                          console.log('Successfully parsed JSON after sanitizing escape sequences');
                        } catch {
                          // If that fails, try a more aggressive approach - JSON.parse with reviver
                          try {
                            // Use a reviver function to handle problematic content
                            parsedData = JSON.parse(data, (key, value) => {
                              // Special handling for content field
                              if (key === 'content' && typeof value === 'string') {
                                // Replace problematic escape sequences in content
                                return value.replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
                              }
                              return value;
                            });
                            console.log('Successfully parsed JSON using reviver function');
                          } catch {
                            // If all else fails, throw the original error
                            throw jsonError;
                          }
                        }
                      }

                      // Log the first few messages to understand the structure
                      if (fullContent === '') {
                        console.log('First chunk received:', parsedData);
                      }

                      // Extract content based on the observed format
                      const content = parsedData.choices?.[0]?.delta?.content || '';

                      // Log every content chunk for debugging
                      console.debug(`Content chunk received: "${content}"`);

                      // Process all content, even empty strings
                      const processedContent = content;

                      // Log both current content and thinking mode
                      console.debug(
                        `Processing chunk: "${content}", isInThinkingMode: ${isInThinkingMode}, fullContent length: ${fullContent.length}`
                      );

                      // Check for thinking tags to track the mode, but don't skip content
                      if (content.includes('<think>')) {
                        // Start of thinking mode
                        isInThinkingMode = true;
                        // Use the same format the Message component expects
                        fullContent += '<think>';
                        console.log('Detected thinking mode, displaying in thinking box');
                      } else if (content.includes('</think>')) {
                        // End of thinking mode
                        isInThinkingMode = false;
                        fullContent += '</think>';
                        console.log('End of thinking detected');
                      } else {
                        // Regular content
                        fullContent += processedContent;
                      }

                      // Create assistant message when first meaningful content arrives
                      if (!assistantMessageCreated && content.trim() !== '') {
                        setLoading(false); // Turn off loading indicator
                        const assistantMessage = createMessage('assistant', fullContent);
                        setMessages(prevMessages => [...prevMessages, assistantMessage]);
                        assistantMessageCreated = true;
                      } else if (assistantMessageCreated) {
                        // Update existing message with current content
                        setMessages(prevMessages => {
                          const updatedMessages = [...prevMessages];
                          const lastMessageIndex = updatedMessages.length - 1;

                          if (
                            lastMessageIndex >= 0 &&
                            updatedMessages[lastMessageIndex].role === 'assistant'
                          ) {
                            updatedMessages[lastMessageIndex] = {
                              ...updatedMessages[lastMessageIndex],
                              content: fullContent,
                            };
                          }

                          return updatedMessages;
                        });
                      }
                    } catch (err) {
                      console.error(
                        'Error parsing SSE data:',
                        err,
                        'Raw data:',
                        data.substring(0, 300)
                      );
                    }
                  }
                }
              } catch (streamErr) {
                console.error('Error reading stream:', streamErr);
                break;
              }
            }

            // When streaming is complete, set streaming state back to false
            setIsStreaming(false);

            // Ensure loading is turned off when stream ends
            setLoading(false);
          } catch (streamHandlingErr) {
            console.error('Failed to process stream:', streamHandlingErr);
            setLoading(false); // Ensure loading is turned off on error
            setIsStreaming(false); // Ensure streaming is turned off on error

            // Fallback to treating the response as JSON
            try {
              const jsonData = await response.json();
              const content = jsonData.choices?.[0]?.message?.content || '';

              if (content) {
                // Turn off loading state
                setLoading(false);

                // Create a new assistant message with the content
                const assistantMessage = createMessage('assistant', content);
                setMessages(prevMessages => [...prevMessages, assistantMessage]);
              } else {
                setLoading(false);
                setError('Empty response received from API');
              }
            } catch (jsonErr) {
              console.error('Failed to parse response as JSON:', jsonErr);
              setLoading(false);
              setError('Failed to parse stream or JSON response');
            }
          }
        } else {
          // Handle non-streaming response (fallback)
          const assistantMessageContent =
            response.choices[0]?.message?.content || 'No response from the assistant';

          // Turn off loading state
          setLoading(false);

          // Create a new assistant message with the complete response
          const assistantMessage = createMessage('assistant', assistantMessageContent);
          setMessages(prevMessages => [...prevMessages, assistantMessage]);
        }
      } catch (err) {
        console.error('Error sending message:', err);
        setLoading(false);
        setError('Failed to send message. Please try again.');
        setIsStreaming(false);
      }
    } catch (err) {
      console.error('Error in message handling:', err);
      setLoading(false);
      setError('An error occurred while processing your message.');
      setIsStreaming(false);
    }
  };

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    // Track model change
    trackModelChanged(modelId);
  };

  const handleChangeMaxTokens = (value: number) => {
    setMaxTokens(value);
    localStorage.setItem(LOCAL_STORAGE_MAX_TOKENS_KEY, value.toString());
  };

  const handleToggleSystemMessage = (enabled: boolean) => {
    setSystemMessageEnabled(enabled);
    localStorage.setItem(LOCAL_STORAGE_SYSTEM_MESSAGE_ENABLED_KEY, enabled.toString());
  };

  const handleChangeSystemMessageContent = (content: string) => {
    setSystemMessageContent(content);
    localStorage.setItem(LOCAL_STORAGE_SYSTEM_MESSAGE_CONTENT_KEY, content);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full relative">
      {/* Settings Portal renders outside of this component hierarchy */}
      <SettingsPortal
        models={models}
        selectedModel={selectedModel}
        onSelectModel={handleSelectModel}
        maxTokens={maxTokens}
        onChangeMaxTokens={handleChangeMaxTokens}
        systemMessageEnabled={systemMessageEnabled}
        onToggleSystemMessage={handleToggleSystemMessage}
        systemMessageContent={systemMessageContent}
        onChangeSystemMessageContent={handleChangeSystemMessageContent}
        disabled={loading || isStreaming}
        isLoading={loadingModels}
      />

      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="flex-grow flex flex-col overflow-hidden w-full pb-24">
        {showWelcome ? (
          <WelcomeScreen onStartChat={handleSendMessage} />
        ) : (
          <div className="w-full max-w-4xl mx-auto flex-grow">
            <MessageList messages={messages} loading={loading} />
          </div>
        )}
      </div>

      <div className="fixed left-0 right-0 bottom-0 flex justify-center pointer-events-none px-2 pb-4 bg-gradient-to-t from-[rgba(0,0,0,0.1)] to-transparent dark:from-[rgba(0,0,0,0.2)]">
        <div className="max-w-3xl w-full px-2 sm:px-4 pointer-events-auto">
          <MessageInput onSendMessage={handleSendMessage} disabled={loading} />
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
