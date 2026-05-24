import {themes} from "@/data/themes";
import type {NvimConfig} from "@/data/neovim";
import type {TmuxStatusConfig} from "@/data/tmux";
import {zshPlugins, type ZshConfig} from "@/data/zsh";

export type DiagnosticLevel = "error" | "warning" | "info";
export type DiagnosticPlatform = "Ghostty" | "tmux" | "Neovim" | "Zsh";

export interface ConfigDiagnostic {
    id: string;
    platform: DiagnosticPlatform;
    level: DiagnosticLevel;
    title: string;
    detail: string;
}

export interface DiagnosticSummary {
    errors: number;
    warnings: number;
    info: number;
}

export function summarizeDiagnostics(items: ConfigDiagnostic[]): DiagnosticSummary {
    return items.reduce(
        (acc, item) => {
            if (item.level === "error") acc.errors += 1;
            if (item.level === "warning") acc.warnings += 1;
            if (item.level === "info") acc.info += 1;
            return acc;
        },
        {errors: 0, warnings: 0, info: 0}
    );
}

export function runConfigDiagnostics(input: {
    ghostty: {config: Record<string, string | number | boolean>; keybinds: string[]};
    tmux: TmuxStatusConfig;
    neovim: NvimConfig;
    zsh: ZshConfig;
}): ConfigDiagnostic[] {
    return [
        ...diagnoseGhostty(input.ghostty.config, input.ghostty.keybinds),
        ...diagnoseTmux(input.tmux),
        ...diagnoseNeovim(input.neovim),
        ...diagnoseZsh(input.zsh)
    ];
}

function diagnoseGhostty(
    config: Record<string, string | number | boolean>,
    keybinds: string[]
): ConfigDiagnostic[] {
    const out: ConfigDiagnostic[] = [];
    const opacity = Number(config["background-opacity"] ?? 1);
    const background = String(config["background"] ?? "#000000");
    const foreground = String(config["foreground"] ?? "#ffffff");

    if (opacity < 0.55) {
        out.push({
            id: "ghostty-low-opacity",
            platform: "Ghostty",
            level: "warning",
            title: "배경 투명도가 낮습니다",
            detail: "투명도가 55% 미만이면 코드와 로그 가독성이 떨어질 수 있습니다."
        });
    }

    if (contrastRatio(background, foreground) < 4.5) {
        out.push({
            id: "ghostty-low-contrast",
            platform: "Ghostty",
            level: "warning",
            title: "배경/글자 대비가 낮습니다",
            detail: "장시간 사용을 위해 foreground와 background 대비를 4.5:1 이상으로 맞추는 것을 권장합니다."
        });
    }

    if (String(config["copy-on-select"] ?? "false") === "true") {
        out.push({
            id: "ghostty-copy-on-select",
            platform: "Ghostty",
            level: "info",
            title: "선택 즉시 복사가 켜져 있습니다",
            detail: "민감한 토큰이나 로그를 자주 다룬다면 의도치 않은 클립보드 복사를 주의하세요."
        });
    }

    const dupKeybinds = duplicates(keybinds);
    if (dupKeybinds.length) {
        out.push({
            id: "ghostty-duplicate-keybinds",
            platform: "Ghostty",
            level: "warning",
            title: "중복 keybind가 있습니다",
            detail: dupKeybinds.slice(0, 3).join(", ")
        });
    }

    return out;
}

function diagnoseTmux(config: TmuxStatusConfig): ConfigDiagnostic[] {
    const out: ConfigDiagnostic[] = [];

    if (config.plugins.includes("continuum") && !config.plugins.includes("resurrect")) {
        out.push({
            id: "tmux-continuum-without-resurrect",
            platform: "tmux",
            level: "warning",
            title: "continuum은 resurrect와 함께 쓰는 것이 안전합니다",
            detail: "자동 저장 플러그인만 선택되어 있습니다. 세션 복원을 위해 tmux-resurrect도 함께 선택하세요."
        });
    }

    if (config.prefix === "C-a") {
        out.push({
            id: "tmux-prefix-c-a",
            platform: "tmux",
            level: "info",
            title: "Prefix가 C-a입니다",
            detail: "readline의 줄 시작 이동 단축키와 겹칩니다. tmux 사용자는 자주 선택하지만 충돌을 인지해야 합니다."
        });
    }

    if (config.historyLimit >= 50000) {
        out.push({
            id: "tmux-high-history-limit",
            platform: "tmux",
            level: "info",
            title: "스크롤백 버퍼가 큽니다",
            detail: "긴 로그 확인에는 유용하지만 오래 실행하는 세션에서는 메모리 사용량이 늘 수 있습니다."
        });
    }

    return out;
}

