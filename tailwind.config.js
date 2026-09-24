/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F8FAFC", // Clean crisp background
        surface: "#FFFFFF", // Crisp card surface
        card: "#FFFFFF",
        cardHover: "#F1F5F9",
        ink: {
          DEFAULT: "#0F172A", // Deep legible navy/slate for text
          soft: "#475569",
          faint: "#94A3B8",
        },
        line: "#E2E8F0", // Subtle elegant borders
        accent: {
          DEFAULT: "#0284C7", // Sharp executive blue
          hover: "#0369A1",
          deep: "#075985",
          soft: "rgba(2, 132, 199, 0.08)",
        },
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          soft: "rgba(37, 99, 235, 0.08)",
        },
        good: { DEFAULT: "#059669", soft: "rgba(5, 150, 105, 0.10)" },
        warn: { DEFAULT: "#D97706", soft: "rgba(217, 119, 6, 0.10)" },
        bad: { DEFAULT: "#DC2626", soft: "rgba(220, 38, 38, 0.10)" },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        pop: "0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};
