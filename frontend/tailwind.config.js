/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        industrialBlue: "#1E3A8A",
        industrialGrayLight: "#F5F5F5",
        industrialGray: "#E0E0E0",
        industrialGrayDark: "#9E9E9E",
        industrialText: "#212121",
      },
      fontFamily: {
        sans: ["Poppins", "Inter", "Roboto", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 6px rgba(0,0,0,0.05)",
      },
      borderRadius: {
        smooth: "10px",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      }
    },
  },
  plugins: [],
}
