// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        gold: {
          500: '#D4AF37',
          600: '#B8860B', 
          700: '#996515'
        }
      },
      fontFamily: {
        'serif': ['Georgia', 'serif']
      }
    },
  },
  plugins: [],
}