/**
 * 외부 테마 → RouteTheme 변환기.
 *
 * 지원 포맷:
 *  1. iTerm2 `.itermcolors` (Apple plist XML)
 *  2. Base16 YAML (base00 .. base0F)
 *  3. Vim colorscheme (`highlight Normal guifg=... guibg=...`)
 *  4. Ghostty config 스니펫 (`palette = N=#hex`, `background = #hex`)
 *
 * 입력 형식은 자동 감지. 명시적으로 강제할 수도 있다.
 */

import type {RouteTheme} from "@/data/themes";

export type ThemeFormat = "iterm2" | "base16" | "vim" | "ghostty" | "unknown";

export interface ThemeImportResult {
    format: ThemeFormat;
    /** 충분한 정보가 있어 RouteTheme로 합성 가능한가 */
    ok: boolean;
    /** 합성된 RouteTheme (id/ko는 호출 측에서 채움) */
    theme?: Omit<RouteTheme, "id" | "ko" | "tags">;
    warnings: string[];
}

export function detectThemeFormat(text: string): ThemeFormat {
    const t = text.trim();
    if (t.startsWith("<?xml") && t.includes("Ansi") && t.includes("Color")) return "iterm2";
    if (/base0[0-9A-Fa-f]\s*:/.test(t)) return "base16";
    if (/^\s*highlight\s+\w/m.test(t) || /^\s*hi\s+\w/m.test(t)) return "vim";
    if (/^\s*palette\s*=\s*\d+\s*=\s*#?[0-9a-fA-F]{6}/m.test(t)) return "ghostty";
    if (/^\s*background\s*=\s*#?[0-9a-fA-F]{6}/m.test(t)) return "ghostty";
    return "unknown";
}

export function importTheme(text: string, format?: ThemeFormat): ThemeImportResult {
    const fmt = format ?? detectThemeFormat(text);
    switch (fmt) {
        case "iterm2":
            return importItermColors(text);
        case "base16":
            return importBase16Yaml(text);
        case "vim":
            return importVimColorscheme(text);
        case "ghostty":
            return importGhosttySnippet(text);
        default:
            return {format: "unknown", ok: false, warnings: ["인식할 수 없는 포맷입니다."]};
    }
}

// ----------------------------------------------------------------------
// 1. iTerm2 .itermcolors
// ----------------------------------------------------------------------

function importItermColors(text: string): ThemeImportResult {
    const colors: Record<string, string> = {};
    const dictRe = /<key>([^<]+)<\/key>\s*<dict>([\s\S]*?)<\/dict>/g;
    let m: RegExpExecArray | null;
    while ((m = dictRe.exec(text))) {
        const [, key, body] = m;
        const r = extractReal(body, "Red Component");
        const g = extractReal(body, "Green Component");
        const b = extractReal(body, "Blue Component");
        if (r != null && g != null && b != null) {
            colors[key] = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }
    }
    const palette16: string[] = [];
    for (let i = 0; i < 16; i++) {
        const c = colors[`Ansi ${i} Color`];
        if (!c) {
            return {
                format: "iterm2",
                ok: false,
                warnings: [`Ansi ${i} Color가 누락되어 16색 팔레트를 완성할 수 없어요.`]
            };
        }
        palette16.push(c);
    }
    const background = colors["Background Color"] ?? "#000000";
    const foreground = colors["Foreground Color"] ?? "#ffffff";
    return {
        format: "iterm2",
        ok: true,
        theme: {
            description: "iTerm2 .itermcolors에서 가져온 테마.",
            author: "imported",
            background,
            foreground,
            cursor: colors["Cursor Color"] ?? foreground,
            selectionBg: colors["Selection Color"] ?? "#264f78",
            selectionFg: colors["Selected Text Color"] ?? foreground,
            accent: palette16[12] ?? palette16[4] ?? foreground,
            palette16
        },
        warnings: []
    };
}

// ----------------------------------------------------------------------
// 2. Base16 YAML
// ----------------------------------------------------------------------

function importBase16Yaml(text: string): ThemeImportResult {
    const base: Record<string, string> = {};
    for (const raw of text.split(/\r?\n/)) {
        const m = raw.match(/^(base0[0-9A-Fa-f])\s*:\s*['"]?([0-9a-fA-F]{6})['"]?/);
        if (m) {
            base[m[1].toLowerCase()] = "#" + m[2].toLowerCase();
        }
    }
    const needed = ["base00", "base05", "base08", "base09", "base0a", "base0b", "base0c", "base0d", "base0e"];
    for (const k of needed) {
        if (!base[k]) {
            return {
                format: "base16",
                ok: false,
                warnings: [`${k}가 누락되어 base16 변환이 불가합니다.`]
            };
        }
    }
    // Base16 → 16 ANSI 매핑 (https://github.com/chriskempson/base16)
    const palette16 = [
        base.base00, base.base08, base.base0b, base.base0a,
        base.base0d, base.base0e, base.base0c, base.base05,
        base.base03 ?? base.base02 ?? base.base00,
        base.base08, base.base0b, base.base0a,
        base.base0d, base.base0e, base.base0c,
        base.base07 ?? base.base05
    ];
    // 이름·작가 추출
    const scheme = text.match(/^\s*scheme\s*:\s*["']?(.+?)["']?$/m)?.[1];
    const author = text.match(/^\s*author\s*:\s*["']?(.+?)["']?$/m)?.[1];
    return {
        format: "base16",
        ok: true,
        theme: {
            description: scheme
                ? `Base16: ${scheme}`
                : "Base16 YAML에서 가져온 테마.",
            author: author ?? "imported (base16)",
            background: base.base00,
            foreground: base.base05,
            cursor: base.base05,
            selectionBg: base.base02 ?? base.base01 ?? "#264f78",
            selectionFg: base.base05,
            accent: base.base0d,
            palette16
        },
        warnings: []
    };
}

// ----------------------------------------------------------------------
// 3. Vim colorscheme
// ----------------------------------------------------------------------

function importVimColorscheme(text: string): ThemeImportResult {
    const groups: Record<string, {fg?: string; bg?: string}> = {};
    const re = /^\s*(?:hi(?:ghlight)?!?)\s+(?:def\s+)?(\w+)\s+(.+)$/gm;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
        const [, name, attrs] = m;
        const fg = attrs.match(/guifg=#?([0-9a-fA-F]{6})/)?.[1];
        const bg = attrs.match(/guibg=#?([0-9a-fA-F]{6})/)?.[1];
        if (fg || bg) {
            const entry = groups[name] ?? {};
            if (fg) entry.fg = "#" + fg.toLowerCase();
            if (bg) entry.bg = "#" + bg.toLowerCase();
            groups[name] = entry;
        }
    }
    const normalFg = groups.Normal?.fg;
    const normalBg = groups.Normal?.bg;
    if (!normalFg || !normalBg) {
        return {
            format: "vim",
            ok: false,
            warnings: [
                "Normal 그룹에 guifg/guibg가 둘 다 있어야 합니다. Lua용 colorscheme은 변환할 수 없습니다."
            ]
        };
    }

    // Vim ANSI mapping은 표준이 없으므로 자주 쓰이는 그룹 → ANSI 추정
    const guess = (groupName: string, fallback: string) =>
        groups[groupName]?.fg ?? fallback;
    const palette16 = [
        normalBg,
        guess("ErrorMsg", guess("Error", "#cc0000")),
        guess("String", "#00aa00"),
        guess("WarningMsg", guess("Type", "#aaaa00")),
        guess("Function", guess("Identifier", "#3366cc")),
        guess("Keyword", guess("Statement", "#aa00aa")),
        guess("Special", "#00aaaa"),
        normalFg,
        guess("Comment", "#666666"),
        guess("Error", "#ff4444"),
        guess("String", "#44ff44"),
        guess("Type", "#ffff44"),
        guess("Identifier", "#6699ff"),
        guess("Statement", "#ff44ff"),
        guess("Special", "#44ffff"),
        guess("Title", normalFg)
    ];
    const name = text.match(/let\s+(?:g:)?colors_name\s*=\s*['"](.+?)['"]/)?.[1];
    return {
        format: "vim",
        ok: true,
        theme: {
            description: name
                ? `Vim colorscheme: ${name}`
                : "Vim colorscheme에서 가져온 테마. ANSI 색은 그룹 추정.",
            author: "imported (vim)",
            background: normalBg,
            foreground: normalFg,
            cursor: groups.Cursor?.bg ?? normalFg,
            selectionBg: groups.Visual?.bg ?? "#264f78",
            selectionFg: groups.Visual?.fg ?? normalFg,
            accent: groups.Function?.fg ?? palette16[4],
            palette16
        },
        warnings: groups.Visual ? [] : ["Visual(선택 영역) 색을 못 찾아서 기본값을 사용했어요."]
    };
}

// ----------------------------------------------------------------------
// 4. Ghostty config 스니펫
// ----------------------------------------------------------------------

function importGhosttySnippet(text: string): ThemeImportResult {
    const palette16 = new Array(16).fill(null) as Array<string | null>;
    let background = "";
    let foreground = "";
    let cursor = "";
    let selectionBg = "";
    let selectionFg = "";

    for (const raw of text.split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;
        const palMatch = line.match(/^palette\s*=\s*(\d+)\s*=\s*#?([0-9a-fA-F]{6})/);
        if (palMatch) {
            const idx = Number(palMatch[1]);
            if (idx >= 0 && idx < 16) palette16[idx] = "#" + palMatch[2].toLowerCase();
            continue;
        }
        const kv = line.match(/^([a-z-]+)\s*=\s*#?([0-9a-fA-F]{6})/);
        if (!kv) continue;
        const [, key, hex] = kv;
        const value = "#" + hex.toLowerCase();
        if (key === "background") background = value;
        else if (key === "foreground") foreground = value;
        else if (key === "cursor-color") cursor = value;
        else if (key === "selection-background") selectionBg = value;
        else if (key === "selection-foreground") selectionFg = value;
    }

    const missing = palette16
        .map((c, i) => (c ? null : i))
        .filter(x => x !== null);
    if (missing.length === 16) {
        return {
            format: "ghostty",
            ok: false,
            warnings: ["palette = N=#hex 줄이 하나도 없어 16색 팔레트를 구성할 수 없어요."]
        };
    }
    if (!background || !foreground) {
        return {
            format: "ghostty",
            ok: false,
            warnings: ["background / foreground 키가 둘 다 필요합니다."]
        };
    }

    // 누락 슬롯은 fg/bg로 채움
    for (let i = 0; i < 16; i++) {
        if (!palette16[i]) palette16[i] = i < 8 ? background : foreground;
    }

    return {
        format: "ghostty",
        ok: true,
        theme: {
            description: "Ghostty config 스니펫에서 가져온 테마.",
            author: "imported (ghostty)",
            background,
            foreground,
            cursor: cursor || foreground,
            selectionBg: selectionBg || "#264f78",
            selectionFg: selectionFg || foreground,
            accent: palette16[12]!,
            palette16: palette16 as string[]
        },
        warnings: missing.length
            ? [`팔레트 ${missing.length}개 슬롯이 누락되어 fg/bg로 채웠어요.`]
            : []
    };
}

// ----------------------------------------------------------------------
// utils
// ----------------------------------------------------------------------

function extractReal(body: string, key: string): number | null {
    const re = new RegExp(`<key>${key}<\\/key>\\s*<real>([0-9eE.+\\-]+)<\\/real>`);
    const m = body.match(re);
    if (!m) return null;
    const n = Number(m[1]);
    return isNaN(n) ? null : n;
}

function toHex(v: number): string {
    return Math.round(Math.max(0, Math.min(1, v)) * 255)
        .toString(16)
        .padStart(2, "0");
}
