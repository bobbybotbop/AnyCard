/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Gill Sans"',
          '"Gill Sans MT"',
          "Calibri",
          '"Trebuchet MS"',
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
