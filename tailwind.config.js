/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,ts,jsx,tsx}',
    './src/app/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        customRed: '#ff0032', 
      },
    },
  },
  plugins: [],
}