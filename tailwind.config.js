/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        slideIn: {
          from: { transform: 'translateX(20px)', opacity: '0' },
          to:   { transform: 'translateX(0)',     opacity: '1' },
        },
        livePulse: {
          '0%,100%': { opacity: '1' },
          '50%':      { opacity: '0.3' },
        },
        dotPulse: {
          '0%,100%': { opacity: '1' },
          '50%':      { opacity: '0.2' },
        },
        ringPulse: {
          '0%':   { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2)',   opacity: '0' },
        },
        badgeBlink: {
          '0%,100%': { opacity: '1' },
          '50%':      { opacity: '0.65' },
        },
        orbFloat1: {
          from: { transform: 'translate(0,0) scale(1)' },
          to:   { transform: 'translate(-5%,8%) scale(1.1)' },
        },
        orbFloat2: {
          from: { transform: 'translate(0,0)' },
          to:   { transform: 'translate(6%,-6%) scale(1.08)' },
        },
        spinLoop: { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'slide-up':    'slideUp 0.25s cubic-bezier(0.22,1,0.36,1)',
        'slide-in':    'slideIn 0.2s ease',
        'live-pulse':  'livePulse 1.5s infinite',
        'live-pill':   'livePulse 1.6s infinite',
        'dot-pulse':   'dotPulse 1s infinite',
        'ring-pulse':  'ringPulse 1.8s ease-out infinite',
        'badge-blink': 'badgeBlink 2s infinite',
        'orb-1':       'orbFloat1 10s ease-in-out infinite alternate',
        'orb-2':       'orbFloat2 12s ease-in-out infinite alternate',
        'spin-fast':   'spinLoop 0.75s linear infinite',
        'spin-slow':   'spinLoop 0.8s linear infinite',
      },
    },
  },
  plugins: [],
}
