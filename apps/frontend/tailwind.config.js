/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#1e293b',
          100: '#334155',
          200: '#475569',
          300: '#64748b',
          400: '#94a3b8',
          500: '#cbd5e1',
          600: '#e2e8f0',
          700: '#f1f5f9',
          800: '#f8fafc',
          900: '#ffffff',
          950: '#f8fafc'
        },
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
      },
      textColor: {
        primary: 'var(--text-primary, #323232)',
        secondary: 'var(--text-secondary, #555)',
        tertiary: 'var(--text-tertiary, #555)'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
