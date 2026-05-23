import type {Config} from "tailwindcss";

export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                // 터미널/교통 안내판 팔레트
                ink: {
                    900: "#07090b",
                    800: "#0b0f12",
                    700: "#11161b",
                    600: "#181f26",
                    500: "#222b34",
                    400: "#2c3744"
                },
                line: {
                    DEFAULT: "rgba(255,255,255,0.06)",
                    strong: "rgba(255,255,255,0.12)"
                },
                // LED 출발 전광판 색
                led: {
                    amber: "#ffb02e",
                    green: "#00e0a4",
                    red: "#ff4f5e",
                    blue: "#5cb6ff"
                },
                // 노선 색 (서울 지하철 톤)
                route: {
                    ghostty: "#9b8cff",
                    tmux: "#00e0a4",
                    theme: "#ffb02e",
                    saved: "#5cb6ff"
                }
            },
            fontFamily: {
                sans: [
                    "Pretendard Variable",
                    "Pretendard",
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "system-ui",
                    "Roboto",
                    "sans-serif"
                ],
                mono: [
                    "JetBrains Mono",
                    "ui-monospace",
                    "SFMono-Regular",
                    "Menlo",
                    "monospace"
                ]
            },
            borderRadius: {
                xl2: "1.25rem"
            },
            boxShadow: {
                glass:
                    "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 30px 60px -20px rgba(0,0,0,0.6)",
                led:
                    "0 0 0 1px rgba(255,176,46,0.4), 0 0 24px -4px rgba(255,176,46,0.45)"
            },
            keyframes: {
                blink: {
                    "0%,49%": {opacity: "1"},
                    "50%,100%": {opacity: "0.35"}
                },
                scrollX: {
                    "0%": {transform: "translateX(0)"},
                    "100%": {transform: "translateX(-50%)"}
                }
            },
            animation: {
                blink: "blink 1.2s steps(2,end) infinite",
                marquee: "scrollX 28s linear infinite"
            }
        }
    },
    plugins: []
} satisfies Config;
