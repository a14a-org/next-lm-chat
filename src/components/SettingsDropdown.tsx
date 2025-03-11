import React, { useState, useEffect, useRef } from 'react';
import { FiSettings, FiSun, FiMoon } from 'react-icons/fi';
import ModelSelector from './ModelSelector';
import MaxTokensSelector from './MaxTokensSelector';
import { Model } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SettingsDropdownProps {
  models: Model[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  maxTokens: number;
  onChangeMaxTokens: (value: number) => void;
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
    }
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
                  onClick={toggleTheme}
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
            <div>
              <MaxTokensSelector
                maxTokens={maxTokens}
                onChangeMaxTokens={onChangeMaxTokens}
                minTokens={16}
                maxPossibleTokens={4096}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;
