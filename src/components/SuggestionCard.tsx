'use client';

import React from 'react';
import { FaPaperPlane, FaHandPaper, FaMagic } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

interface SuggestionCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ icon, title, subtitle, onClick }) => {
  const { theme } = useTheme();

  const getIcon = () => {
    switch (icon) {
      case 'plane':
        return (
          <FaPaperPlane className="transform transition-transform duration-300 group-hover:rotate-12" />
        );
      case 'hand':
        return (
          <FaHandPaper className="transform transition-transform duration-300 group-hover:rotate-12" />
        );
      case 'wand':
        return (
          <FaMagic className="transform transition-transform duration-300 group-hover:rotate-12" />
        );
      default:
        return (
          <FaHandPaper className="transform transition-transform duration-300 group-hover:rotate-12" />
        );
    }
  };

  return (
    <div
      className="group rounded-2xl p-4 md:p-6 cursor-pointer transition-all duration-300 relative overflow-hidden"
      onClick={onClick}
      style={{
        backgroundColor: theme === 'light' ? 'white' : '#1e1e29',
        boxShadow:
          theme === 'light' ? '0 4px 12px rgba(0, 0, 0, 0.05)' : '0 4px 12px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Icon Circle */}
      <div
        className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-xl mb-3 md:mb-4"
        style={{
          backgroundColor:
            theme === 'light' ? 'rgba(243, 152, 128, 0.15)' : 'rgba(243, 152, 128, 0.2)',
          color: '#F39880',
        }}
      >
        {getIcon()}
      </div>

      {/* Title and Subtitle */}
      <h3
        className="text-base md:text-lg font-semibold mb-1 md:mb-2 line-clamp-1"
        style={{ color: theme === 'light' ? '#111827' : '#f3f4f6' }}
      >
        {title}
      </h3>
      <p
        className="text-xs md:text-sm line-clamp-1"
        style={{ color: theme === 'light' ? '#4b5563' : '#d1d5db' }}
      >
        {subtitle}
      </p>

      {/* Hover Effect Gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
        style={{
          background:
            theme === 'light'
              ? 'linear-gradient(to bottom right, rgba(243, 152, 128, 0.2), rgba(138, 116, 191, 0.12))'
              : 'linear-gradient(to bottom right, rgba(243, 152, 128, 0.3), rgba(138, 116, 191, 0.25))',
        }}
      ></div>
    </div>
  );
};

export default SuggestionCard;
