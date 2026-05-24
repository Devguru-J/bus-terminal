/**
 * Neovim 승강장 데이터.
 * lazy.nvim 기반 init.lua 한 벌을 직렬화.
 */

export interface NvimPlugin {
    id: string;
    ko: string;
    repo: string;
    desc: string;
    category: "ui" | "editor" | "lsp" | "git" | "navigation";
}

export const nvimPlugins: NvimPlugin[] = [
    {id: "lazy", ko: "Lazy.nvim", repo: "folke/lazy.nvim", desc: "플러그인 매니저 (필수)", category: "editor"},
    {id: "telescope", ko: "Telescope", repo: "nvim-telescope/telescope.nvim", desc: "퍼지 파일 검색기", category: "navigation"},
    {id: "treesitter", ko: "Treesitter", repo: "nvim-treesitter/nvim-treesitter", desc: "AST 기반 신택스 하이라이트", category: "editor"},
    {id: "lspconfig", ko: "LSP Config", repo: "neovim/nvim-lspconfig", desc: "LSP 서버 자동 설정", category: "lsp"},
    {id: "mason", ko: "Mason", repo: "williamboman/mason.nvim", desc: "LSP·DAP·linter 설치 관리자", category: "lsp"},
    {id: "mason-lspconfig", ko: "Mason LSPConfig", repo: "williamboman/mason-lspconfig.nvim", desc: "Mason과 lspconfig 연결", category: "lsp"},
    {id: "lualine", ko: "Lualine", repo: "nvim-lualine/lualine.nvim", desc: "상태바 (statusline)", category: "ui"},
    {id: "neo-tree", ko: "Neo-tree", repo: "nvim-neo-tree/neo-tree.nvim", desc: "파일 탐색기 사이드바", category: "navigation"},
    {id: "gitsigns", ko: "Gitsigns", repo: "lewis6991/gitsigns.nvim", desc: "Git diff 사인 / 블레임", category: "git"},
    {id: "which-key", ko: "which-key", repo: "folke/which-key.nvim", desc: "키 매핑 힌트 팝업", category: "ui"},
    {id: "tokyonight", ko: "Tokyo Night", repo: "folke/tokyonight.nvim", desc: "테마: 도쿄 야간선", category: "ui"},
    {id: "conform", ko: "Conform.nvim", repo: "stevearc/conform.nvim", desc: "저장 시 포맷팅", category: "editor"},
    {id: "cmp", ko: "nvim-cmp", repo: "hrsh7th/nvim-cmp", desc: "자동완성 엔진", category: "editor"},
    {id: "catppuccin", ko: "Catppuccin", repo: "catppuccin/nvim", desc: "테마: Catppuccin", category: "ui"},
    {id: "gruvbox", ko: "Gruvbox", repo: "ellisonleao/gruvbox.nvim", desc: "테마: Gruvbox", category: "ui"},
    {id: "nord", ko: "Nord", repo: "shaunsingh/nord.nvim", desc: "테마: Nord", category: "ui"},
    {id: "rose-pine", ko: "Rose Pine", repo: "rose-pine/neovim", desc: "테마: Rose Pine", category: "ui"},
    {id: "kanagawa", ko: "Kanagawa", repo: "rebelot/kanagawa.nvim", desc: "테마: Kanagawa", category: "ui"}
];

export const NVIM_COLORSCHEMES = [
    "tokyonight",
    "catppuccin",
    "gruvbox",
    "nord",
    "rose-pine",
    "kanagawa",
    "default"
] as const;

export type NvimColorscheme = (typeof NVIM_COLORSCHEMES)[number];

export const NVIM_STATUSLINES = ["lualine", "lightline", "default"] as const;
export type NvimStatusline = (typeof NVIM_STATUSLINES)[number];

export interface NvimConfig {
    leaderKey: string; // " " (space)
    lineNumbers: boolean;
    relativeNumbers: boolean;
    tabWidth: number;
    expandTab: boolean;
    mouse: boolean;
    transparent: boolean;
    wrap: boolean;
    scrolloff: number;
    sidescrolloff: number;
    clipboard: "default" | "unnamedplus";
    ignorecase: boolean;
    smartcase: boolean;
    formatOnSave: boolean;
    lspServers: string[];
    colorscheme: NvimColorscheme;
    statusline: NvimStatusline;
    plugins: string[]; // ids
    keymaps: Array<{lhs: string; rhs: string; desc: string}>;
}

/**
 * 진짜 vim/nvim의 무설정 기본값.
 * - leader는 백슬래시 `\` (vim 기본)
 * - 줄번호 OFF, 상대번호 OFF (vim 기본)
 * - tabstop 8, expandtab OFF (vim 기본: 하드 탭)
 * - 마우스 OFF
 * - colorscheme "default", statusline "default" (lualine 없음)
 * - 플러그인 없음, keymap 없음
 */
