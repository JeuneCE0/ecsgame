import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ecs: {
          black: '#0C0C0C',
          'black-light': '#141414',
          'black-card': '#1A1A1A',
          amber: '#FFBF00',
          orange: '#FF9D00',
          gray: {
            DEFAULT: '#888888',
            dark: '#333333',
            border: '#2A2A2A',
          },
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Rajdhani', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
        pixel: ['var(--font-pixel)', '"Press Start 2P"', 'monospace'],
      },
      borderRadius: {
        lg: '16px',
        md: '12px',
        sm: '8px',
      },
      boxShadow: {
        'amber-glow': '0 0 20px rgba(255, 191, 0, 0.15)',
        'amber-glow-lg': '0 0 40px rgba(255, 191, 0, 0.2)',
      },
      backgroundImage: {
        'gradient-amber': 'linear-gradient(135deg, #FFBF00, #FF9D00)',
        'gradient-amber-hover': 'linear-gradient(135deg, #FFD000, #FFAD10)',
      },
    },
  },
  plugins: [],
};

export default config;
