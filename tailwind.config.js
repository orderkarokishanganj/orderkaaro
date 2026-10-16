/** @type {import('tailwindcss').Config} */
// Sage & Oat design tokens. See docs/design-system.md.
export default {
  // src/components holds the old pre-rebuild components, kept until cleanup; they are not rendered.
  content: ['./index.html', './src/**/*.{ts,tsx}', '!./src/components/**'],
  theme: {
    extend: {
      colors: {
        oat: '#F4EFE7',
        'sage-mist': '#E3E9DF',
        'sage-plate': '#EEF1EA',
        sage: { DEFAULT: '#4E6E58', dark: '#36503F', soft: '#E8EFE9' },
        ink: { DEFAULT: '#2C2A25', soft: '#45433D' },
        stone: '#6B675E',
        line: '#E4DDD1',
        peach: '#F3DCCF',
        clay: '#8A4630',
        out: { bg: '#EEEAE3', ink: '#4A463F' },
        danger: { bg: '#FBE3DE', ink: '#8C2F1E' },
        // Chart marks only: a richer step of sage that passes the chroma check (sage alone reads grey).
        chart: '#2F7A50',
      },
      fontFamily: {
        display: ['Fraunces', '"Tiro Devanagari Hindi"', 'serif'],
        body: ['Hind', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '22px',
        panel: '26px',
        plate: '16px',
      },
      boxShadow: {
        float: '0 10px 30px rgba(44, 42, 37, 0.22)',
      },
      maxWidth: {
        shop: '72rem',
      },
    },
  },
  plugins: [],
};
