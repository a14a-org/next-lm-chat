import React, { useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { Model } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const LOCAL_STORAGE_MODEL_KEY = 'next-lm-chat-selected-model';

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onSelectModel,
  disabled = false,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Get the name of the currently selected model
  const currentModel =
    models.find(model => model.id === selectedModel)?.name ||
    models.find(model => model.id === selectedModel)?.id ||
    'Select a model';

  // Get a shortened display version of the model name for the button
  const getDisplayName = (name: string) => {
    // If name includes a slash, show only the part after the last slash
    if (name.includes('/')) {
      const parts = name.split('/');
      return parts[parts.length - 1];
    }
    return name;
  };

  const displayName = getDisplayName(currentModel);

  // Load the saved model from localStorage on component mount
  useEffect(() => {
    const savedModelId = localStorage.getItem(LOCAL_STORAGE_MODEL_KEY);

    // If there's a saved model ID and it's in the available models list, select it
    if (savedModelId && models.some(model => model.id === savedModelId)) {
      onSelectModel(savedModelId);
    }
  }, [models, onSelectModel]);

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

  const handleToggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!disabled && !isLoading && models.length > 0) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelectModel = (modelId: string) => {
    // Save to localStorage
    localStorage.setItem(LOCAL_STORAGE_MODEL_KEY, modelId);

    // Update selected model
    onSelectModel(modelId);
    setIsOpen(false);
  };

  // Format model name for better display - split into repository path and model name
  const formatModelName = (name: string) => {
    // Split by slashes for better display
    const parts = name.split(/[\/]/);

    // Get the model name (last part)
    const modelId = parts[parts.length - 1];

    // Get the repository path (all parts except the last)
    const repoPath = parts.slice(0, parts.length - 1).join('/');

    return (
      <div className="flex flex-col">
        {repoPath && <span className="text-sm text-gray-500">{repoPath}</span>}
        <span className="text-lg font-medium text-gray-900">{modelId}</span>
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className={`flex items-center justify-between w-full p-4 text-base font-medium border rounded-xl ${
          disabled || isLoading || models.length === 0
            ? 'opacity-60 cursor-not-allowed border-gray-200 text-gray-400'
            : 'border-[#F39880] hover:border-[#E87559]'
        }`}
        style={{
          backgroundColor: theme === 'light' ? 'white' : '#1e1e29',
          color: theme === 'light' ? '#111827' : '#d1d5db',
          borderColor:
            disabled || isLoading || models.length === 0
              ? theme === 'light'
                ? '#e5e7eb'
                : '#374151'
              : '#F39880',
          borderWidth: '2px',
        }}
        onClick={handleToggleDropdown}
        disabled={disabled || isLoading || models.length === 0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={currentModel}
      >
        {isLoading ? (
          <div className="flex items-center">
            <svg
              className="w-4 h-4 mr-2 animate-spin text-gray-600"
              style={{ color: theme === 'light' ? '#4b5563' : '#9ca3af' }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span style={{ color: theme === 'light' ? '#111827' : '#d1d5db' }}>
              Loading models...
            </span>
          </div>
        ) : (
          <span
            className="truncate max-w-[90%] text-left"
            style={{ color: theme === 'light' ? '#111827' : '#e5e7eb' }}
          >
            {displayName}
          </span>
        )}
        <FiChevronDown
          className="ml-2 h-5 w-5 flex-shrink-0"
          style={{ color: theme === 'light' ? '#4b5563' : '#9ca3af' }}
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-10 mt-2 w-full rounded-xl py-2 shadow-lg border"
          style={{
            backgroundColor: theme === 'light' ? 'white' : '#1e1e29',
            borderColor: theme === 'light' ? '#e5e7eb' : '#374151',
            maxHeight: '300px', // P6425
            overflowY: 'auto', // Pec44
          }}
          role="listbox"
          aria-labelledby="model-selector"
        >
          {models.map(model => (
            <button
              key={model.id}
              type="button"
              className={`w-full px-4 py-3 text-left focus:outline-none ${
                model.id === selectedModel ? (theme === 'light' ? 'bg-gray-50' : 'bg-gray-800') : ''
              }`}
              style={{
                backgroundColor:
                  model.id === selectedModel
                    ? theme === 'light'
                      ? '#f9fafb'
                      : '#1f2937'
                    : 'transparent',
              }}
              onClick={() => handleSelectModel(model.id)}
              role="option"
              aria-selected={model.id === selectedModel}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex flex-col">
                    {model.name && model.name.includes('/') && (
                      <span
                        className="text-sm"
                        style={{ color: theme === 'light' ? '#4b5563' : '#9ca3af' }}
                      >
                        {model.name.split('/').slice(0, -1).join('/')}
                      </span>
                    )}
                    <span
                      className="text-lg font-medium"
                      style={{ color: theme === 'light' ? '#111827' : '#e5e7eb' }}
                    >
                      {model.name ? model.name.split('/').pop() : model.id}
                    </span>
                  </div>
                </div>
                {model.id === selectedModel && <FiCheck className="h-5 w-5 text-[#F39880]" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
