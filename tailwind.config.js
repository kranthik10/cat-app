/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './global.css'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#fbf4ea',
        surface: '#ffffff',
        surfaceMuted: '#f3e7d8',
        border: '#e8d6c2',
        text: '#1f1d18',
        textMuted: '#6d655c',
        accent: '#de6b2f',
        accentMuted: '#f7d7c4',
        success: '#1f7a5c',
        successMuted: '#d7f1e7',
        danger: '#b5402c',
        dangerMuted: '#f7d8d2',
        sand: '#f1dfb5',
      },
      fontFamily: {
        body: ['Manrope_400Regular'],
        'body-medium': ['Manrope_500Medium'],
        'body-semibold': ['Manrope_600SemiBold'],
        'body-bold': ['Manrope_700Bold'],
        'body-extrabold': ['Manrope_800ExtraBold'],
      },
      boxShadow: {
        card: '0 10px 18px rgba(44,33,22,0.08)',
      },
    },
  },
  plugins: [],
};
