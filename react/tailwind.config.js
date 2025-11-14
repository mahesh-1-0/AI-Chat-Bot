/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pixel: {
          bg: "#1a1a2e",
          panel: "#16213e",
          border: "#0f3460",
          text: "#e94560",
          "text-muted": "#a8a8a8",
          accent: "#00d9ff",
          "accent-strong": "#00a8cc",
          user: "#ff6b9d",
          bot: "#c44569",
          success: "#00ff88",
          shadow: "#000000",
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', '"Courier New"', "monospace"],
      },
      boxShadow: {
        pixel: "4px 4px 0 var(--tw-shadow-color)",
        "pixel-lg": "8px 8px 0 var(--tw-shadow-color)",
        "pixel-inset": "inset 4px 4px 0 rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};
