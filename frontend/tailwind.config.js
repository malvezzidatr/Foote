/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lime: {
          50: '#f5fae5',
          100: '#e8f5c8',
          200: '#d4ed9e',
          300: '#b8e063',
          400: '#a3d44a',
          500: '#7cb528',
          600: '#5f8f1e',
          700: '#496d1a',
          800: '#3b571a',
          900: '#334a1a',
        },
        field: '#3a7d44',
        cream: '#fafaf5',
        sand: '#f0f0e8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
