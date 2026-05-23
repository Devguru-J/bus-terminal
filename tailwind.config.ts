import type {Config} from "tailwindcss";

/**
 * BusTerminal design system (Stitch v2)
 * M3-style surface hierarchy + terminal green primary
 */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                background: "#131313",
                surface: "#131313",
                "surface-dim": "#131313",
                "surface-bright": "#3a3939",
                "surface-container-lowest": "#0e0e0e",
                "surface-container-low": "#1c1b1b",
                "surface-container": "#201f1f",
                "surface-container-high": "#2a2a2a",
                "surface-container-highest": "#353534",
                "surface-variant": "#353534",
                "inverse-surface": "#e5e2e1",

                primary: "#edffe8",
                "primary-fixed": "#6bff83",
                "primary-fixed-dim": "#00e55b",
                "primary-container": "#00ff66",
                "on-primary": "#003911",
                "on-primary-fixed": "#002107",
                "on-primary-fixed-variant": "#00531b",
                "on-primary-container": "#007128",
                "inverse-primary": "#006e27",
                "surface-tint": "#00e55b",

                secondary: "#a6e6ff",
                "secondary-fixed": "#b7eaff",
                "secondary-fixed-dim": "#4cd6ff",
                "secondary-container": "#14d1ff",
                "on-secondary": "#003543",
                "on-secondary-fixed": "#001f28",
                "on-secondary-fixed-variant": "#004e60",
                "on-secondary-container": "#00566b",

                tertiary: "#fff9f4",
                "tertiary-fixed": "#ffdea5",
                "tertiary-fixed-dim": "#e7c17d",
                "tertiary-container": "#ffd892",
                "on-tertiary": "#412d00",
                "on-tertiary-fixed": "#271900",
                "on-tertiary-fixed-variant": "#5c4209",
                "on-tertiary-container": "#795d23",

                "on-surface": "#e5e2e1",
                "on-surface-variant": "#b9ccb5",
                "on-background": "#e5e2e1",
                "inverse-on-surface": "#313030",
                outline: "#849581",
                "outline-variant": "#3b4b3a",

                error: "#ffb4ab",
                "error-container": "#93000a",
                "on-error": "#690005",
                "on-error-container": "#ffdad6"
            },
            fontFamily: {
                display: ["Geist", "system-ui", "sans-serif"],
                body: ["Hanken Grotesk", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
            },
            fontSize: {
                "label-xs": [
                    "11px",
                    {lineHeight: "1", letterSpacing: "0.08em", fontWeight: "600"}
                ],
                "code-sm": ["14px", {lineHeight: "1.5", fontWeight: "400"}],
                "headline-sm": [
                    "20px",
                    {lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: "500"}
                ],
                "body-md": [
                    "16px",
                    {lineHeight: "1.6", letterSpacing: "0", fontWeight: "400"}
                ],
                "display-md": [
                    "32px",
                    {lineHeight: "1.2", letterSpacing: "-0.03em", fontWeight: "600"}
                ],
                "display-lg": [
                    "48px",
                    {lineHeight: "1.1", letterSpacing: "-0.04em", fontWeight: "700"}
                ]
            },
            borderRadius: {
                DEFAULT: "0.25rem",
                lg: "0.5rem",
                xl: "0.75rem"
            },
            spacing: {
                gutter: "24px"
            },
            boxShadow: {
                "glow-primary":
                    "0 0 20px rgba(0,229,91,0.18), 0 0 60px -10px rgba(0,229,91,0.25)",
                "glow-soft":
                    "0 0 0 1px rgba(0,229,91,0.18), 0 12px 40px -16px rgba(0,229,91,0.35)"
            },
            keyframes: {
                flicker: {
                    "0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%": {opacity: "1"},
                    "20%, 24%, 55%": {opacity: "0.55"}
                },
                "drive-bus": {
                    "0%": {transform: "translateX(-110%) scale(0.92)", opacity: "0"},
                    "20%": {opacity: "1"},
                    "80%": {opacity: "1"},
                    "100%": {transform: "translateX(210%) scale(0.92)", opacity: "0"}
                },
                "pulse-dot": {
                    "0%,100%": {opacity: "1", transform: "scale(1)"},
                    "50%": {opacity: "0.45", transform: "scale(0.92)"}
                }
            },
            animation: {
                flicker: "flicker 2.4s infinite",
                "drive-bus": "drive-bus 3.6s ease-in-out infinite",
                "pulse-dot": "pulse-dot 1.6s ease-in-out infinite"
            }
        }
    },
    plugins: []
} satisfies Config;
