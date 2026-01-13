/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a73e8',
          dark: '#1557b0',
        },
        success: '#0f9d58',
        danger: '#db4437',
        warning: '#f4b400',
        bg: {
          primary: '#0a0e27',
          secondary: '#131b3a',
          tertiary: '#1a2342',
        },
        positive: '#00ff88',
        negative: '#ff4444',
      },
    },
  },
  plugins: [],
}
