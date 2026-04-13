/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // EndEndo brand palette
        endo: {
          purple: {
            50: '#f5f0ff',
            100: '#ede5ff',
            200: '#daccff',
            300: '#c1a6ff',
            400: '#a373ff',
            500: '#8b3dff',
            600: '#7B2D8C', // primary brand purple
            700: '#6b21a8',
            800: '#5a1d89',
            900: '#4c1d6b',
          },
          teal: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#20B2AA', // primary brand teal
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
