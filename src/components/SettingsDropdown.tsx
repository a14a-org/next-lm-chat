import React, { useState, useEffect, useRef } from 'react';
import { FiSettings, FiSun, FiMoon, FiInfo } from 'react-icons/fi';
import ModelSelector from './ModelSelector';
import MaxTokensSelector from './MaxTokensSelector';
import type { Model } from '../types/index';
import { useTheme } from '../context/ThemeContext';
import { trackSettingsOpened, trackSettingsChanged, trackThemeChanged } from '../utils/analytics';

interface SettingsDropdownProps {
  models: Model[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  maxTokens: number;
  onChangeMaxTokens: (value: number) => void;
  systemMessageEnabled: boolean;
  onToggleSystemMessage: (enabled: boolean) => void;
  systemMessageContent: string;
  onChangeSystemMessageContent: (content: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const LOCAL_STORAGE_MAX_TOKENS_KEY = 'next-lm-chat-max-tokens';

const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  models,
  selectedModel,
  onSelectModel,
  maxTokens,
  onChangeMaxTokens,
  systemMessageEnabled,
  onToggleSystemMessage,
  systemMessageContent,
  onChangeSystemMessageContent,
  isLoading = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { theme, toggleTheme } = useTheme();

  // Debug current theme
  useEffect(() => {
    console.log('Current theme in SettingsDropdown:', theme);
  }, [theme]);

  // Log when dropdown is opened
  useEffect(() => {
    if (isOpen) {
      console.log('Settings dropdown opened with theme:', theme);
    }
  }, [isOpen, theme]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load saved max tokens value on mount
  useEffect(() => {
    const savedMaxTokens = localStorage.getItem(LOCAL_STORAGE_MAX_TOKENS_KEY);
    if (savedMaxTokens) {
      const parsedValue = parseInt(savedMaxTokens, 10);
      if (!isNaN(parsedValue)) {
        onChangeMaxTokens(parsedValue);
      }
    }
  }, [onChangeMaxTokens]);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        trackSettingsOpened();
      }
    }
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    toggleTheme();
    trackThemeChanged(newTheme);
  };

  const handleMaxTokensChange = (value: number) => {
    onChangeMaxTokens(value);
    trackSettingsChanged('max_tokens', value);
    localStorage.setItem(LOCAL_STORAGE_MAX_TOKENS_KEY, value.toString());
  };

  const handleToggleSystemMessage = () => {
    onToggleSystemMessage(!systemMessageEnabled);
    trackSettingsChanged('system_message_enabled', !systemMessageEnabled);
  };

  const handleSystemMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChangeSystemMessageContent(e.target.value);
    trackSettingsChanged('system_message_content', 'updated');
  };

  return (
    <div className="relative flex justify-end" ref={dropdownRef}>
      {/* Cog icon with circle */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        className="flex items-center justify-center w-12 h-12 rounded-full focus:outline-none transition-colors shadow-sm"
        style={{
          backgroundColor: theme === 'light' ? 'white' : '#1e1e29',
          color: disabled ? '#9ca3af' : '#F39880',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: '0 0 0 2px rgba(243, 152, 128, 0.2)',
        }}
        disabled={disabled}
        aria-label="Settings"
      >
        <FiSettings className="w-6 h-6" />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute mt-3 w-80 rounded-2xl shadow-lg z-20 overflow-hidden"
          style={{
            backgroundColor: theme === 'light' ? 'white' : '#1e1e29',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            right: 0,
            top: '100%',
            maxHeight: '600px', // Increased from 400px to 600px to accommodate dropdowns inside
            overflowY: 'auto',
          }}
        >
          <div className="p-6">
            <h3
              className="text-2xl font-bold mb-6"
              style={{ color: theme === 'light' ? '#111827' : '#f9fafb' }}
            >
              Settings
            </h3>

            {/* Theme Toggle */}
            <div className="mb-6">
              <label
                className="block text-base font-medium mb-3"
                style={{ color: theme === 'light' ? '#111827' : '#d1d5db' }}
              >
                Theme
              </label>
              <div className="flex items-center justify-between">
                <span
                  className="text-sm"
                  style={{ color: theme === 'light' ? '#4b5563' : '#9ca3af' }}
                >
                  {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                </span>
                <button
                  onClick={handleThemeToggle}
                  className="p-2 rounded-full transition-colors"
                  style={{
                    backgroundColor: theme === 'light' ? '#f3f4f6' : '#374151',
                    color: theme === 'light' ? '#4b5563' : '#d1d5db',
                  }}
                  aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                >
                  {theme === 'light' ? (
                    <FiMoon className="w-5 h-5" />
                  ) : (
                    <FiSun className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Model Selection */}
            <div className="mb-6">
              <label
                className="block text-base font-medium mb-3"
                style={{ color: theme === 'light' ? '#111827' : '#d1d5db' }}
              >
                Model
              </label>
              <ModelSelector
                models={models}
                selectedModel={selectedModel}
                onSelectModel={onSelectModel}
                disabled={disabled || isLoading}
                isLoading={isLoading}
              />
            </div>

            {/* Max Tokens Selection */}
            <div className="mb-6">
              <MaxTokensSelector maxTokens={maxTokens} onChangeMaxTokens={handleMaxTokensChange} />
            </div>

            {/* System Message Section */}
            <div>
              <label
                className="block text-base font-medium mb-3"
                style={{ color: theme === 'light' ? '#111827' : '#d1d5db' }}
              >
                <div className="flex items-center">
                  <span>System Message</span>
                  <div className="relative inline-block ml-2 group">
                    <FiInfo className="w-4 h-4 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400 cursor-help" />
                    <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 w-64 p-2 rounded bg-gray-800 text-white text-xs shadow-lg z-50">
                      <div className="relative">
                        A system message helps set the behavior of the assistant. It provides
                        initial instructions that guide the AI&apos;s responses.
                        <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 left-1/2 bottom-0 translate-y-1/2 -translate-x-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </label>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-sm"
                  style={{ color: theme === 'light' ? '#4b5563' : '#9ca3af' }}
                >
                  {systemMessageEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  onClick={handleToggleSystemMessage}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    systemMessageEnabled
                      ? 'bg-[#F39880]'
                      : theme === 'light'
                        ? 'bg-gray-200'
                        : 'bg-gray-700'
                  }`}
                  aria-pressed={systemMessageEnabled}
                  aria-label="Toggle system message"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      systemMessageEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {systemMessageEnabled && (
                <textarea
                  value={systemMessageContent}
                  onChange={handleSystemMessageChange}
                  placeholder="Enter system instructions for the AI..."
                  rows={4}
                  className="w-full p-3 rounded-xl border-2 focus:outline-none focus:ring-0 resize-y mb-2"
                  style={{
                    backgroundColor: theme === 'light' ? 'white' : '#1e1e29',
                    color: theme === 'light' ? '#111827' : '#d1d5db',
                    borderColor: '#F39880',
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;
