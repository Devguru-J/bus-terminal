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
    {id: "lualine", ko: "Lualine", repo: "nvim-lualine/lualine.nvim", desc: "상태바 (statusline)", category: "ui"},
    {id: "neo-tree", ko: "Neo-tree", repo: "nvim-neo-tree/neo-tree.nvim", desc: "파일 탐색기 사이드바", category: "navigation"},
    {id: "gitsigns", ko: "Gitsigns", repo: "lewis6991/gitsigns.nvim", desc: "Git diff 사인 / 블레임", category: "git"},
    {id: "which-key", ko: "which-key", repo: "folke/which-key.nvim", desc: "키 매핑 힌트 팝업", category: "ui"},
    {id: "tokyonight", ko: "Tokyo Night", repo: "folke/tokyonight.nvim", desc: "테마: 도쿄 야간선", category: "ui"}
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
    colorscheme: NvimColorscheme;
    statusline: NvimStatusline;
    plugins: string[]; // ids
    keymaps: Array<{lhs: string; rhs: string; desc: string}>;
}

export const nvimDefault: NvimConfig = {
    leaderKey: " ",
    lineNumbers: true,
    relativeNumbers: true,
    tabWidth: 2,
    expandTab: true,
    mouse: true,
    transparent: false,
    colorscheme: "tokyonight",
    statusline: "lualine",
    plugins: ["lazy", "telescope", "treesitter", "lspconfig", "lualine", "tokyonight"],
    keymaps: [
        {lhs: "<leader>w", rhs: ":w<CR>", desc: "저장"},
        {lhs: "<leader>q", rhs: ":q<CR>", desc: "종료"},
        {lhs: "<leader>ff", rhs: ":Telescope find_files<CR>", desc: "파일 찾기"}
    ]
};

/** init.lua 생성. */
export function serializeNvimConfig(c: NvimConfig): string {
    const lines: string[] = [];
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
    lines.push("");

    // 플러그인 부트스트랩 (lazy.nvim)
    if (c.plugins.includes("lazy")) {
        lines.push("-- lazy.nvim 부트스트랩");
        lines.push(`local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"`);
        lines.push("if not vim.loop.fs_stat(lazypath) then");
        lines.push('    vim.fn.system({"git","clone","--filter=blob:none","https://github.com/folke/lazy.nvim.git","--branch=stable",lazypath})');
        lines.push("end");
        lines.push("vim.opt.rtp:prepend(lazypath)");
        lines.push("");
    }

    lines.push("require(\"lazy\").setup({");
    for (const id of c.plugins) {
        const p = nvimPlugins.find(x => x.id === id);
        if (!p || p.id === "lazy") continue;
        lines.push(`    {${JSON.stringify(p.repo)}},`);
    }
    lines.push("})");
    lines.push("");

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
