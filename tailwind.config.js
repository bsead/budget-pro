/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#137fec",
            },
            fontFamily: {
                sans: ['Public Sans', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
