/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        ink: '#0e1410',
        night: '#07130c',
        paper: '#f4f1ea',
        sun: '#e9a23b',
        vop: {
          DEFAULT: '#0a6b3c',
          deep: '#06432a',
          soft: '#d9e8dd',
        },
      },
      fontFamily: {
        logo: ['Galigo', 'Galigo Regular', '"Instrument Serif"', 'serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
