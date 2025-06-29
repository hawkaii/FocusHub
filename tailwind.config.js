const animations = require("./src/theme/animations.js");

module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      ...animations,
      fontFamily: {
        "radio-canada": ['"Radio Canada"', "sans-serif"],
      },
      colors: {
        // Primary Colors
        'primary-dark': '#2D3142',
        'secondary-light': '#BFC0C0',
        'white': '#FFFFFF',
        'accent-orange': '#EF8354',
        'supporting-blue': '#4F5D75',
        
        // Semantic Colors
        'text': {
          'primary': '#2D3142',
          'secondary': '#4F5D75',
          'muted': '#6B7280',
        },
        'background': {
          'primary': '#FFFFFF',
          'secondary': '#F8F9FA',
          'tertiary': '#BFC0C0',
        },
        'border': {
          'light': '#E5E7EB',
          'medium': '#BFC0C0',
          'dark': '#4F5D75',
        },
        
        // Interactive States
        'hover': {
          'primary': '#4F5D75',
          'accent': '#D16B3A',
        },
        'focus': '#EF8354',
        'active': '#2D3142',
        
        // Status Colors
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#3B82F6',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(45, 49, 66, 0.1)',
        'card-hover': '0 10px 15px -3px rgba(45, 49, 66, 0.15)',
        'focus': '0 0 0 3px rgba(239, 131, 84, 0.1)',
      },
    },
  },
  plugins: [],
};