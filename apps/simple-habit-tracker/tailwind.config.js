/** @type {import('tailwindcss').Config} */

// Design System - Simple Habit Tracker
// Minimalist design with positive, energetic color palette
const colors = {
  // Brand colors - Vibrant and energetic
  primary: {
    DEFAULT: 'hsl(231, 91%, 67%)',      // Indigo - Focus and motivation
    light: 'hsl(231, 91%, 77%)',
    dark: 'hsl(231, 91%, 57%)',
  },
  secondary: {
    DEFAULT: 'hsl(158, 64%, 52%)',      // Teal - Growth and achievement
    light: 'hsl(158, 64%, 72%)',
    dark: 'hsl(158, 64%, 42%)',
  },
  accent: {
    DEFAULT: 'hsl(45, 93%, 63%)',       // Gold - Success and reward
    light: 'hsl(45, 93%, 73%)',
    dark: 'hsl(45, 93%, 53%)',
  },

  // Text colors - Clean and readable
  text: {
    primary: 'hsl(220, 15%, 20%)',      // Dark blue-gray for main text
    secondary: 'hsl(220, 12%, 45%)',    // Medium gray for secondary text
    muted: 'hsl(220, 10%, 65%)',        // Light gray for subtle text
    inverse: 'hsl(0, 0%, 100%)',        // White text for dark backgrounds
  },

  // Surface colors - Light mode
  surface: {
    DEFAULT: 'hsl(0, 0%, 100%)',        // Pure white background
    elevated: 'hsl(220, 15%, 98%)',     // Slightly tinted for cards
    hover: 'hsl(220, 15%, 96%)',        // Hover state
  },
  
  // Border colors
  border: {
    DEFAULT: 'hsl(220, 13%, 91%)',      // Subtle borders
    strong: 'hsl(220, 13%, 80%)',       // Emphasized borders
  },

  // Status colors - Positive and clear
  success: {
    DEFAULT: 'hsl(142, 76%, 45%)',      // Green - Completion
    light: 'hsl(142, 76%, 90%)',
    bg: 'hsl(142, 76%, 96%)',
  },
  warning: {
    DEFAULT: 'hsl(38, 92%, 55%)',       // Orange - Attention
    light: 'hsl(38, 92%, 85%)',
    bg: 'hsl(38, 92%, 95%)',
  },
  danger: {
    DEFAULT: 'hsl(0, 84%, 60%)',        // Red - Alert
    light: 'hsl(0, 84%, 85%)',
    bg: 'hsl(0, 84%, 95%)',
  },
  info: {
    DEFAULT: 'hsl(199, 89%, 48%)',      // Blue - Information
    light: 'hsl(199, 89%, 85%)',
    bg: 'hsl(199, 89%, 95%)',
  },

  // Dark mode colors
  dark: {
    background: 'hsl(220, 15%, 10%)',   // Deep dark background
    surface: 'hsl(220, 15%, 14%)',      // Card background
    elevated: 'hsl(220, 15%, 18%)',     // Elevated surface
    border: 'hsl(220, 10%, 25%)',       // Borders in dark mode
    text: {
      primary: 'hsl(0, 0%, 95%)',       // Almost white
      secondary: 'hsl(220, 10%, 70%)',  // Light gray
      muted: 'hsl(220, 10%, 50%)',      // Medium gray
    },
  },

  // Gradient stops for vibrant UI elements
  gradient: {
    primary: {
      from: 'hsl(231, 91%, 67%)',
      to: 'hsl(270, 91%, 67%)',
    },
    success: {
      from: 'hsl(142, 76%, 45%)',
      to: 'hsl(158, 64%, 52%)',
    },
    warm: {
      from: 'hsl(45, 93%, 63%)',
      to: 'hsl(30, 93%, 63%)',
    },
  },
};

module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./config/**/*.{js,jsx,ts,tsx}",
    "./utils/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      /*
       * Design System - Semantic Color Tokens
       * 
       * Simple Habit Tracker uses a minimalist design with:
       * - High contrast for readability
       * - Vibrant colors for positive reinforcement
       * - Smooth gradients for visual interest
       * - Generous spacing and rounded corners
       *
       * Usage:
       * - Text: text-text-primary, text-text-secondary, text-text-muted, text-text-inverse
       * - Surface: bg-surface, bg-surface-elevated, bg-surface-hover
       * - Brand: bg-primary, bg-secondary, bg-accent
       * - Status: bg-success, bg-warning, bg-danger, bg-info
       * - Borders: border-border, border-border-strong
       * - Dark mode: dark:bg-dark-background, dark:bg-dark-surface
       *
       * ⚠️ NEVER use direct colors: text-white, bg-white, text-black, bg-black
       * ⚠️ Use semantic tokens only for maintainability and theme consistency
       */
      colors: colors,

      // Typography scale for hierarchy
      fontSize: {
        'display': ['56px', { lineHeight: '64px', fontWeight: '700' }],
        'h1': ['40px', { lineHeight: '48px', fontWeight: '700' }],
        'h2': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'h3': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'h4': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-large': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-small': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },

      // Spacing scale for consistent layouts
      spacing: {
        '18': '72px',
        '22': '88px',
        '26': '104px',
      },

      // Border radius for modern feel
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
      },

      // Box shadow for depth
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'strong': '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
