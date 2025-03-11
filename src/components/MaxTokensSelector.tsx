import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

interface MaxTokensSelectorProps {
  maxTokens: number;
  onChangeMaxTokens: (value: number) => void;
  minTokens?: number;
  maxPossibleTokens?: number;
}

const LOCAL_STORAGE_MAX_TOKENS_KEY = 'next-lm-chat-max-tokens';

const MaxTokensSelector: React.FC<MaxTokensSelectorProps> = ({
  maxTokens,
  onChangeMaxTokens,
  minTokens = 16,
  maxPossibleTokens = 4096,
}) => {
  const [inputValue, setInputValue] = useState<string>(maxTokens.toString());
  const { theme } = useTheme();

  // Update input value when maxTokens prop changes
  useEffect(() => {
    setInputValue(maxTokens.toString());
  }, [maxTokens]);

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setInputValue(value.toString());
    onChangeMaxTokens(value);

    // Save to localStorage
    localStorage.setItem(LOCAL_STORAGE_MAX_TOKENS_KEY, value.toString());
  };

  // Handle direct input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputStr = e.target.value;
    setInputValue(inputStr);

    // Only update and save if it's a valid number
    if (/^\d+$/.test(inputStr)) {
      const value = parseInt(inputStr, 10);

      // Clamp the value between min and max
      if (value >= minTokens && value <= maxPossibleTokens) {
        onChangeMaxTokens(value);
        localStorage.setItem(LOCAL_STORAGE_MAX_TOKENS_KEY, value.toString());
      }
    }
  };

  // Handle blur for input validation
  const handleBlur = () => {
    let value = parseInt(inputValue, 10);

    // Handle invalid input
    if (isNaN(value)) {
      value = maxTokens;
    }

    // Clamp the value
    value = Math.min(Math.max(value, minTokens), maxPossibleTokens);

    setInputValue(value.toString());
    onChangeMaxTokens(value);
    localStorage.setItem(LOCAL_STORAGE_MAX_TOKENS_KEY, value.toString());
  };

  return (
    <div className="flex flex-col space-y-3 w-full pt-2">
      <label
        className="block text-base font-medium mb-3"
        style={{ color: theme === 'light' ? '#111827' : '#d1d5db' }}
      >
        Max Tokens
      </label>
      <div className="flex justify-between items-center">
        <input
          type="range"
          id="max-tokens"
          min={minTokens}
          max={maxPossibleTokens}
          value={maxTokens}
          onChange={handleSliderChange}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#F39880]"
          style={{
            background: `linear-gradient(to right, #F39880 0%, #F39880 ${((maxTokens - minTokens) / (maxPossibleTokens - minTokens)) * 100}%, #E5E7EB ${((maxTokens - minTokens) / (maxPossibleTokens - minTokens)) * 100}%, #E5E7EB 100%)`,
          }}
        />
        <div className="ml-4">
          <input
            type="text"
            id="max-tokens-input"
            className="w-20 h-10 text-lg font-medium rounded-lg border-2 border-gray-300 focus:ring-[#F39880] focus:border-[#F39880] text-right px-3"
            style={{
              backgroundColor: theme === 'light' ? 'white' : '#1e1e29',
              color: theme === 'light' ? '#111827' : '#e5e7eb',
              borderColor: theme === 'light' ? '#d1d5db' : '#374151',
            }}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
        </div>
      </div>
      <div
        className="flex justify-between text-base font-medium px-1 mt-1"
        style={{ color: theme === 'light' ? '#111827' : '#9ca3af' }}
      >
        <span>{minTokens}</span>
        <span>{maxPossibleTokens}</span>
      </div>
    </div>
  );
};

export default MaxTokensSelector;
