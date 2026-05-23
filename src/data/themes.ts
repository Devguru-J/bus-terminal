/**
 * 노선 스타일(테마) 카탈로그. 환승센터에서 한 번에 적용.
 */
export interface RouteTheme {
    id: string;
    ko: string;
    description: string;
    background: string;
    foreground: string;
    cursor: string;
    selectionBg: string;
    selectionFg: string;
    palette16: string[]; // 8 normal + 8 bright
    accent: string;
}

export const themes: RouteTheme[] = [
    {
        id: "tokyo-night",
        ko: "도쿄 야간선",
        description: "심야의 도쿄. 보라빛 형광등 같은 톤.",
        background: "#1a1b26",
        foreground: "#c0caf5",
        cursor: "#9b8cff",
        selectionBg: "#283457",
        selectionFg: "#ffffff",
        accent: "#9b8cff",
        palette16: [
            "#15161e", "#f7768e", "#9ece6a", "#e0af68",
            "#7aa2f7", "#bb9af7", "#7dcfff", "#a9b1d6",
            "#414868", "#f7768e", "#9ece6a", "#e0af68",
            "#7aa2f7", "#bb9af7", "#7dcfff", "#c0caf5"
        ]
    },
    {
        id: "gruvbox-dark",
        ko: "그루브박스 시내노선",
        description: "따뜻한 갈색 톤. 눈이 편안한 클래식.",
        background: "#282828",
        foreground: "#ebdbb2",
        cursor: "#fe8019",
        selectionBg: "#504945",
        selectionFg: "#ebdbb2",
        accent: "#b8bb26",
        palette16: [
            "#282828", "#cc241d", "#98971a", "#d79921",
            "#458588", "#b16286", "#689d6a", "#a89984",
            "#928374", "#fb4934", "#b8bb26", "#fabd2f",
            "#83a598", "#d3869b", "#8ec07c", "#ebdbb2"
        ]
    },
    {
        id: "catppuccin-mocha",
        ko: "카푸치노 모카선",
        description: "달콤한 모카 라떼. 부드럽고 따뜻한 파스텔.",
        background: "#1e1e2e",
        foreground: "#cdd6f4",
        cursor: "#f5e0dc",
        selectionBg: "#585b70",
        selectionFg: "#cdd6f4",
        accent: "#cba6f7",
        palette16: [
            "#45475a", "#f38ba8", "#a6e3a1", "#f9e2af",
            "#89b4fa", "#cba6f7", "#94e2d5", "#bac2de",
            "#585b70", "#f38ba8", "#a6e3a1", "#f9e2af",
            "#89b4fa", "#cba6f7", "#94e2d5", "#a6adc8"
        ]
    },
    {
        id: "nord",
        ko: "노르드 북극선",
        description: "북극 얼음의 청량함. 차분한 블루.",
        background: "#2e3440",
        foreground: "#d8dee9",
        cursor: "#88c0d0",
        selectionBg: "#434c5e",
        selectionFg: "#eceff4",
        accent: "#88c0d0",
        palette16: [
            "#3b4252", "#bf616a", "#a3be8c", "#ebcb8b",
            "#81a1c1", "#b48ead", "#88c0d0", "#e5e9f0",
            "#4c566a", "#bf616a", "#a3be8c", "#ebcb8b",
            "#81a1c1", "#b48ead", "#8fbcbb", "#eceff4"
        ]
    },
    {
        id: "rose-pine",
        ko: "로즈파인 정원선",
        description: "장미 정원의 황혼. 부드러운 핑크와 머스타드.",
        background: "#191724",
        foreground: "#e0def4",
        cursor: "#eb6f92",
        selectionBg: "#403d52",
        selectionFg: "#e0def4",
        accent: "#eb6f92",
        palette16: [
            "#26233a", "#eb6f92", "#31748f", "#f6c177",
            "#9ccfd8", "#c4a7e7", "#ebbcba", "#e0def4",
            "#6e6a86", "#eb6f92", "#31748f", "#f6c177",
            "#9ccfd8", "#c4a7e7", "#ebbcba", "#e0def4"
        ]
    },
    {
        id: "solarized-light",
        ko: "솔라라이즈드 주간선",
        description: "한낮의 햇살. 종이같은 라이트 톤.",
        background: "#fdf6e3",
        foreground: "#586e75",
        cursor: "#cb4b16",
        selectionBg: "#eee8d5",
        selectionFg: "#586e75",
        accent: "#268bd2",
        palette16: [
            "#073642", "#dc322f", "#859900", "#b58900",
            "#268bd2", "#d33682", "#2aa198", "#eee8d5",
            "#002b36", "#cb4b16", "#586e75", "#657b83",
            "#839496", "#6c71c4", "#93a1a1", "#fdf6e3"
        ]
    }
];

export function themeToConfigSnippet(t: RouteTheme): string {
    const lines: string[] = [];
    lines.push(`# 노선 스타일: ${t.ko}`);
    lines.push(`background = ${t.background.replace("#", "")}`);
    lines.push(`foreground = ${t.foreground.replace("#", "")}`);
    lines.push(`cursor-color = ${t.cursor.replace("#", "")}`);
    lines.push(`selection-background = ${t.selectionBg.replace("#", "")}`);
    lines.push(`selection-foreground = ${t.selectionFg.replace("#", "")}`);
    t.palette16.forEach((c, i) => lines.push(`palette = ${i}=${c}`));
    return lines.join("\n");
}
