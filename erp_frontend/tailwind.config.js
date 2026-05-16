/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        dark: { 950: '#030712', 900: '#0a0f1e', 800: '#0f172a', 700: '#1e293b', 600: '#334155' },
        cyan: { 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2' },
        emerald: { 400: '#34d399', 500: '#10b981' },
        rose: { 400: '#fb7185', 500: '#f43f5e' },
        amber: { 400: '#fbbf24', 500: '#f59e0b' },
        violet: { 400: '#a78bfa', 500: '#8b5cf6' },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(6,182,212,0.3)',
        'glow-emerald': '0 0 20px rgba(16,185,129,0.3)',
        'glow-rose': '0 0 20px rgba(244,63,94,0.3)',
        'glow-violet': '0 0 20px rgba(139,92,246,0.3)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
}
