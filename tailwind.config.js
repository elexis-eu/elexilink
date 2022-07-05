module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        blue: '#004494',
        lightblue: '#FFFFFF',
        link: '#0077FF',
        lavender: '#E2EBF9',
        marine: '#082A62',
        midnight: '#0C1729',
        darkgray: '#475161',
        lightgray: '#AEB6BF',
        similarity: {
          exact: '#15EAD1',
          broader: '#FA5674',
          narrower: '#FFE710',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
      },
      container: {
        center: true,
        padding: '2rem',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
