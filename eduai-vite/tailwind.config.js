/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#0a0f1e', 800: '#0f1729', 700: '#162040', 600: '#1e2d55' },
        violet: { 600: '#6c47ff', 500: '#7c5cfc', 400: '#9b7ffe' },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
};