export const nvimDefault: NvimConfig = {
    leaderKey: "\\",
    lineNumbers: false,
    relativeNumbers: false,
    tabWidth: 8,
    expandTab: false,
    mouse: false,
    transparent: false,
    wrap: false,
    scrolloff: 0,
    sidescrolloff: 0,
    clipboard: "default",
    ignorecase: false,
    smartcase: false,
    formatOnSave: false,
    lspServers: [],
    colorscheme: "default",
    statusline: "default",
    plugins: [],
    keymaps: []
};

/** init.lua 생성. */
export function serializeNvimConfig(c: NvimConfig): string {
    const lines: string[] = [];
    const selectedPlugins = c.plugins.filter(id => id !== "lazy");
    lines.push("-- 버스터미널에서 출발한 Neovim 설정");
    lines.push(`-- generated ${new Date().toISOString()}`);
    lines.push("");
    lines.push("-- 기본 옵션");
    lines.push(`vim.g.mapleader = ${JSON.stringify(c.leaderKey)}`);
    lines.push(`vim.opt.number = ${c.lineNumbers}`);
    lines.push(`vim.opt.relativenumber = ${c.relativeNumbers}`);
    lines.push(`vim.opt.tabstop = ${c.tabWidth}`);
    lines.push(`vim.opt.shiftwidth = ${c.tabWidth}`);
    lines.push(`vim.opt.expandtab = ${c.expandTab}`);
    lines.push(`vim.opt.mouse = "${c.mouse ? "a" : ""}"`);
    lines.push(`vim.opt.termguicolors = true`);
    lines.push(`vim.opt.wrap = ${c.wrap}`);
    lines.push(`vim.opt.scrolloff = ${c.scrolloff}`);
    lines.push(`vim.opt.sidescrolloff = ${c.sidescrolloff}`);
    if (c.clipboard === "unnamedplus") lines.push(`vim.opt.clipboard = "unnamedplus"`);
    lines.push(`vim.opt.ignorecase = ${c.ignorecase}`);
    lines.push(`vim.opt.smartcase = ${c.smartcase}`);
    lines.push("");

    // 플러그인 부트스트랩 (lazy.nvim)
    if (selectedPlugins.length > 0 || c.plugins.includes("lazy")) {
        lines.push("-- lazy.nvim 부트스트랩");
        lines.push(`local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"`);
        lines.push("if not vim.loop.fs_stat(lazypath) then");
        lines.push('    vim.fn.system({"git","clone","--filter=blob:none","https://github.com/folke/lazy.nvim.git","--branch=stable",lazypath})');
        lines.push("end");
        lines.push("vim.opt.rtp:prepend(lazypath)");
        lines.push("");
        lines.push("require(\"lazy\").setup({");
        for (const id of selectedPlugins) {
            const p = nvimPlugins.find(x => x.id === id);
            if (!p) continue;
            lines.push(`    {${JSON.stringify(p.repo)}},`);
        }
        lines.push("})");
        lines.push("");
    }

    // 테마
    lines.push("-- 테마");
    lines.push(`vim.cmd.colorscheme("${c.colorscheme}")`);
    if (c.transparent) {
        lines.push(`vim.api.nvim_set_hl(0, "Normal", { bg = "none" })`);
        lines.push(`vim.api.nvim_set_hl(0, "NormalFloat", { bg = "none" })`);
    }
    lines.push("");

    // statusline
    if (c.statusline === "lualine" && c.plugins.includes("lualine")) {
        lines.push("-- statusline");
        lines.push(`require("lualine").setup({ options = { theme = "auto" } })`);
        lines.push("");
    }

    if (c.plugins.includes("mason") && c.lspServers.length) {
        lines.push("-- Mason LSP");
        lines.push(`require("mason").setup()`);
        lines.push(`require("mason-lspconfig").setup({ ensure_installed = ${luaArray(c.lspServers)} })`);
        lines.push("");
    }

    if (c.plugins.includes("conform") && c.formatOnSave) {
        lines.push("-- Formatting");
        lines.push(`require("conform").setup({`);
        lines.push(`    format_on_save = { timeout_ms = 500, lsp_fallback = true },`);
        lines.push(`})`);
        lines.push("");
    }

    if (c.plugins.includes("cmp")) {
        lines.push("-- Completion");
        lines.push(`local cmp = require("cmp")`);
        lines.push(`cmp.setup({ mapping = cmp.mapping.preset.insert({ ["<CR>"] = cmp.mapping.confirm({ select = true }) }) })`);
        lines.push("");
    }

    // 키매핑
    if (c.keymaps.length) {
        lines.push("-- 키 매핑");
        for (const k of c.keymaps) {
            lines.push(
                `vim.keymap.set("n", "${k.lhs}", ${JSON.stringify(k.rhs)}, { desc = "${k.desc}" })`
            );
        }
    }
    return lines.join("\n") + "\n";
}

function luaArray(values: string[]): string {
    return `{ ${values.map(v => JSON.stringify(v)).join(", ")} }`;
}
