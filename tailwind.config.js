/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#3E442B',
        'primary-foreground': '#FFFFFF',
        'secondary': '#6A7062',
        'secondary-foreground': '#FFFFFF',
        'accent': '#8D909B',
        'accent-foreground': '#FFFFFF',
        'destructive': '#FF4444',
        'destructive-foreground': '#FFFFFF',
        'background': '#FFFFFF',
        'darkBg': '#3E442B',
        'lightBg': '#F9FAFB',
        'oddBlock': '#AAADC4',
        'evenBlock': '#D6EEFF',
        'oddBlockDark': '#6A7062',
        'evenBlockDark': '#8D909B',
        'textDark': '#3E442B',
        'textLight': '#D6EEFF',
        
        // Additional shortcuts for the new color scheme
        'drab-brown': '#3E442B',
        'ebony': '#6A7062',
        'cool-gray': '#8D909B',
        'cool-gray-light': '#AAADC4',
        'columbia-blue': '#D6EEFF',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'custom': '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
        'custom-hover': '0 10px 25px 0 rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    function({ addBase }) {
      addBase({
        ':root': {
          '--color-primary': '#3E442B',
          '--color-primary-foreground': '#FFFFFF',
          '--color-secondary': '#6A7062',
          '--color-secondary-foreground': '#FFFFFF',
          '--color-accent': '#8D909B',
          '--color-accent-foreground': '#FFFFFF',
          '--color-destructive': '#FF4444',
          '--color-destructive-foreground': '#FFFFFF',
          '--color-background': '#FFFFFF',
          '--color-dark-bg': '#3E442B',
          '--color-light-bg': '#F9FAFB',
          '--color-odd-block': '#AAADC4',
          '--color-even-block': '#D6EEFF',
          '--color-odd-block-dark': '#6A7062',
          '--color-even-block-dark': '#8D909B',
          '--color-text-dark': '#3E442B',
          '--color-text-light': '#D6EEFF',
        },
        '.dark': {
          '--color-primary': '#D6EEFF',
          '--color-primary-foreground': '#3E442B',
          '--color-secondary': '#AAADC4',
          '--color-secondary-foreground': '#3E442B',
          '--color-background': '#3E442B',
          '--color-text-primary': '#D6EEFF',
        },
      });
    },
  ],
}