function diagnoseNeovim(config: NvimConfig): ConfigDiagnostic[] {
    const out: ConfigDiagnostic[] = [];
    const themePluginMap: Partial<Record<NvimConfig["colorscheme"], string>> = {
        tokyonight: "tokyonight",
        catppuccin: "catppuccin",
        gruvbox: "gruvbox",
        nord: "nord",
        "rose-pine": "rose-pine",
        kanagawa: "kanagawa"
    };
    const requiredThemePlugin = themePluginMap[config.colorscheme];

    if (requiredThemePlugin && !config.plugins.includes(requiredThemePlugin)) {
        out.push({
            id: "nvim-theme-plugin-missing",
            platform: "Neovim",
            level: "warning",
            title: "컬러스킴 플러그인이 선택되지 않았습니다",
            detail: `${config.colorscheme} 테마를 사용하려면 대응 테마 플러그인을 함께 포함해야 합니다.`
        });
    }

    if (config.statusline === "lualine" && !config.plugins.includes("lualine")) {
        out.push({
            id: "nvim-lualine-plugin-missing",
            platform: "Neovim",
            level: "warning",
            title: "lualine 플러그인이 빠져 있습니다",
            detail: "상태바를 lualine으로 선택했지만 lualine.nvim 플러그인이 선택되지 않았습니다."
        });
    }

    const dupKeymaps = duplicates(config.keymaps.map(k => k.lhs).filter(Boolean));
    if (dupKeymaps.length) {
        out.push({
            id: "nvim-duplicate-keymaps",
            platform: "Neovim",
            level: "warning",
            title: "중복 키 매핑이 있습니다",
            detail: dupKeymaps.slice(0, 3).join(", ")
        });
    }

    return out;
}

function diagnoseZsh(config: ZshConfig): ConfigDiagnostic[] {
    const out: ConfigDiagnostic[] = [];
    const external = config.plugins
        .map(id => zshPlugins.find(p => p.id === id))
        .filter(p => p?.framework === "external");

    if (config.prompt === "starship") {
        out.push({
            id: "zsh-starship-install",
            platform: "Zsh",
            level: "info",
            title: "Starship 설치가 필요합니다",
            detail: "생성된 .zshrc는 starship init을 호출합니다. 로컬에 starship CLI가 설치되어 있어야 합니다."
        });
    }

    if (external.length) {
        out.push({
            id: "zsh-external-plugin-install",
            platform: "Zsh",
            level: "info",
            title: "외부 플러그인 설치 안내가 필요합니다",
            detail: "zsh-users 계열 플러그인은 source 경로만으로는 동작하지 않습니다. 설치 스크립트 또는 안내를 함께 제공하세요."
        });
    }

    const dupAliases = duplicates(config.aliases.map(a => a.name).filter(Boolean));
    if (dupAliases.length) {
        out.push({
            id: "zsh-duplicate-aliases",
            platform: "Zsh",
            level: "warning",
            title: "중복 alias가 있습니다",
            detail: dupAliases.slice(0, 3).join(", ")
        });
    }

    return out;
}

function duplicates(values: string[]): string[] {
    const seen = new Set<string>();
    const dup = new Set<string>();
    for (const value of values) {
        if (seen.has(value)) dup.add(value);
        seen.add(value);
    }
    return Array.from(dup);
}

function contrastRatio(a: string, b: string): number {
    const l1 = relativeLuminance(hexToRgb(a));
    const l2 = relativeLuminance(hexToRgb(b));
    const high = Math.max(l1, l2);
    const low = Math.min(l1, l2);
    return (high + 0.05) / (low + 0.05);
}

function hexToRgb(hex: string): [number, number, number] {
    const normalized = normalizeHex(hex);
    const value = parseInt(normalized.slice(1), 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function normalizeHex(value: string): string {
    const fromTheme = themes.find(t => t.ko === value || t.id === value);
    const raw = fromTheme?.background ?? value;
    const trimmed = raw.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
    if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed}`;
    return "#000000";
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
    const [rs, gs, bs] = [r, g, b].map(channel => {
        const srgb = channel / 255;
        return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
