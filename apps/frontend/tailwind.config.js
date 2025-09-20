/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandBlue: {
      DEFAULT: "#2563eb", // acts like brandBlue
      600: "#2563eb",     // same as blue-600
      700: "#1d4ed8",     // same as blue-700
    },
      },
    },
  },
  plugins: [],
};
