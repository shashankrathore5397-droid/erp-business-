/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"] ,
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          900: "#0f172a",
          800: "#1f2937",
          700: "#374151",
        },
        ocean: {
          50: "#eefbf9",
          100: "#d7f5f0",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
        },
        sun: {
          50: "#fff9eb",
          200: "#ffe1a3",
          500: "#f59e0b",
        },
        rose: {
          50: "#fff1f2",
          500: "#f43f5e",
        },
      },
      boxShadow: {
        soft: "0 20px 60px rgba(15, 23, 42, 0.12)",
        card: "0 12px 30px rgba(15, 23, 42, 0.08)",
      },
      backgroundImage: {
        "grid-pattern": "radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.08) 1px, transparent 0)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};
