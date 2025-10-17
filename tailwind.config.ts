import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './providers/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      colors: {
        primary: {
          50: '#e6f4ef',
          100: '#c5e4d7',
          200: '#a4d5c0',
          300: '#83c6a8',
          400: '#62b790',
          500: '#159765',
          600: '#147a57',
          700: '#125f46',
          800: '#0f3d2e',
          900: '#0b241c'
        },
        grayui: {
          50: '#f8fafc',
          100: '#e2e8f0',
          200: '#cbd5f5',
          300: '#94a3b8',
          400: '#64748b',
          500: '#475569',
          600: '#334155',
          700: '#1e293b',
          800: '#16213b',
          900: '#0f172a'
        },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444'
      },
      borderRadius: {
        xl: '16px',
        '2xl': '24px'
      },
      boxShadow: {
        soft: '0 15px 40px rgba(15,61,46,0.15)'
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #159765 0%, #0f3d2e 100%)'
      }
    }
  },
  plugins: [forms]
};

export default config;
