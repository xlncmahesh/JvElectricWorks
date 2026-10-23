/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#070b14',
          900: '#0b1220',
          800: '#131c2e',
          700: '#1e293b',
          600: '#2d3e55',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
        },
        electric: {
          50:  '#ecf6ff',
          100: '#d6ecff',
          200: '#a9d6ff',
          300: '#6cb8ff',
          400: '#3a9bff',
          500: '#0f7aff',
          600: '#0060e0',
          700: '#004db0',
          800: '#003d8a',
          900: '#002a60',
        },
        solar: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        teal: {
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        success: { 500: '#10b981', 600: '#059669' },
        warning: { 500: '#f59e0b', 600: '#d97706' },
        danger:  { 500: '#ef4444', 600: '#dc2626' },
      },
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        glow:         '0 0 0 1px rgba(15,122,255,0.2), 0 8px 32px -8px rgba(15,122,255,0.4)',
        'glow-solar': '0 0 0 1px rgba(245,158,11,0.2), 0 8px 32px -8px rgba(245,158,11,0.35)',
        card:         '0 1px 2px rgba(2,6,23,0.5), 0 12px 32px -12px rgba(2,6,23,0.7)',
        'card-hover': '0 1px 2px rgba(2,6,23,0.5), 0 20px 48px -16px rgba(15,122,255,0.3)',
        inner:        'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      backgroundImage: {
        'grid-faint': 'linear-gradient(to right,rgba(148,163,184,0.05) 1px,transparent 1px),linear-gradient(to bottom,rgba(148,163,184,0.05) 1px,transparent 1px)',
        'hero-glow':  'radial-gradient(ellipse 80% 60% at 50% -10%,rgba(15,122,255,0.18) 0%,transparent 70%)',
        'solar-glow': 'radial-gradient(ellipse 80% 60% at 50% -10%,rgba(245,158,11,0.18) 0%,transparent 70%)',
      },
      backgroundSize: { grid: '48px 48px' },
      keyframes: {
        'fade-up':   { '0%': { opacity: '0', transform: 'translateY(14px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'fade-in':   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        shimmer:     { '100%': { transform: 'translateX(200%)' } },
      },
      animation: {
        'fade-up':  'fade-up 0.55s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in':  'fade-in 0.4s ease both',
        shimmer:    'shimmer 1.5s infinite',
      },
      typography: {},
    },
  },
  plugins: [],
};
