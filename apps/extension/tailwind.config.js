/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./popup.html",
    "./dashboard.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbebfe',
          200: '#bfddfe',
          300: '#93c7fd',
          400: '#60a9fa',
          500: '#1e80ff',
          600: 'var(--brand-color, #0061da)',
          700: '#0052b8',
          800: '#004399',
          900: '#00357a',
          950: '#002252'
        },
        // Custom Notion/Linear dark theme colors
        dark: {
          50: '#1a1a23',
          100: '#2b2b3a',
          200: '#46465c',
          300: '#61617d',
          400: '#7e7e9a',
          500: '#a3a3b8',
          600: '#c5c5d3',
          700: '#e1e1e8',
          800: '#f0f0f3',
          900: '#ffffff',
          950: '#f9f9fb',
        }
      },
      textColor: {
        primary: 'var(--text-primary, #323232)',
        secondary: 'var(--text-secondary, #424242)',
        tertiary: 'var(--text-tertiary, #ddd)'
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
