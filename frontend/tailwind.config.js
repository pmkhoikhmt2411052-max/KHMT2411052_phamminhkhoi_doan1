/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Design tokens — khớp CSS variables trong src/index.css và ConfigProvider.
        primary: '#183BFF',
        'primary-hover': '#345BFF',
        surface: '#EAF0FF',
        ink: '#171923',
        muted: '#697386',
        line: '#E5E7EB',
        // Giữ alias `brand.*` để các component cũ dùng lại palette mới.
        brand: {
          50: '#EAF0FF',
          100: '#D9E4FF',
          500: '#345BFF',
          600: '#183BFF',
          700: '#0F2EDB',
        },
      },
    },
  },
  plugins: [],
}
