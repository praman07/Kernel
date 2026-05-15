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
          950: '#0a0a0a', // deep off-black
          900: '#121212',
          800: '#1a1a1a',
          700: '#27272a', // thin borders
          600: '#3f3f46',
          500: '#52525b',
          400: '#a1a1aa',
          300: '#d4d4d8',
          200: '#e4e4e7',
          100: '#f4f4f5',
        },
        brand: {
          DEFAULT: '#e4e4e7', // primarily monochrome accents
          subtle: '#27272a',
        }
      },
      boxShadow: {
        'hard': '4px 4px 0px 0px rgba(39, 39, 42, 1)',
        'hard-sm': '2px 2px 0px 0px rgba(39, 39, 42, 1)',
      }
    },
  },
  plugins: [],
}
