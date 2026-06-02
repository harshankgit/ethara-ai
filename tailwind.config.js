/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'var(--font-inter)', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#dae3ff',
          300: '#bed0ff',
          400: '#91afff',
          500: '#638aff',
          600: '#3b66f1',
          700: '#3154e1',
          800: '#2a44b8',
          900: '#273c92',
          950: '#1c2656',
        },
        border: 'var(--border)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
