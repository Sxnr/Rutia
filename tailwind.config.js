/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#142C50",
        navy: "#142C50",
        navyLight: "#142C50",
        accent: "#E0A526",
        gold: "#E0A526",
        accentHover: "#E0A526",
        muted: "#7D8A9A",
        slate: "#7D8A9A",
        cream: "#F4F0E6",
        surface: "#F4F0E6",
        "surface-alt": "#F4F0E6",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
