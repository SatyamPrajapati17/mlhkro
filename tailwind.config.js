/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wt: {
          black: '#0A0A0A',
          ink: '#141414',
          white: '#FAFAF5',
          gray: '#8A8A85',
          red: '#FF2D2D',
          yellow: '#FFD600',
        },
      },
      fontFamily: {
        display: ['"Archivo Black"', 'sans-serif'],
        sans: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '9999px',
      },
      boxShadow: {
        hard: '6px 6px 0 #FF2D2D',
        hardY: '6px 6px 0 #FFD600',
        hardW: '6px 6px 0 #FAFAF5',
        hardSm: '4px 4px 0 #FF2D2D',
        hardYSm: '4px 4px 0 #FFD600',
        hardWSm: '4px 4px 0 #FAFAF5',
      },
    },
  },
  plugins: [],
}
