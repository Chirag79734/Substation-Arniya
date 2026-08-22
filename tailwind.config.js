/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        industrial: {
          900: '#0b1120',
          800: '#111827',
          700: '#1e293b',
          600: '#334155',
          500: '#475569',
        }
      }
    },
  },
  plugins: [],
}
