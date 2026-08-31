/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E07A5F',
          50: '#FDF2EF',
          100: '#FBE5DF',
          200: '#F7CAC0',
          300: '#F3B0A1',
          400: '#EF9682',
          500: '#E07A5F',
          600: '#C95D3E',
          700: '#A34A30',
          800: '#7D3724',
          900: '#572418',
        },
        secondary: {
          DEFAULT: '#3D405B',
          50: '#E8E9EF',
          100: '#C5C7D3',
          200: '#A2A5B7',
          300: '#7F839B',
          400: '#5C617F',
          500: '#3D405B',
          600: '#2E2F45',
          700: '#1F2030',
          800: '#10111A',
          900: '#010104',
        },
        accent: {
          DEFAULT: '#81B29A',
          50: '#F0F5F2',
          100: '#DDEBE3',
          200: '#BBD7C7',
          300: '#99C3AB',
          400: '#81B29A',
          500: '#5A9A73',
          600: '#3D7A52',
          700: '#2A5538',
          800: '#17311D',
          900: '#040D05',
        },
        cream: '#F4F1DE',
        'warm-gray': '#E8E4D9',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}