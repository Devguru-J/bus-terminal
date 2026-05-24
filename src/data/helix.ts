/**
 * Helix 승강장 데이터.
 * ~/.config/helix/config.toml 한 벌을 직렬화.
 * Helix 공식 문서(book) 기반 실제 키 사용.
 */

export const HELIX_THEMES = [
    "default",
    "onedark",
    "catppuccin_mocha",
    "catppuccin_macchiato",
    "tokyonight",
    "tokyonight_storm",
    "gruvbox",
    "gruvbox_dark_hard",
    "nord",
    "rose_pine",
    "rose_pine_moon",
    "ayu_dark",
    "monokai_pro",
    "dracula"
] as const;
export type HelixTheme = (typeof HELIX_THEMES)[number];

export const HELIX_LINE_NUMBER = ["absolute", "relative"] as const;
export type HelixLineNumber = (typeof HELIX_LINE_NUMBER)[number];

export const HELIX_CURSOR_SHAPE = ["block", "bar", "underline"] as const;
export type HelixCursorShape = (typeof HELIX_CURSOR_SHAPE)[number];

export const HELIX_BUFFERLINE = ["never", "multiple", "always"] as const;
export type HelixBufferline = (typeof HELIX_BUFFERLINE)[number];

export interface HelixLanguageServer {
    id: string;
    ko: string;
    language: string;
    server: string;
    desc: string;
}

export const helixLanguageServers: HelixLanguageServer[] = [
    {id: "rust-analyzer", ko: "Rust", language: "rust", server: "rust-analyzer", desc: "Rust 공식 LSP. cargo와 연동."},
    {id: "typescript-language-server", ko: "TypeScript", language: "typescript", server: "typescript-language-server", desc: "TS/JS LSP. npm i -g typescript-language-server."},
    {id: "gopls", ko: "Go", language: "go", server: "gopls", desc: "Go 공식 LSP."},
    {id: "pyright", ko: "Python", language: "python", server: "pyright", desc: "Microsoft의 Python LSP. 타입 검사 강함."},
    {id: "ruff", ko: "Python (ruff)", language: "python", server: "ruff", desc: "고속 Python linter/formatter."},
    {id: "clangd", ko: "C / C++", language: "c", server: "clangd", desc: "LLVM의 C/C++ LSP."},
    {id: "lua-language-server", ko: "Lua", language: "lua", server: "lua-language-server", desc: "sumneko Lua LSP. Neovim 설정에도 사용."},
    {id: "marksman", ko: "Markdown", language: "markdown", server: "marksman", desc: "Markdown LSP. 링크/헤더 인식."},
    {id: "tailwindcss-language-server", ko: "Tailwind CSS", language: "html", server: "tailwindcss-language-server", desc: "Tailwind 클래스 자동완성."},
    {id: "yaml-language-server", ko: "YAML", language: "yaml", server: "yaml-language-server", desc: "Red Hat의 YAML LSP."},
    {id: "deno", ko: "Deno", language: "typescript", server: "deno", desc: "Deno 런타임용 LSP."}
];

export interface HelixKeymap {
    mode: "normal" | "insert" | "select";
    lhs: string; // 예: "C-s"
    rhs: string; // 예: ":w"
    desc: string;
}

export interface HelixConfig {
    // 테마
    theme: HelixTheme;

    // [editor]
    lineNumber: HelixLineNumber;
    mouse: boolean;
    middleClickPaste: boolean;
    scrolloff: number;
    bufferline: HelixBufferline;
    cursorline: boolean;
    autoFormat: boolean;
    autoSave: boolean;
    trueColor: boolean;
    autoCompletion: boolean;
    idleTimeoutMs: number;
    completionTrigger: number;
    rulers: number[]; // 예: [80, 120]
    color_modes: boolean;
    text_width: number;

    // [editor.cursor-shape]
    cursorInsert: HelixCursorShape;
    cursorNormal: HelixCursorShape;
    cursorSelect: HelixCursorShape;

    // [editor.indent-guides]
    indentGuides: boolean;
    indentGuideCharacter: string;

    // [editor.statusline]
    statuslineLeft: string[];
    statuslineCenter: string[];
    statuslineRight: string[];

    // [editor.lsp]
    lspEnable: boolean;
    lspDisplayMessages: boolean;
    lspDisplayInlayHints: boolean;
    lspAutoSignatureHelp: boolean;

    // [editor.file-picker]
    filePickerHidden: boolean;
    filePickerGitIgnore: boolean;

    // languages
    languageServers: string[]; // ids

    // [keys.*]
    keymaps: HelixKeymap[];
}

/**
 * 진짜 Helix 무설정 기본값 (`hx --health` 기준).
 * - 테마 default
 * - 줄번호 absolute, mouse OFF, scrolloff 5
 * - cursor: insert=bar, normal=block, select=underline
 * - LSP 켜져 있음 (Helix는 LSP가 기본 ON)
 */
export const helixDefault: HelixConfig = {
    theme: "default",
    lineNumber: "absolute",
    mouse: false,
    middleClickPaste: false,
    scrolloff: 5,
    bufferline: "never",
    cursorline: false,
    autoFormat: true,
    autoSave: false,
    trueColor: true,
    autoCompletion: true,
    idleTimeoutMs: 250,
    completionTrigger: 2,
    rulers: [],
    color_modes: false,
    text_width: 80,
    cursorInsert: "bar",
    cursorNormal: "block",
    cursorSelect: "underline",
    indentGuides: false,
    indentGuideCharacter: "│",
    statuslineLeft: ["mode", "spinner", "file-name", "read-only-indicator", "file-modification-indicator"],
    statuslineCenter: [],
    statuslineRight: ["diagnostics", "selections", "register", "position", "file-encoding", "file-line-ending", "file-type"],
    lspEnable: true,
    lspDisplayMessages: false,
    lspDisplayInlayHints: false,
    lspAutoSignatureHelp: true,
    filePickerHidden: false,
    filePickerGitIgnore: true,
    languageServers: [],
    keymaps: []
};

