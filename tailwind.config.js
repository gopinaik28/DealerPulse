/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FAFAFA",
        ink: {
          DEFAULT: "#0F172A",
          soft: "#475569",
          faint: "#94A3B8",
        },
        line: "#E9EDF2",
        accent: {
          DEFAULT: "#2563EB",
          soft: "#EFF4FF",
        },
        good: { DEFAULT: "#15803D", soft: "#ECFDF3" },
        warn: { DEFAULT: "#B45309", soft: "#FFF7ED" },
        bad: { DEFAULT: "#B91C1C", soft: "#FEF2F2" },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)",
        pop: "0 4px 12px rgba(15,23,42,0.10)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};
