import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            colors: {
                industrial: {
                    white: "#F5F5F5",
                    grey: "#2A2A2A",
                    red: "#8B0000",
                },
            },
            boxShadow: {
                brutal: "4px 4px 0px 0px #2A2A2A",
            },
        },
    },

    plugins: [forms],
};
