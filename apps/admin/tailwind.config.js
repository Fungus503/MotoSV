/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#199675',
        'primary-dark': '#157a5e',
        'primary-light': '#e8f5f0',
        surface: '#f4f6f9',
        'on-surface': '#191c1e',
        sidebar: {
          from: '#199675',
          to: '#212121',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
