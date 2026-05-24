/**
 * 노선 스타일(테마) 카탈로그. 환승센터에서 한 번에 적용.
 * palette16: [black, red, green, yellow, blue, magenta, cyan, white,
 *             br-black, br-red, br-green, br-yellow, br-blue, br-magenta, br-cyan, br-white]
 */

export type ThemeTag = "dark" | "light" | "popular" | "minimal" | "retro" | "new" | "high-contrast";

export interface RouteTheme {
    id: string;
    ko: string;
    description: string;
    author?: string;
    background: string;
    foreground: string;
    cursor: string;
    selectionBg: string;
    selectionFg: string;
    palette16: string[];
    accent: string;
    tags: ThemeTag[];
}

export const themes: RouteTheme[] = [
    // --- Tokyo Night family ---
    {
        id: "tokyo-night",
        ko: "Tokyo Night",
        description: "심야의 도쿄. 보라빛 형광등 같은 톤.",
        author: "Folke Lemaitre",
        background: "#1a1b26",
        foreground: "#c0caf5",
        cursor: "#9b8cff",
        selectionBg: "#283457",
        selectionFg: "#ffffff",
        accent: "#9b8cff",
        tags: ["dark", "popular"],
        palette16: [
            "#15161e", "#f7768e", "#9ece6a", "#e0af68",
            "#7aa2f7", "#bb9af7", "#7dcfff", "#a9b1d6",
            "#414868", "#f7768e", "#9ece6a", "#e0af68",
            "#7aa2f7", "#bb9af7", "#7dcfff", "#c0caf5"
        ]
    },
    {
        id: "tokyo-night-storm",
        ko: "Tokyo Night Storm",
        description: "비 내리는 도쿄. 깊은 청남빛.",
        author: "Folke Lemaitre",
        background: "#24283b",
        foreground: "#c0caf5",
        cursor: "#c0caf5",
        selectionBg: "#364a82",
        selectionFg: "#ffffff",
        accent: "#7aa2f7",
        tags: ["dark"],
        palette16: [
            "#1d202f", "#f7768e", "#9ece6a", "#e0af68",
            "#7aa2f7", "#bb9af7", "#7dcfff", "#a9b1d6",
            "#414868", "#f7768e", "#9ece6a", "#e0af68",
            "#7aa2f7", "#bb9af7", "#7dcfff", "#c0caf5"
        ]
    },
    {
        id: "tokyo-night-moon",
        ko: "Tokyo Night Moon",
        description: "달빛 도쿄. 약간 더 밝은 변종.",
        author: "Folke Lemaitre",
        background: "#222436",
        foreground: "#c8d3f5",
        cursor: "#c8d3f5",
        selectionBg: "#2d3f76",
        selectionFg: "#ffffff",
        accent: "#82aaff",
        tags: ["dark", "new"],
        palette16: [
            "#1b1d2b", "#ff757f", "#c3e88d", "#ffc777",
            "#82aaff", "#c099ff", "#86e1fc", "#828bb8",
            "#444a73", "#ff757f", "#c3e88d", "#ffc777",
            "#82aaff", "#c099ff", "#86e1fc", "#c8d3f5"
        ]
    },

    // --- Catppuccin family ---
    {
        id: "catppuccin-mocha",
        ko: "Catppuccin Mocha",
        description: "달콤한 모카 라떼. 부드럽고 따뜻한 파스텔.",
        author: "catppuccin",
        background: "#1e1e2e",
        foreground: "#cdd6f4",
        cursor: "#f5e0dc",
        selectionBg: "#585b70",
        selectionFg: "#cdd6f4",
        accent: "#cba6f7",
        tags: ["dark", "popular"],
        palette16: [
            "#45475a", "#f38ba8", "#a6e3a1", "#f9e2af",
            "#89b4fa", "#cba6f7", "#94e2d5", "#bac2de",
            "#585b70", "#f38ba8", "#a6e3a1", "#f9e2af",
            "#89b4fa", "#cba6f7", "#94e2d5", "#a6adc8"
        ]
    },
    {
        id: "catppuccin-macchiato",
        ko: "Catppuccin Macchiato",
        description: "마키아토. 모카보다 약간 더 따뜻.",
        author: "catppuccin",
        background: "#24273a",
        foreground: "#cad3f5",
        cursor: "#f4dbd6",
        selectionBg: "#5b6078",
        selectionFg: "#cad3f5",
        accent: "#c6a0f6",
        tags: ["dark"],
        palette16: [
            "#494d64", "#ed8796", "#a6da95", "#eed49f",
            "#8aadf4", "#c6a0f6", "#8bd5ca", "#b8c0e0",
            "#5b6078", "#ed8796", "#a6da95", "#eed49f",
            "#8aadf4", "#c6a0f6", "#8bd5ca", "#a5adcb"
        ]
    },
    {
        id: "catppuccin-frappe",
        ko: "Catppuccin Frappé",
        description: "프라페. 차가운 디저트 같은 푸른빛.",
        author: "catppuccin",
        background: "#303446",
        foreground: "#c6d0f5",
        cursor: "#f2d5cf",
        selectionBg: "#626880",
        selectionFg: "#c6d0f5",
        accent: "#ca9ee6",
        tags: ["dark"],
        palette16: [
            "#51576d", "#e78284", "#a6d189", "#e5c890",
            "#8caaee", "#ca9ee6", "#81c8be", "#b5bfe2",
            "#626880", "#e78284", "#a6d189", "#e5c890",
            "#8caaee", "#ca9ee6", "#81c8be", "#a5adce"
        ]
    },
    {
        id: "catppuccin-latte",
        ko: "Catppuccin Latte",
        description: "라이트 라떼. 종이 같은 따뜻한 라이트 톤.",
        author: "catppuccin",
        background: "#eff1f5",
        foreground: "#4c4f69",
        cursor: "#dc8a78",
        selectionBg: "#acb0be",
        selectionFg: "#4c4f69",
        accent: "#8839ef",
        tags: ["light"],
        palette16: [
            "#5c5f77", "#d20f39", "#40a02b", "#df8e1d",
            "#1e66f5", "#8839ef", "#179299", "#acb0be",
            "#6c6f85", "#d20f39", "#40a02b", "#df8e1d",
            "#1e66f5", "#8839ef", "#179299", "#bcc0cc"
        ]
    },

    // --- Gruvbox family ---
    {
        id: "gruvbox-dark",
        ko: "Gruvbox Dark",
        description: "따뜻한 갈색 톤. 눈이 편안한 클래식.",
        author: "morhetz",
        background: "#282828",
        foreground: "#ebdbb2",
        cursor: "#fe8019",
        selectionBg: "#504945",
        selectionFg: "#ebdbb2",
        accent: "#b8bb26",
        tags: ["dark", "retro", "popular"],
        palette16: [
            "#282828", "#cc241d", "#98971a", "#d79921",
            "#458588", "#b16286", "#689d6a", "#a89984",
            "#928374", "#fb4934", "#b8bb26", "#fabd2f",
            "#83a598", "#d3869b", "#8ec07c", "#ebdbb2"
        ]
    },
    {
        id: "gruvbox-light",
        ko: "Gruvbox Light",
        description: "양피지 톤의 라이트 변종.",
        author: "morhetz",
        background: "#fbf1c7",
        foreground: "#3c3836",
        cursor: "#af3a03",
        selectionBg: "#d5c4a1",
        selectionFg: "#3c3836",
        accent: "#79740e",
        tags: ["light", "retro"],
        palette16: [
            "#fbf1c7", "#cc241d", "#98971a", "#d79921",
            "#458588", "#b16286", "#689d6a", "#7c6f64",
            "#928374", "#9d0006", "#79740e", "#b57614",
            "#076678", "#8f3f71", "#427b58", "#3c3836"
        ]
    },

    // --- Nord ---
    {
        id: "nord",
        ko: "Nord",
        description: "북극 얼음의 청량함. 차분한 블루.",
        author: "arcticicestudio",
        background: "#2e3440",
        foreground: "#d8dee9",
        cursor: "#88c0d0",
        selectionBg: "#434c5e",
        selectionFg: "#eceff4",
        accent: "#88c0d0",
        tags: ["dark", "minimal", "popular"],
        palette16: [
            "#3b4252", "#bf616a", "#a3be8c", "#ebcb8b",
            "#81a1c1", "#b48ead", "#88c0d0", "#e5e9f0",
            "#4c566a", "#bf616a", "#a3be8c", "#ebcb8b",
            "#81a1c1", "#b48ead", "#8fbcbb", "#eceff4"
        ]
    },

    // --- Dracula ---
    {
        id: "dracula",
        ko: "Dracula",
        description: "보랏빛 흡혈귀의 밤. 강렬하고 채도 높은.",
        author: "zenorocha",
        background: "#282a36",
        foreground: "#f8f8f2",
        cursor: "#f8f8f2",
        selectionBg: "#44475a",
        selectionFg: "#f8f8f2",
        accent: "#bd93f9",
        tags: ["dark", "popular"],
        palette16: [
            "#21222c", "#ff5555", "#50fa7b", "#f1fa8c",
            "#bd93f9", "#ff79c6", "#8be9fd", "#f8f8f2",
            "#6272a4", "#ff6e6e", "#69ff94", "#ffffa5",
            "#d6acff", "#ff92df", "#a4ffff", "#ffffff"
        ]
    },

    // --- Solarized family ---
    {
        id: "solarized-dark",
        ko: "Solarized Dark",
        description: "정밀하게 설계된 다크 톤. 가독성의 표준.",
        author: "altercation",
        background: "#002b36",
        foreground: "#839496",
        cursor: "#93a1a1",
        selectionBg: "#073642",
        selectionFg: "#93a1a1",
        accent: "#268bd2",
        tags: ["dark", "minimal"],
        palette16: [
            "#073642", "#dc322f", "#859900", "#b58900",
            "#268bd2", "#d33682", "#2aa198", "#eee8d5",
            "#002b36", "#cb4b16", "#586e75", "#657b83",
            "#839496", "#6c71c4", "#93a1a1", "#fdf6e3"
        ]
    },
    {
        id: "solarized-light",
        ko: "Solarized Light",
        description: "한낮의 햇살. 종이 같은 라이트 톤.",
        author: "altercation",
        background: "#fdf6e3",
        foreground: "#586e75",
        cursor: "#cb4b16",
        selectionBg: "#eee8d5",
        selectionFg: "#586e75",
        accent: "#268bd2",
        tags: ["light", "minimal"],
        palette16: [
            "#073642", "#dc322f", "#859900", "#b58900",
            "#268bd2", "#d33682", "#2aa198", "#eee8d5",
            "#002b36", "#cb4b16", "#586e75", "#657b83",
            "#839496", "#6c71c4", "#93a1a1", "#fdf6e3"
        ]
    },

    // --- Rose Pine family ---
    {
        id: "rose-pine",
        ko: "Rosé Pine",
        description: "장미 정원의 황혼. 부드러운 핑크와 머스타드.",
        author: "rose-pine",
        background: "#191724",
        foreground: "#e0def4",
        cursor: "#eb6f92",
        selectionBg: "#403d52",
        selectionFg: "#e0def4",
        accent: "#eb6f92",
        tags: ["dark", "minimal"],
        palette16: [
            "#26233a", "#eb6f92", "#31748f", "#f6c177",
            "#9ccfd8", "#c4a7e7", "#ebbcba", "#e0def4",
            "#6e6a86", "#eb6f92", "#31748f", "#f6c177",
            "#9ccfd8", "#c4a7e7", "#ebbcba", "#e0def4"
        ]
    },
    {
        id: "rose-pine-moon",
        ko: "Rosé Pine Moon",
        description: "달빛 장미 정원. 더 차분한 변종.",
        author: "rose-pine",
        background: "#232136",
        foreground: "#e0def4",
        cursor: "#eb6f92",
        selectionBg: "#44415a",
        selectionFg: "#e0def4",
        accent: "#ea9a97",
        tags: ["dark", "minimal"],
        palette16: [
            "#393552", "#eb6f92", "#3e8fb0", "#f6c177",
            "#9ccfd8", "#c4a7e7", "#ea9a97", "#e0def4",
            "#6e6a86", "#eb6f92", "#3e8fb0", "#f6c177",
            "#9ccfd8", "#c4a7e7", "#ea9a97", "#e0def4"
        ]
    },

    // --- Everforest ---
    {
        id: "everforest-dark",
        ko: "Everforest",
        description: "이끼와 침엽수의 숲. 자연 친화적 그린.",
        author: "sainnhe",
        background: "#2d353b",
        foreground: "#d3c6aa",
        cursor: "#d3c6aa",
        selectionBg: "#503946",
        selectionFg: "#d3c6aa",
        accent: "#a7c080",
        tags: ["dark", "minimal", "new"],
        palette16: [
            "#475258", "#e67e80", "#a7c080", "#dbbc7f",
            "#7fbbb3", "#d699b6", "#83c092", "#d3c6aa",
            "#56635f", "#e67e80", "#a7c080", "#dbbc7f",
            "#7fbbb3", "#d699b6", "#83c092", "#d3c6aa"
        ]
    },

    // --- Kanagawa ---
    {
        id: "kanagawa",
        ko: "Kanagawa Wave",
        description: "호쿠사이의 파도. 일본 전통 안료의 깊이.",
        author: "rebelot",
        background: "#1f1f28",
        foreground: "#dcd7ba",
        cursor: "#c8c093",
        selectionBg: "#2d4f67",
        selectionFg: "#c8c093",
        accent: "#7e9cd8",
        tags: ["dark", "new"],
        palette16: [
            "#16161d", "#c34043", "#76946a", "#c0a36e",
            "#7e9cd8", "#957fb8", "#6a9589", "#c8c093",
            "#727169", "#e82424", "#98bb6c", "#e6c384",
            "#7fb4ca", "#938aa9", "#7aa89f", "#dcd7ba"
        ]
    },

    // --- One Dark ---
    {
        id: "one-dark",
        ko: "One Dark",
        description: "Atom의 시그니처. 균형 잡힌 표준 다크.",
        author: "atom",
        background: "#282c34",
        foreground: "#abb2bf",
        cursor: "#528bff",
        selectionBg: "#3e4451",
        selectionFg: "#abb2bf",
        accent: "#61afef",
        tags: ["dark", "popular"],
        palette16: [
            "#282c34", "#e06c75", "#98c379", "#e5c07b",
            "#61afef", "#c678dd", "#56b6c2", "#abb2bf",
            "#5c6370", "#e06c75", "#98c379", "#e5c07b",
            "#61afef", "#c678dd", "#56b6c2", "#ffffff"
        ]
    },

    // --- Night Owl ---
    {
        id: "night-owl",
        ko: "Night Owl",
        description: "야행성 코더를 위한. 깊은 청록과 형광 옐로.",
        author: "sdras",
        background: "#011627",
        foreground: "#d6deeb",
        cursor: "#80a4c2",
        selectionBg: "#1d3b53",
        selectionFg: "#d6deeb",
        accent: "#7fdbca",
        tags: ["dark"],
        palette16: [
            "#011627", "#ef5350", "#22da6e", "#c5e478",
            "#82aaff", "#c792ea", "#21c7a8", "#ffffff",
            "#575656", "#ef5350", "#22da6e", "#ffeb95",
            "#82aaff", "#c792ea", "#7fdbca", "#ffffff"
        ]
    },

    // --- Monokai Pro ---
    {
        id: "monokai-pro",
        ko: "Monokai Pro",
        description: "Sublime 시대의 클래식. 진한 핫핑크와 라임.",
        author: "monokai",
        background: "#2d2a2e",
        foreground: "#fcfcfa",
        cursor: "#fcfcfa",
        selectionBg: "#5b595c",
        selectionFg: "#fcfcfa",
        accent: "#ff6188",
        tags: ["dark", "retro"],
        palette16: [
            "#403e41", "#ff6188", "#a9dc76", "#ffd866",
            "#fc9867", "#ab9df2", "#78dce8", "#fcfcfa",
            "#727072", "#ff6188", "#a9dc76", "#ffd866",
            "#fc9867", "#ab9df2", "#78dce8", "#fcfcfa"
        ]
    },

    // --- Ayu Dark ---
    {
        id: "ayu-dark",
        ko: "Ayu Dark",
        description: "재즈 풍의 다크 톤. 부드러운 노랑과 청록.",
        author: "dempfi",
        background: "#0b0e14",
        foreground: "#bfbdb6",
        cursor: "#e6b450",
        selectionBg: "#273747",
        selectionFg: "#bfbdb6",
        accent: "#e6b450",
        tags: ["dark", "minimal"],
        palette16: [
            "#11151c", "#ea6c73", "#7fd962", "#f9af4f",
            "#53bdfa", "#cda1fa", "#90e1c6", "#c7c7c7",
            "#686868", "#f07178", "#aad94c", "#ffb454",
            "#59c2ff", "#d2a6ff", "#95e6cb", "#ffffff"
        ]
    },

    // --- GitHub family ---
    {
        id: "github-dark",
        ko: "GitHub Dark",
        description: "GitHub 공식 다크. 친숙한 색.",
        author: "github",
        background: "#0d1117",
        foreground: "#c9d1d9",
        cursor: "#c9d1d9",
        selectionBg: "#264f78",
        selectionFg: "#c9d1d9",
        accent: "#58a6ff",
        tags: ["dark", "popular"],
        palette16: [
            "#484f58", "#ff7b72", "#3fb950", "#d29922",
            "#58a6ff", "#bc8cff", "#39c5cf", "#b1bac4",
            "#6e7681", "#ffa198", "#56d364", "#e3b341",
            "#79c0ff", "#d2a8ff", "#56d4dd", "#f0f6fc"
        ]
    },
    {
        id: "github-light",
        ko: "GitHub Light",
        description: "GitHub 공식 라이트. 깨끗한 종이 톤.",
        author: "github",
        background: "#ffffff",
        foreground: "#24292f",
        cursor: "#24292f",
        selectionBg: "#c8e1ff",
        selectionFg: "#24292f",
        accent: "#0969da",
        tags: ["light", "minimal"],
        palette16: [
            "#24292f", "#cf222e", "#116329", "#4d2d00",
            "#0969da", "#8250df", "#1b7c83", "#6e7781",
            "#57606a", "#a40e26", "#1a7f37", "#633c01",
            "#218bff", "#a475f9", "#3192aa", "#8c959f"
        ]
    },

    // --- Oxocarbon ---
    {
        id: "oxocarbon",
        ko: "Oxocarbon",
        description: "IBM의 디자인 시스템에서 영감. 모노톤 다크.",
        author: "nyoom-engineering",
        background: "#161616",
        foreground: "#f2f4f8",
        cursor: "#ee5396",
        selectionBg: "#3ddbd9",
        selectionFg: "#161616",
        accent: "#ee5396",
        tags: ["dark", "minimal", "new"],
        palette16: [
            "#161616", "#3ddbd9", "#33b1ff", "#ee5396",
            "#42be65", "#be95ff", "#82cfff", "#dde1e6",
            "#393939", "#3ddbd9", "#33b1ff", "#ee5396",
            "#42be65", "#be95ff", "#82cfff", "#ffffff"
        ]
    },

    // --- Flexoki ---
    {
        id: "flexoki-dark",
        ko: "Flexoki Dark",
        description: "잉크와 종이의 디지털 재현. 차분한 인쇄물 톤.",
        author: "kepano",
        background: "#100f0f",
        foreground: "#cecdc3",
        cursor: "#cecdc3",
        selectionBg: "#403e3c",
        selectionFg: "#cecdc3",
        accent: "#d14d41",
        tags: ["dark", "new", "minimal"],
        palette16: [
            "#1c1b1a", "#d14d41", "#879a39", "#d0a215",
            "#4385be", "#ce5d97", "#3aa99f", "#b7b5ac",
            "#575653", "#af3029", "#66800b", "#ad8301",
            "#205ea6", "#a02f6f", "#24837b", "#cecdc3"
        ]
    },

    // --- Embark ---
    {
        id: "embark",
        ko: "Embark",
        description: "딥블루 우주선의 콘솔. 우주적 다크.",
        author: "rainglow",
        background: "#100e23",
        foreground: "#dadae8",
        cursor: "#dadae8",
        selectionBg: "#5a527c",
        selectionFg: "#dadae8",
        accent: "#f48fb1",
        tags: ["dark"],
        palette16: [
            "#100e23", "#f0719d", "#65b372", "#f7c264",
            "#6c80c7", "#aaa1f3", "#62cfcf", "#9ac0c5",
            "#5d639a", "#ff89b5", "#7afc89", "#ffdc7c",
            "#84a0fc", "#c8b1ff", "#8be5e5", "#cad9d9"
        ]
    }
];

/** 카테고리 분류용 메타데이터. */
export const themeCategories: Array<{id: ThemeTag; label: string; ko: string; icon: string}> = [
    {id: "popular", label: "Popular", ko: "인기", icon: "trending_up"},
    {id: "new", label: "New", ko: "신규", icon: "fiber_new"},
    {id: "dark", label: "Dark", ko: "다크", icon: "dark_mode"},
    {id: "light", label: "Light", ko: "라이트", icon: "light_mode"},
    {id: "minimal", label: "Minimal", ko: "미니멀", icon: "compress"},
    {id: "retro", label: "Retro", ko: "레트로", icon: "history"},
    {id: "high-contrast", label: "High Contrast", ko: "고대비", icon: "contrast"}
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
