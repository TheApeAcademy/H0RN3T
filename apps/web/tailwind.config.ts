import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        hornet: {
          gold: '#FFD700',
          amber: '#FF8C00',
          black: '#0A0A0A',
          dark: '#111111',
          panel: '#141414',
          border: '#1E1E1E',
          muted: '#333333',
          text: '#E8E8E8',
          dim: '#888888',
          red: 'hsl(0, 85%, 55%)',
          yellow: 'hsl(52, 100%, 50%)',
          green: 'hsl(142, 76%, 45%)',
          critical: '#FF2222',
          high: '#FF6600',
          medium: '#FFB300',
          low: '#00CC66',
          info: '#4488FF',
        },
      },
      fontFamily: {
        mono: ['Space Mono', 'JetBrains Mono', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hornet-grid': `linear-gradient(rgba(255,215,0,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,215,0,0.03) 1px, transparent 1px)`,
        'scanline': `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0,0,0,0.05) 2px,
          rgba(0,0,0,0.05) 4px
        )`,
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'slide-in': 'slide-in 0.4s ease-out forwards',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255,215,0,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(255,215,0,0.7)' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'gold': '0 0 20px rgba(255,215,0,0.3)',
        'gold-lg': '0 0 40px rgba(255,215,0,0.5)',
        'panel': '0 4px 24px rgba(0,0,0,0.6)',
        'inset-gold': 'inset 0 0 20px rgba(255,215,0,0.05)',
      },
    },
  },
  plugins: [],
}

export default config
