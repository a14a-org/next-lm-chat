import axios from 'axios';
import { ChatCompletionRequest, CompletionRequest, EmbeddingRequest, Model } from '../types';
import { stripThinkTags } from './helpers';

// Create axios instance with base URL pointing to our Next.js API routes
const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get available models
 */
export const getModels = async (): Promise<Model[]> => {
  try {
    const response = await apiClient.get('/models');
    console.log('API Models Response:', response.data);

    // Ensure we're getting proper model data structure
    const modelData = response.data.data || [];

    // Validate model data structure
    if (Array.isArray(modelData)) {
      // Check if each model has id and name properties
      const validatedModels = modelData.map(model => {
        // Ensure model has required properties
        if (!model.name) {
          console.warn('Model missing name property:', model);
          return {
            ...model,
            name: model.id || 'Unknown Model',
          };
        }
        return model;
      });

      console.log('Validated models:', validatedModels);
      return validatedModels;
    } else {
      console.error('Invalid model data format:', modelData);
      return [];
    }
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
};

/**
 * Create a chat completion
 */
export const createChatCompletion = async (request: ChatCompletionRequest) => {
  try {
    // Process each assistant message to remove <think> tags before sending to API
    const processedMessages = request.messages.map(message => {
      if (message.role === 'assistant') {
        return {
          ...message,
          content: stripThinkTags(message.content),
        };
      }
      return message;
    });

    // Create a new request object with processed messages
    const processedRequest = {
      ...request,
      messages: processedMessages,
    };

    // Handle streaming response
    if (request.stream) {
      // Use fetch instead of axios for streaming
      const response = await fetch('/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(processedRequest),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return response;
    }

    // Regular (non-streaming) response with axios
    const response = await apiClient.post('/chat/completions', processedRequest);
    return response.data;
  } catch (error) {
    console.error('Error creating chat completion:', error);
    throw error;
  }
};

/**
 * Create a text completion
 */
export const createCompletion = async (request: CompletionRequest) => {
  try {
    const response = await apiClient.post('/completions', request);
    return response.data;
  } catch (error) {
    console.error('Error creating completion:', error);
    throw error;
  }
};

/**
 * Create embeddings
 */
export const createEmbedding = async (request: EmbeddingRequest) => {
  try {
    const response = await apiClient.post('/embeddings', request);
    return response.data;
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw error;
  }
};
