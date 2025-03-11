'use client';

import React, { useEffect, useState } from 'react';
import SuggestionCard from './SuggestionCard';
import { useTheme } from '../context/ThemeContext';

interface WelcomeScreenProps {
  onStartChat: (message: string) => void;
}

// Comprehensive list of evergreen prompts categorized for variety
const allPrompts = [
  // Creative & Imaginative
  {
    icon: 'wand',
    title: 'Imagine a New Species',
    subtitle: 'Creative Challenge',
    prompt: 'Imagine and describe a new species that might evolve on Earth in the distant future.',
  },
  {
    icon: 'plane',
    title: 'Hidden Vacation Gems',
    subtitle: 'Travel Inspiration',
    prompt: 'What are some lesser-known vacation destinations that offer incredible experiences?',
  },
  {
    icon: 'wand',
    title: 'New Primary Color',
    subtitle: 'Thought Experiment',
    prompt:
      'If you could add a new primary color to the rainbow, how would you describe it and what would it be called?',
  },

  // Technology & Future
  {
    icon: 'wand',
    title: 'Future of Transportation',
    subtitle: 'Tech Predictions',
    prompt: 'How might personal transportation evolve in the next few decades?',
  },
  {
    icon: 'hand',
    title: 'Ethical AI Decisions',
    subtitle: 'Thought-Provoking',
    prompt:
      'What ethical guidelines should AI systems follow when making decisions that affect humans?',
  },
  {
    icon: 'wand',
    title: 'Smart Home Revolution',
    subtitle: 'Tech Insights',
    prompt:
      'How might smart home technology change the way we live and interact with our living spaces?',
  },

  // Philosophy & Deep Thinking
  {
    icon: 'hand',
    title: 'Ship of Theseus',
    subtitle: 'Philosophy Puzzle',
    prompt: 'Explain the Ship of Theseus paradox and its implications for identity and change.',
  },
  {
    icon: 'hand',
    title: 'Consciousness Origin',
    subtitle: 'Deep Questions',
    prompt: 'What theories exist about the nature and origin of consciousness?',
  },
  {
    icon: 'hand',
    title: 'Universal Language',
    subtitle: 'Linguistic Exploration',
    prompt: 'How would a truly universal human language function, and what features would it have?',
  },

  // Science & Knowledge
  {
    icon: 'wand',
    title: 'Quantum Computing',
    subtitle: 'Simply Explained',
    prompt: 'Explain quantum computing in simple terms and why it matters.',
  },
  {
    icon: 'plane',
    title: 'Space Colonization',
    subtitle: 'Cosmic Frontiers',
    prompt: 'What would be required to establish a self-sustaining human colony on another planet?',
  },
  {
    icon: 'wand',
    title: 'Deep Ocean Mysteries',
    subtitle: 'Unexplored Earth',
    prompt: 'What are the most fascinating unexplained mysteries of the deep ocean?',
  },

  // Arts & Culture
  {
    icon: 'wand',
    title: 'Art & Technology Fusion',
    subtitle: 'Creative Evolution',
    prompt: 'How is technology changing the way art is created, shared, and experienced?',
  },
  {
    icon: 'wand',
    title: 'Worldbuilding Elements',
    subtitle: 'Creative Writing',
    prompt: 'What elements are essential for creating a compelling fictional world or universe?',
  },
  {
    icon: 'wand',
    title: 'Musical Innovation',
    subtitle: 'Sound Exploration',
    prompt: 'What innovations are changing how music is created and experienced?',
  },

  // Practical & Everyday
  {
    icon: 'hand',
    title: 'Productivity Techniques',
    subtitle: 'Work Smarter',
    prompt: 'What are the most effective productivity techniques for managing a busy schedule?',
  },
  {
    icon: 'wand',
    title: 'Culinary Fusion Ideas',
    subtitle: 'Food Inspiration',
    prompt:
      'Suggest some interesting culinary fusion ideas that blend different cultural cuisines.',
  },
  {
    icon: 'hand',
    title: 'Learning Acceleration',
    subtitle: 'Knowledge Growth',
    prompt: 'What techniques can help someone learn new skills or subjects more effectively?',
  },

  // Fun & Hypothetical
  {
    icon: 'plane',
    title: 'Superpowers with Downsides',
    subtitle: 'Creative Challenge',
    prompt: 'Imagine some unique superpowers that come with interesting downsides or limitations.',
  },
  {
    icon: 'plane',
    title: 'Animal Communication',
    subtitle: 'What If...',
    prompt:
      'If you could have a conversation with any species of animal, which would you choose and why?',
  },
  {
    icon: 'plane',
    title: 'Time Travel Destination',
    subtitle: 'Hypothetical Adventure',
    prompt:
      'If you could safely time travel to any point in human history for a day, when and where would you go?',
  },

  // Problem Solving
  {
    icon: 'hand',
    title: 'Global Water Scarcity',
    subtitle: 'Solution Thinking',
    prompt:
      'What innovative approaches could help address water scarcity in drought-prone regions?',
  },
  {
    icon: 'hand',
    title: 'Urban Transportation',
    subtitle: 'Design Challenge',
    prompt:
      'How could cities redesign their transportation systems to be more efficient and sustainable?',
  },
  {
    icon: 'hand',
    title: 'Digital Privacy Balance',
    subtitle: 'Modern Dilemma',
    prompt:
      'How can we balance digital privacy with security and convenience in connected technologies?',
  },

  // Emotional & Personal
  {
    icon: 'hand',
    title: 'Defining Success',
    subtitle: 'Personal Reflection',
    prompt: 'What does a truly successful life mean to you beyond conventional measures?',
  },
  {
    icon: 'hand',
    title: 'Happiness Research',
    subtitle: 'Well-being Insights',
    prompt: 'What does scientific research tell us about what truly makes humans happy?',
  },
  {
    icon: 'wand',
    title: 'Future-Proof Skills',
    subtitle: 'Career Insights',
    prompt: 'Which skills will be most valuable and resistant to automation in the future?',
  },

  // About SayHalo
  {
    icon: 'hand',
    title: 'SayHalo AI: What Sets Us Apart',
    subtitle: 'Key Differentiators',
    prompt: 'What makes SayHalo AI different from other AI assistants?',
  },
  {
    icon: 'hand',
    title: 'SayHalo AI Capabilities',
    subtitle: 'Feature Overview',
    prompt: 'What are the main capabilities and features of SayHalo AI?',
  },
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartChat }) => {
  const [typedText, setTypedText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const fullText = 'Can I help you with anything?';
  const { theme } = useTheme();
  // State to hold the selected random prompts
  const [selectedPrompts, setSelectedPrompts] = useState<typeof allPrompts>([]);

  // Select random prompts when component mounts
  useEffect(() => {
    // Shuffle the array and take the first 3
    const shuffled = [...allPrompts].sort(() => 0.5 - Math.random());
    setSelectedPrompts(shuffled.slice(0, 3));
  }, []);

  // Typewriter effect for the main heading
  useEffect(() => {
    if (textIndex < fullText.length) {
      const timeout = setTimeout(
        () => {
          setTypedText(fullText.substring(0, textIndex + 1));
          setTextIndex(textIndex + 1);
        },
        80 + Math.random() * 40
      ); // Add randomness to typing speed

      return () => clearTimeout(timeout);
    }
  }, [textIndex, fullText]);

  // Force immediate display for testing
  useEffect(() => {
    if (typedText === '') {
      setTypedText(fullText);
      setTextIndex(fullText.length);
    }
  }, [fullText]);

  return (
    <div className="flex flex-col items-center pt-20 md:pt-32 px-4">
      <h1
        className="text-4xl md:text-5xl font-bold mb-8 text-center"
        style={{ color: theme === 'light' ? '#111827' : '#f3f4f6' }}
      >
        Hi, there!
      </h1>

      <div className="relative text-center mb-16">
        <h2
          className="text-3xl md:text-4xl font-semibold"
          style={{ color: theme === 'light' ? '#374151' : '#d1d5db' }}
        >
          {typedText}
          <span
            className={`ml-1 inline-block w-2 h-8 bg-[#F39880] ${textIndex < fullText.length ? 'animate-blink' : 'opacity-0'}`}
          ></span>
        </h2>
        <div className="absolute -bottom-2 left-0 right-0 mx-auto w-24 h-2 rounded-full bg-[#F39880] opacity-50"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {selectedPrompts.map((suggestion, index) => (
          <SuggestionCard
            key={index}
            icon={suggestion.icon}
            title={suggestion.title}
            subtitle={suggestion.subtitle}
            onClick={() => onStartChat(suggestion.prompt)}
          />
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
