/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Astroma-style: fundo preto puro, cards com glassmorphism
        base: {
          DEFAULT: '#050507',      // Quase preto puro
          50: '#0c0c14',           // Card background
          100: '#111118',          // Card hover / secondary
          200: '#18181f',          // Inputs
          300: '#222230',          // Borders sutis
          400: '#2d2d3d',          // Borders hover
          500: '#3a3a4e',          // Borders active
        },
        gold: {
          DEFAULT: '#f0b840',      // Dourado mais quente (como astroma)
          light: '#f5d470',
          dark: '#d4940c',
          muted: '#9a7620',
        },
        cream: {
          DEFAULT: '#f5f5f5',      // Branco puro para títulos
          light: '#ffffff',
          dark: '#a0a0b0',        // Texto secundário (mais cinza-azulado)
        },
        muted: '#6b6b80',          // Texto terciário
        // Brand = gold
        brand: {
          50: '#fefbeb',
          100: '#fdf3c7',
          200: '#fce68a',
          300: '#fbd34d',
          400: '#f0b840',
          500: '#d4940c',
          600: '#b47808',
          700: '#8a5c0a',
          800: '#6d490e',
          900: '#4a3210',
        },
        // Element colors (vibrantes para fundo preto)
        fire: '#ff5555',
        earth: '#55dd55',
        air: '#55aaff',
        water: '#ffaa44',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        astro: ['Noto Sans Symbols 2', 'serif'],
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #d4940c 0%, #f0b840 50%, #f5d470 100%)',
        'gradient-dark': 'linear-gradient(180deg, #050507 0%, #0c0c14 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(12,12,20,0.8) 0%, rgba(17,17,24,0.6) 100%)',
        'gradient-glow': 'radial-gradient(ellipse at center, rgba(240,184,64,0.08) 0%, transparent 70%)',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(240, 184, 64, 0.15)',
        'gold-lg': '0 0 40px rgba(240, 184, 64, 0.25)',
        'gold-glow': '0 0 60px rgba(240, 184, 64, 0.12), 0 0 20px rgba(240, 184, 64, 0.08)',
        'card': '0 4px 30px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(240, 184, 64, 0.05)',
      },
      borderColor: {
        DEFAULT: 'rgba(255, 255, 255, 0.06)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
};
