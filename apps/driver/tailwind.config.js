/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  presets: [],
  theme: {
    extend: {
      colors: {
        primary: '#006e2a',
        'primary-container': '#00c853',
        surface: '#f7f9fc',
        'on-surface': '#191c1e',
      },
      fontFamily: {
        sans: ['PlusJakartaSans'],
      },
      borderRadius: {
        '4xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
