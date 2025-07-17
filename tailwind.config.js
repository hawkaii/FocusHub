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
        "primary-dark": "#2D3142",
        "secondary-light": "#BFC0C0",
        white: "#FFFFFF",
        "accent-orange": "#EF8354",
        "supporting-blue": "#4F5D75",

        // Semantic Colors using CSS variables
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
        },
        background: {
          primary: "var(--color-background-primary)",
          secondary: "var(--color-background-secondary)",
          tertiary: "var(--color-background-tertiary)",
        },
        border: {
          light: "var(--color-border-light)",
          medium: "var(--color-border-medium)",
          dark: "var(--color-border-dark)",
        },

        // Interactive States
        hover: {
          primary: "var(--color-hover-primary)",
          accent: "var(--color-hover-accent)",
        },
        focus: "var(--color-focus-ring)",
        active: "var(--color-active)",

        // Status Colors
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        info: "var(--color-info)",
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 10px 15px -3px rgba(0, 0, 0, 0.15)",
        focus: "0 0 0 3px rgba(239, 131, 84, 0.1)",
      },
    },
  },
  plugins: [],
};
