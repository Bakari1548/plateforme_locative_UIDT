/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./frontend/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f0f7',
          100: '#cce0ef',
          200: '#99c2df',
          300: '#66a3cf',
          400: '#3385bf',
          500: '#2878af',
          600: '#1f6290',
          700: '#004f80',
          800: '#003f66',
          900: '#002f4d',
        },
        secondary: {
          50: '#e0f2f4',
          100: '#b3dde2',
          200: '#80c5cd',
          300: '#4dabb8',
          400: '#1a97a3',
          500: '#04a2af',
          600: '#038a95',
          700: '#02707a',
          800: '#015860',
          900: '#014046',
        },
        accent: {
          red: '#e52429',
          orange: '#ec671e',
          dark: '#192a3d',
          slate: '#3a4f66',
          light: '#e1e8ed',
          lighter: '#f2f5f7',
          lightest: '#fafbfc',
        },
      },
      fontFamily: {
        sans: ['Overpass', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
