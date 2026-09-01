/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        kernel: {
          950: '#0a0a0c', // deep rich dark
          900: '#141418', // card background
          800: '#52525b', // zinc-600 clean light gray border
          700: '#71717a', // zinc-500 light gray border
          600: '#a1a1aa', // zinc-400 bright light gray border
          500: '#d4d4d8',
          400: '#a1a1aa',
          300: '#d4d4d8',
          200: '#e4e4e7',
          100: '#ffffff',
        },
        brand: {
          DEFAULT: '#3b82f6',
          subtle: '#1e293b',
        }
      },
      boxShadow: {
        'hard': '4px 4px 12px 0px rgba(0, 0, 0, 0.5)',
        'hard-sm': '2px 2px 8px 0px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