function tomlString(value: string): string {
    return JSON.stringify(value);
}

function tomlList(values: string[]): string {
    return `[${values.map(v => tomlString(v)).join(", ")}]`;
}

function tomlNumList(values: number[]): string {
    return `[${values.join(", ")}]`;
}

export function serializeHelixConfig(c: HelixConfig): string {
    const lines: string[] = [];
    lines.push("# 버스터미널에서 출발한 Helix 설정");
    lines.push(`# generated ${new Date().toISOString()}`);
    lines.push("");

    if (c.theme && c.theme !== "default") {
        lines.push(`theme = ${tomlString(c.theme)}`);
        lines.push("");
    }

    lines.push("[editor]");
    lines.push(`line-number = ${tomlString(c.lineNumber)}`);
    lines.push(`mouse = ${c.mouse}`);
    lines.push(`middle-click-paste = ${c.middleClickPaste}`);
    lines.push(`scrolloff = ${c.scrolloff}`);
    lines.push(`bufferline = ${tomlString(c.bufferline)}`);
    lines.push(`cursorline = ${c.cursorline}`);
    lines.push(`auto-format = ${c.autoFormat}`);
    lines.push(`auto-save = ${c.autoSave}`);
    lines.push(`true-color = ${c.trueColor}`);
    lines.push(`auto-completion = ${c.autoCompletion}`);
    lines.push(`idle-timeout = ${c.idleTimeoutMs}`);
    lines.push(`completion-trigger-len = ${c.completionTrigger}`);
    lines.push(`color-modes = ${c.color_modes}`);
    lines.push(`text-width = ${c.text_width}`);
    if (c.rulers.length) lines.push(`rulers = ${tomlNumList(c.rulers)}`);
    lines.push("");

    lines.push("[editor.cursor-shape]");
    lines.push(`insert = ${tomlString(c.cursorInsert)}`);
    lines.push(`normal = ${tomlString(c.cursorNormal)}`);
    lines.push(`select = ${tomlString(c.cursorSelect)}`);
    lines.push("");

    if (c.indentGuides) {
        lines.push("[editor.indent-guides]");
        lines.push("render = true");
        lines.push(`character = ${tomlString(c.indentGuideCharacter)}`);
        lines.push("");
    }

    lines.push("[editor.statusline]");
    lines.push(`left = ${tomlList(c.statuslineLeft)}`);
    lines.push(`center = ${tomlList(c.statuslineCenter)}`);
    lines.push(`right = ${tomlList(c.statuslineRight)}`);
    lines.push("");

    lines.push("[editor.lsp]");
    lines.push(`enable = ${c.lspEnable}`);
    lines.push(`display-messages = ${c.lspDisplayMessages}`);
    lines.push(`display-inlay-hints = ${c.lspDisplayInlayHints}`);
    lines.push(`auto-signature-help = ${c.lspAutoSignatureHelp}`);
    lines.push("");

    lines.push("[editor.file-picker]");
    lines.push(`hidden = ${c.filePickerHidden}`);
    lines.push(`git-ignore = ${c.filePickerGitIgnore}`);
    lines.push("");

    // keymaps
    const byMode: Record<string, HelixKeymap[]> = {normal: [], insert: [], select: []};
    for (const k of c.keymaps) {
        if (!k.lhs.trim() || !k.rhs.trim()) continue;
        byMode[k.mode].push(k);
    }
    for (const mode of ["normal", "insert", "select"] as const) {
        const list = byMode[mode];
        if (!list.length) continue;
        lines.push(`[keys.${mode}]`);
        for (const k of list) {
            if (k.desc.trim()) lines.push(`# ${k.desc.trim()}`);
            lines.push(`${tomlKey(k.lhs)} = ${tomlString(k.rhs)}`);
        }
        lines.push("");
    }

    return lines.join("\n");
}

function tomlKey(k: string): string {
    // TOML bare keys allow A-Za-z0-9_-, others must be quoted.
    if (/^[A-Za-z0-9_-]+$/.test(k)) return k;
    return JSON.stringify(k);
}

/** languages.toml 별도 파일 (LSP 서버 매핑). */
export function serializeHelixLanguages(c: HelixConfig): string {
    if (!c.languageServers.length) return "";
    const lines: string[] = [];
    lines.push("# 버스터미널에서 출발한 Helix languages.toml");
    lines.push(`# generated ${new Date().toISOString()}`);
    lines.push("");
    // group by language
    const byLanguage: Record<string, HelixLanguageServer[]> = {};
    for (const id of c.languageServers) {
        const ls = helixLanguageServers.find(x => x.id === id);
        if (!ls) continue;
        (byLanguage[ls.language] ??= []).push(ls);
    }
    for (const [lang, servers] of Object.entries(byLanguage)) {
        lines.push("[[language]]");
        lines.push(`name = ${tomlString(lang)}`);
        lines.push(
            `language-servers = ${tomlList(servers.map(s => s.id))}`
        );
        lines.push("");
    }
    for (const id of c.languageServers) {
        const ls = helixLanguageServers.find(x => x.id === id);
        if (!ls) continue;
        lines.push(`[language-server.${ls.id}]`);
        lines.push(`command = ${tomlString(ls.server)}`);
        lines.push("");
    }
    return lines.join("\n");
}
