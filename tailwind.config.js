/** Configuración de Tailwind: colores y tipografías de la marca. */
module.exports = {
  content: ['./*.html', './js/*.js'],
  theme: {
    extend: {
      colors: {
        forest: { 50: '#f2f6f4', 100: '#e1ede6', 500: '#3a6652', 600: '#2c4c3b', 800: '#16261e', 900: '#0f1a14' },
        sand: { 50: '#fcfaf7', 100: '#f4f1eb', 200: '#e8e2d5', 300: '#d5cbb3' },
        wood: { 500: '#a89481', 600: '#8c7763', 700: '#6e5a47' }
      },
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif']
      }
    }
  }
};
