/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta de marca
        arena: '#F5EFE0', // fondo
        salvia: '#8A9E9A', // secundario
        jade: '#4E7E7A', // texto / acento
        pino: '#1E5050', // encabezados
        bosque: '#163D3D', // premium / profundo
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Lato', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        suave: '0 10px 30px -12px rgba(22, 61, 61, 0.25)',
      },
      keyframes: {
        respira: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.75' },
          '50%': { transform: 'scale(1.18)', opacity: '1' },
        },
        aparece: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        respira: 'respira 8s ease-in-out infinite',
        aparece: 'aparece 0.5s ease-out both',
      },
    },
  },
  plugins: [],
}
