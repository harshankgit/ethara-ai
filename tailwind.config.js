/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'var(--font-inter)', 'ui-sans-serif', 'system-ui'],
        mono: ['ui-monospace', 'SFMono-Regular'],
      },
      colors: {
        indigo: {
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
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
