/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        plum: {
          50: '#FAF5F9',
          100: '#F4EAF3',
          200: '#E7D3E5',
          300: '#D3B2D0',
          400: '#B888B3',
          500: '#975E91',
          600: '#7B4375',
          700: '#5E2F59',
          800: '#462042',
          900: '#31142E',
          950: '#210A1F',
        },
        lavender: {
          50: '#F9F8FD',
          100: '#F1EEFB',
          200: '#E4DCF6',
          300: '#CFC0EE',
          400: '#B29CE2',
          500: '#9476D4',
          600: '#7B56C4',
          700: '#6441AA',
          800: '#4F3387',
          900: '#3D2867',
        },
        coral: {
          50: '#FFF5F3',
          100: '#FFE8E4',
          200: '#FFD3CB',
          300: '#FFAF9F',
          400: '#F57D66',
          500: '#E4573B',
          600: '#C83D22',
          700: '#A42E18',
          800: '#842716',
        },
        surface: {
          DEFAULT: '#FAF8F5',
          subtle: '#F3EFEA',
          card: '#FFFFFF',
          border: '#E8E2D9'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -1px rgba(49, 20, 46, 0.05)',
        'soft': '0 6px 20px -3px rgba(49, 20, 46, 0.08)',
        'soft-lg': '0 12px 32px -4px rgba(49, 20, 46, 0.12)',
        'coral-glow': '0 0 25px rgba(228, 87, 59, 0.25)',
      }
    },
  },
  plugins: [],
}
