/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sidebar / navegación (azul marino oscuro para contraste)
        sidebar: '#0f172a',
        'sidebar-surface': '#1e293b',

        // Área principal (fondo claro y blanco)
        background: '#f8fafc',
        surface: '#ffffff',

        // Colores institucionales
        primary: '#0284c7',      // Sky-600 - Azul institucional
        'primary-dark': '#0369a1', // Sky-700
        secondary: '#10b981',    // Emerald-500 - Verde costero
        accent: '#f59e0b',       // Amber-500 - Amarillo sol

        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
