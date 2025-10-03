/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0D0D0D",
        panel: "#1C1C1C",
        "text-primary": "#F5F5F5",
        "text-secondary": "#B0B0B0",
        accent: "#E63946",
        warning: "#F77F00",
        success: "#4CAF50",
      },
      boxShadow: {
        panel: "0 6px 24px rgba(0,0,0,0.35)",
        soft: "0 1px 2px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.15)",
      },
      borderRadius: {
        xl: "14px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
