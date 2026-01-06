/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'claude-orange': '#D97757',
        'claude-cream': '#F4F1EA',
        'claude-dark': '#1C1C1C',
        'claude-brown': '#8B7355',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
