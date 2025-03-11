# Dark Mode Implementation Plan for Chat Platform

## Overview

This document outlines the plan to implement a dark mode toggle feature accessible via the settings (cog) icon in the chat platform interface. The implementation will allow users to switch between light and dark themes with their preference being saved for future sessions.

## Prerequisites

- Understanding of the current theme implementation in CSS
- Knowledge of React state management
- Familiarity with Next.js
- Access to the current codebase

## Implementation Checklist

### 1. Theme Context Setup

- [x] Create a new file `src/context/ThemeContext.tsx`
- [x] Implement a React context to manage theme state (light/dark)
- [x] Create theme provider component with state and toggle function
- [x] Add local storage persistence for user's theme preference
- [x] Implement system preference detection using `prefers-color-scheme` media query

### 2. Define Dark Mode CSS Variables

- [x] Update `src/app/globals.css` to include dark theme variables:
  - [x] Define dark theme colors for background, foreground, accents
  - [x] Define dark theme component styles (messages, cards, buttons)
  - [x] Create CSS variables for dark mode particle background

### 3. Update Layout Component

- [x] Modify `src/app/layout.tsx` to:
  - [x] Wrap the application with the ThemeProvider
  - [x] Apply theme class to the HTML/body element based on current theme
  - [x] Implement smooth transitions between themes

### 4. Add Theme Toggle to Settings

- [x] Update `src/components/SettingsDropdown.tsx` to:
  - [x] Add a theme toggle section to the settings panel
  - [x] Create a visually appealing toggle/switch component
  - [x] Connect the toggle to the theme context
  - [x] Add appropriate icons for light/dark modes

### 5. Update Components for Dark Mode Compatibility

- [x] Modify `ParticleBackground.tsx` to adjust particles for dark mode
- [x] Update `MessageList.tsx` and `Message.tsx` for proper dark mode styles
- [x] Ensure `WelcomeScreen.tsx` has proper dark mode styling
- [x] Verify `SuggestionCard.tsx` components display correctly in dark mode
- [x] Update `MessageInput.tsx` styling for dark theme

### 6. Testing

- [x] Test theme toggle functionality
- [x] Verify theme persistence across page refreshes
- [x] Test system preference detection and override
- [x] Test appearance across different browsers
- [x] Test appearance on mobile devices
- [x] Verify all components render correctly in both themes
- [x] Check for any contrast issues or accessibility concerns

### 7. Performance Optimization

- [x] Ensure smooth transitions between themes
- [x] Verify no unnecessary re-renders when toggling theme
- [x] Implement code splitting if needed for theme-specific components

### 8. Documentation

- [x] Add comments explaining theme implementation
- [x] Update README with information about the dark mode feature
- [x] Document any known issues or considerations

## Detailed Implementation Steps

### Theme Context Implementation

```tsx
// src/context/ThemeContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('theme') as Theme;

    // Check if user has saved preference
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    // Save theme to localStorage whenever it changes
    localStorage.setItem('theme', theme);

    // Apply theme class to document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

### CSS Variables for Dark Mode

```css
/* In globals.css */

:root {
  /* Light mode colors (default) */
  --background-start: #fff0f5;
  --background-end: #f5f0ff;
  --foreground: #333333;
  --accent: #f39880;
  --accent-soft: rgba(243, 152, 128, 0.2);
  --purple-soft: rgba(138, 116, 191, 0.12);
  --purple-medium: #8a74bf;
  --ui-light: #f9f9f9;
  --ui-dark: #333333;

  /* Component colors - light theme */
  --card-bg: rgba(255, 255, 255, 1);
  --user-message-bg: rgba(147, 112, 219, 0.5);
  --user-message-text: #ffffff;
  --user-message-border: rgba(147, 112, 219, 0.6);
  --bot-message-bg: #ffffff;
  --bot-message-text: #333333;
  --bot-message-border: rgba(138, 116, 191, 0.2);

  /* Transition for theme switching */
  --theme-transition:
    background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

/* Dark mode theme */
html.dark {
  --background-start: #1a1a2e;
  --background-end: #16213e;
  --foreground: #f1f1f1;
  --accent: #f39880;
  --accent-soft: rgba(243, 152, 128, 0.3);
  --purple-soft: rgba(138, 116, 191, 0.25);
  --purple-medium: #9d86d9;
  --ui-light: #2a2a3a;
  --ui-dark: #e1e1e1;

  /* Component colors - dark theme */
  --card-bg: rgba(42, 42, 58, 0.8);
  --user-message-bg: rgba(147, 112, 219, 0.6);
  --user-message-text: #ffffff;
  --user-message-border: rgba(147, 112, 219, 0.7);
  --bot-message-bg: rgba(30, 30, 42, 1);
  --bot-message-text: #f1f1f1;
  --bot-message-border: rgba(138, 116, 191, 0.3);
}

body {
  color: var(--foreground);
  background: linear-gradient(135deg, var(--background-start) 0%, var(--background-end) 100%);
  transition: var(--theme-transition);
}
```

### Theme Toggle Component in Settings

```tsx
// Add to SettingsDropdown.tsx

import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

// Inside SettingsDropdown component
const { theme, toggleTheme } = useTheme();

// Add this inside the dropdown panel
<div className="mb-6">
  <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">Theme</label>
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-600 dark:text-gray-400">
      {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
    </span>
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    >
      {theme === 'light' ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
    </button>
  </div>
</div>;
```

## Implementation Notes

1. **ThemeProvider Integration**: The ThemeProvider should be placed high in the component tree, ideally in the root layout, to ensure theme access throughout the application.

2. **CSS Approach**: We're using CSS variables defined at the :root level with overrides for dark mode, allowing for easy theme switching without extensive component changes.

3. **Performance Considerations**: Using CSS variables for theming avoids unnecessary React re-renders when switching themes.

4. **Accessibility**: Ensure proper contrast ratios are maintained in both themes for WCAG compliance.

5. **Testing Strategy**: Test on various devices and browsers to ensure consistent appearance.

## Future Enhancements

- Add customizable theme options beyond just light/dark
- Implement time-based automatic theme switching
- Add animations during theme transitions
- Consider adding high contrast theme for accessibility
