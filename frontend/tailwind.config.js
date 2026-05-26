/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        // High-end Dashboard Colors
        brand: {
          dark: '#060912',     /* Deep Sidebar Background */
          navy: '#0B1120',     /* Sidebar Gradient End */
          electric: '#3b82f6', /* The Neon Blue */
        }
      },
      boxShadow: {
        // Custom Neon Glows
        'neon-blue': '0 0 15px rgba(59, 130, 246, 0.5)',
        'premium-glass': '0 20px 50px -12px rgba(0, 0, 0, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
        premium: '12px',
      }
    },
  },
  plugins: [],
}