/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Mission Control — layered deep-navy backgrounds make cyan/blue glow.
        void: '#04070D',
        surface: '#0A0F1C',
        panel: '#111827',
        hover: '#172033',
        border: '#1b2436',
        // Brand: blue → cyan → violet.
        accent: {
          DEFAULT: '#3B82F6', // electric blue — trust, intelligence
          dim: '#2563EB',
          glow: 'rgba(59,130,246,0.35)',
        },
        cyan: '#06B6D4',   // live data, signals, discovery
        violet: '#8B5CF6', // AI, innovation, ideas
        gold: '#FBBF24',   // rare / high-opportunity / premium ONLY
        // Semantic
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        flow: '#06B6D4',   // flow == live discovery → cyan
        muted: '#5b6b86',
        text: {
          primary: '#EAF1FF',
          secondary: '#8da0bf',
        },
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'breathe': 'breathe 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 8px rgba(59,130,246,0.25)' },
          '100%': { boxShadow: '0 0 28px rgba(6,182,212,0.55)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.04)', opacity: '1' },
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)',
        'grid-pattern': 'linear-gradient(rgba(59,130,246,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.035) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '44px 44px',
      },
    },
  },
  plugins: [],
};
