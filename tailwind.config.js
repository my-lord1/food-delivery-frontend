/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}", // <--- THIS line tells Tailwind where to find your padding/margin classes
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }