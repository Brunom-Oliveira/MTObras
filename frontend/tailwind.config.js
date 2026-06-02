/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#090d16',
        darkCard: 'rgba(17, 24, 39, 0.7)',
        accentCyan: '#06b6d4',
        accentEmerald: '#10b981',
        accentNeon: '#10b981',
        borderGray: 'rgba(255, 255, 255, 0.08)'
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
