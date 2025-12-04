/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-dark": "#020617",
        "card-dark": "#020617",
        "accent": "#22c55e"
      }
    }
  },
  plugins: []
};


