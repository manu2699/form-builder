import type { Config } from "tailwindcss";

export default {
    content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
    theme: {
        extend: {
            borderRadius: {
                none: "0",
                DEFAULT: "0",
            },
            fontSize: {
                base: "16px",
            },
        },
    },
    plugins: [],
} satisfies Config;
