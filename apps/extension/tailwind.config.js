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
        // Custom Notion/Linear dark theme colors
        dark: {
          50: '#f9f9fb',
          100: '#f0f0f3',
          200: '#e1e1e8',
          300: '#c5c5d3',
          400: '#a3a3b8',
          500: '#7e7e9a',
          600: '#61617d',
          700: '#46465c',
          800: '#2b2b3a',
          900: '#1a1a23',
          950: '#0f0f15',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
