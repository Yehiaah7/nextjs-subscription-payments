const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'pages/**/*.{ts,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        container: 'var(--color-container)',
        primary: 'var(--color-primary)',
        'primary-soft': 'var(--color-primary-soft)',
        'surface-muted': 'var(--color-surface-muted)',
        'surface-soft': 'var(--color-surface-soft)',
        border: 'var(--color-border)',
        text: 'var(--color-text-main)',
        muted: 'var(--color-text-subtle)'
      },
      borderRadius: {
        card: 'var(--radius-card)',
        pill: 'var(--radius-pill)',
        button: 'var(--radius-button)'
      },
      boxShadow: {
        button: 'var(--shadow-button)',
        card: 'var(--shadow-card)'
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans]
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
