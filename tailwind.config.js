/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#FBF6EC',
        cream: '#F6EEDE',
        sandal: '#EFE3CC',
        parchment: '#F3EAD7',
        maroon: {
          DEFAULT: '#6E1423',
          deep: '#571019',
          soft: '#8A2A36',
        },
        gold: {
          DEFAULT: '#B68A3E',
          light: '#C9A75A',
          pale: '#E3D2A6',
        },
        bronze: '#9C6B36',
        saffron: '#C97E3A',
        rose: '#E2BCB5',
        ink: {
          DEFAULT: '#3A2A24',
          soft: '#6B574C',
        },
        'white-warm': '#FFFDF8',
      },
      fontFamily: {
        'serif-display': ['Cormorant Garamond', 'Georgia', 'serif'],
        marcellus: ['Marcellus', 'serif'],
        body: ['Jost', 'sans-serif'],
        num: ['Cinzel', 'Georgia', 'serif'],
      },
      boxShadow: {
        luxe: '0 18px 40px -28px rgba(110, 20, 35, 0.35)',
        gold: '0 10px 30px -15px rgba(182, 138, 62, 0.4)',
        'luxe-hover': '0 24px 48px -20px rgba(110, 20, 35, 0.45)',
      },
    },
  },
  plugins: [],
};
