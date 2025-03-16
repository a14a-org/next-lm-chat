/**
 * Application configuration
 *
 * This file centralizes all environment variables and configuration
 * to make it easier to manage and maintain.
 */

// API configuration
export const API_CONFIG = {
  // LM Studio API settings
  lmStudio: {
    apiKey: process.env.LM_STUDIO_API_KEY,
    apiUrl: process.env.LM_STUDIO_API_URL || 'https://example.com/v1',
  },
};

// Application settings
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Next LM Chat',
  defaultModel: process.env.NEXT_PUBLIC_DEFAULT_MODEL || 'local-model',
  isDevelopment: process.env.NODE_ENV === 'development',
};

// Validate required configuration
export const validateConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check for required API keys in production
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
    if (!API_CONFIG.lmStudio.apiKey) {
      errors.push('LM_STUDIO_API_KEY is required in production');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

const CONFIG = {
  api: API_CONFIG,
  app: APP_CONFIG,
  validateConfig,
};

export default CONFIG;
