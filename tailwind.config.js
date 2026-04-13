/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // EndEndo brand palette — from design doc
        // Primary: HSL(152, 65%, 45%) — Emerald green
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#28b867', // HSL(152, 65%, 45%) — main brand green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          DEFAULT: '#28b867',
        },
        // Secondary: HSL(210, 20%, 25%) — Deep charcoal blue
        secondary: {
          DEFAULT: '#333d4d',
          light: '#4b5563',
          dark: '#1f2937',
        },
        // Accent: HSL(152, 35%, 88%) — Soft mint
        accent: {
          DEFAULT: '#d5f0e3',
          foreground: '#1a6b42', // HSL(152, 65%, 25%) — dark emerald
        },
        // Muted: HSL(210, 15%, 96%) — Near-white
        muted: {
          DEFAULT: '#f3f4f6',
          foreground: '#6b7280',
        },
        // Border: HSL(210, 15%, 90%) — Light blue-grey
        border: '#e2e5ea',
      },
      fontFamily: {
        heading: ['"Nunito Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
