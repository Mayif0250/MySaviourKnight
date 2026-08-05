/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          light: "#EFF6FF",
          dark: "#1E40AF",
        },
        background: {
          light: "#FAFAFA",
          dark: "#0F172A",
          sidebarLight: "#F3F4F6",
          sidebarDark: "#0B0F19",
          cardLight: "#FFFFFF",
          cardDark: "#1E293B",
        },
        border: {
          light: "#E5E7EB",
          dark: "#1E293B",
        },
        text: {
          primaryLight: "#111827",
          primaryDark: "#F8FAFC",
          secondaryLight: "#6B7280",
          secondaryDark: "#94A3B8",
        },
        status: {
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif"
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Cascadia Code",
          "Consolas",
          "monospace"
        ]
      },
      boxShadow: {
        soft: "0 2px 10px rgba(0, 0, 0, 0.04)",
        card: "0 4px 20px rgba(0, 0, 0, 0.06)",
        float: "0 10px 30px rgba(0, 0, 0, 0.12)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      }
    },
  },
  plugins: [],
}
