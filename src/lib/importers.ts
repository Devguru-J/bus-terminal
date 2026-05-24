/**
 * 환승하기(Import) 파서 모음.
 *
 * 정확한 round-trip이 아니라 "있는 키만 흡수"하는 lossy parser.
 * 알 수 없는 줄은 unknownLines로 반환해 사용자에게 노출.
 *
 * 각 importer는 다음 contract를 따른다:
 *   (text) => { ok, applied, unknownLines, warnings, value }
 *
 * 호출 측은 value를 받아 해당 스토어의 importPatch / setField 일괄 호출.
 */

import type {TmuxStatusConfig} from "@/data/tmux";
import type {ZshConfig} from "@/data/zsh";
import type {HelixConfig} from "@/data/helix";
import type {NvimConfig} from "@/data/neovim";
import type {WarpConfig, WarpTerminalColors} from "@/data/warp";

export interface ImportResult<T> {
    ok: boolean;
    applied: number;
    unknownLines: string[];
    warnings: string[];
    value: Partial<T>;
}

function emptyResult<T>(): ImportResult<T> {
    return {ok: true, applied: 0, unknownLines: [], warnings: [], value: {}};
}

// ----------------------------------------------------------------------
// tmux: ~/.tmux.conf
// ----------------------------------------------------------------------

export function importTmuxConf(text: string): ImportResult<TmuxStatusConfig> {
    const r = emptyResult<TmuxStatusConfig>();
    const v: Partial<TmuxStatusConfig> = {plugins: [], customPlugins: []};

    const lines = text.split(/\r?\n/);
    for (const raw of lines) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;

        // set -g option value
        const setMatch = line.match(
            /^set(?:-option|w|-window-option)?\s+(?:-[a-z]+\s+)*([a-zA-Z0-9-]+)\s+(.+)$/
        );
        if (setMatch) {
            const [, key, valueRaw] = setMatch;
            const value = stripQuotes(valueRaw);
            switch (key) {
                case "prefix":
                    v.prefix = value;
                    r.applied++;
                    break;
                case "mouse":
                    v.mouse = value === "on";
                    r.applied++;
                    break;
                case "base-index":
                    v.baseIndex = Number(value) || 0;
                    r.applied++;
                    break;
                case "pane-base-index":
                    v.paneBaseIndex = Number(value) || 0;
                    r.applied++;
                    break;
                case "mode-keys":
                    v.modeKeys = value === "vi" ? "vi" : "emacs";
                    r.applied++;
                    break;
                case "history-limit":
                    v.historyLimit = Number(value) || 2000;
                    r.applied++;
                    break;
                case "status-interval":
                    v.statusInterval = Number(value) || 15;
                    r.applied++;
                    break;
                case "status-position":
                    v.statusPosition = value === "top" ? "top" : "bottom";
                    r.applied++;
                    break;
                case "status-style":
                    v.statusStyle = value;
                    r.applied++;
                    break;
                case "status-left":
                    v.leftSegments = [value];
                    r.applied++;
                    break;
                case "status-right":
                    v.rightSegments = [value];
                    r.applied++;
                    break;
                case "renumber-windows":
                    v.renumberWindows = value === "on";
                    r.applied++;
                    break;
                case "escape-time":
                    v.escapeTime = Number(value) || 0;
                    r.applied++;
                    break;
                case "@plugin": {
                    const p = value.replace(/^['"]|['"]$/g, "");
                    if (p && p !== "tmux-plugins/tpm") {
                        v.customPlugins = [...(v.customPlugins ?? []), p];
                        r.applied++;
                    }
                    break;
                }
                default:
                    r.unknownLines.push(raw);
            }
            continue;
        }
        if (line.startsWith("unbind ") || line.startsWith("bind ") || line.startsWith("run ")) {
            // bind/unbind는 보존 (Phase 2에서 keybinding으로 흡수)
            r.unknownLines.push(raw);
            continue;
        }
        r.unknownLines.push(raw);
    }
    return {...r, value: v};
}

// ----------------------------------------------------------------------
// zsh: ~/.zshrc
// ----------------------------------------------------------------------

export function importZshrc(text: string): ImportResult<ZshConfig> {
    const r = emptyResult<ZshConfig>();
    const v: Partial<ZshConfig> = {
        aliases: [],
        plugins: [],
        envVars: [],
        pathEntries: [],
        functions: []
    };

    const lines = text.split(/\r?\n/);
    for (const raw of lines) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;

        // ZSH_THEME="..." → 가능한 경우 prompt 매핑
        const themeMatch = line.match(/^ZSH_THEME\s*=\s*(.+)$/);
        if (themeMatch) {
            const themeName = stripQuotes(themeMatch[1]);
            if (themeName === "starship") v.prompt = "starship";
            else if (themeName === "pure") v.prompt = "pure";
            else if (themeName === "powerlevel10k" || themeName === "powerlevel10k/powerlevel10k") v.prompt = "powerlevel10k";
            else v.prompt = "default";
            r.applied++;
            continue;
        }

        // plugins=(git docker ...)
        const pluginsMatch = line.match(/^plugins\s*=\s*\(\s*(.*?)\s*\)\s*$/);
        if (pluginsMatch) {
            const names = pluginsMatch[1].split(/\s+/).filter(Boolean);
            v.plugins = names;
            r.applied += names.length;
            continue;
        }

        // alias name='value' or alias name="value"
        const aliasMatch = line.match(/^alias\s+([\w-]+)\s*=\s*(.+)$/);
        if (aliasMatch) {
            v.aliases = [
                ...(v.aliases ?? []),
                {name: aliasMatch[1], value: stripQuotes(aliasMatch[2])}
            ];
            r.applied++;
            continue;
        }

        // export VAR=value
        const exportMatch = line.match(/^export\s+(\w+)\s*=\s*(.+)$/);
        if (exportMatch) {
            const [, key, valueRaw] = exportMatch;
            const value = stripQuotes(valueRaw);
            if (key === "PATH") {
                const parts = value
                    .replace(/\$PATH/g, "")
                    .split(":")
                    .map(p => p.trim())
                    .filter(Boolean);
                v.pathEntries = [...(v.pathEntries ?? []), ...parts];
                r.applied += parts.length;
            }
            else {
                v.envVars = [...(v.envVars ?? []), {name: key, value}];
                r.applied++;
            }
            continue;
        }

        // HISTSIZE=...
        const histSizeMatch = line.match(/^HISTSIZE\s*=\s*(\d+)$/);
        if (histSizeMatch) {
            v.histsize = Number(histSizeMatch[1]);
            r.applied++;
            continue;
        }
        const histFileMatch = line.match(/^HISTFILE\s*=\s*(.+)$/);
        if (histFileMatch) {
            v.histfile = stripQuotes(histFileMatch[1]);
            r.applied++;
            continue;
        }

        // source / setopt — 보존만
        if (line.startsWith("source ") || line.startsWith("setopt ")) {
            r.unknownLines.push(raw);
            continue;
        }

        r.unknownLines.push(raw);
    }
    return {...r, value: v};
}

// ----------------------------------------------------------------------
// Helix: config.toml — 단순 TOML 파서 (섹션 + key=value)
// ----------------------------------------------------------------------

export function importHelixToml(text: string): ImportResult<HelixConfig> {
    const r = emptyResult<HelixConfig>();
    const v: Partial<HelixConfig> = {};

    let section = "";
    const lines = text.split(/\r?\n/);
    for (const raw of lines) {
        const line = raw.replace(/#.*$/, "").trim();
        if (!line) continue;
        const sectionMatch = line.match(/^\[([\w.-]+)\]$/);
        if (sectionMatch) {
            section = sectionMatch[1];
            continue;
        }
        const kvMatch = line.match(/^([\w-]+)\s*=\s*(.+)$/);
        if (!kvMatch) {
            r.unknownLines.push(raw);
            continue;
        }
        const [, key, valueRaw] = kvMatch;
        const tval = parseTomlValue(valueRaw.trim());
        if (tval === undefined) {
            r.unknownLines.push(raw);
            continue;
        }

        const fullKey = section ? `${section}.${key}` : key;
        switch (fullKey) {
            case "theme":
                v.theme = String(tval) as HelixConfig["theme"];
                r.applied++;
                break;
            case "editor.line-number":
                if (tval === "absolute" || tval === "relative") {
                    v.lineNumber = tval;
                    r.applied++;
                }
                break;
            case "editor.mouse":
                v.mouse = Boolean(tval);
                r.applied++;
                break;
            case "editor.middle-click-paste":
                v.middleClickPaste = Boolean(tval);
                r.applied++;
                break;
            case "editor.scrolloff":
                v.scrolloff = Number(tval) || 0;
                r.applied++;
                break;
            case "editor.bufferline":
                v.bufferline = tval as HelixConfig["bufferline"];
                r.applied++;
                break;
            case "editor.cursorline":
                v.cursorline = Boolean(tval);
                r.applied++;
                break;
            case "editor.auto-format":
                v.autoFormat = Boolean(tval);
                r.applied++;
                break;
            case "editor.auto-save":
                v.autoSave = Boolean(tval);
                r.applied++;
                break;
            case "editor.true-color":
                v.trueColor = Boolean(tval);
                r.applied++;
                break;
            case "editor.auto-completion":
                v.autoCompletion = Boolean(tval);
                r.applied++;
                break;
            case "editor.idle-timeout":
                v.idleTimeoutMs = Number(tval) || 0;
                r.applied++;
                break;
            case "editor.completion-trigger-len":
                v.completionTrigger = Number(tval) || 2;
                r.applied++;
                break;
            case "editor.color-modes":
                v.color_modes = Boolean(tval);
                r.applied++;
                break;
            case "editor.text-width":
                v.text_width = Number(tval) || 80;
                r.applied++;
                break;
            case "editor.rulers":
                if (Array.isArray(tval)) {
                    v.rulers = tval.map(Number).filter(n => !isNaN(n));
                    r.applied++;
                }
                break;
            case "editor.cursor-shape.insert":
                v.cursorInsert = tval as HelixConfig["cursorInsert"];
                r.applied++;
                break;
            case "editor.cursor-shape.normal":
                v.cursorNormal = tval as HelixConfig["cursorNormal"];
                r.applied++;
                break;
            case "editor.cursor-shape.select":
                v.cursorSelect = tval as HelixConfig["cursorSelect"];
                r.applied++;
                break;
            case "editor.indent-guides.render":
                v.indentGuides = Boolean(tval);
                r.applied++;
                break;
            case "editor.indent-guides.character":
                v.indentGuideCharacter = String(tval);
                r.applied++;
                break;
            case "editor.statusline.left":
                if (Array.isArray(tval)) {
                    v.statuslineLeft = tval.map(String);
                    r.applied++;
                }
                break;
            case "editor.statusline.center":
                if (Array.isArray(tval)) {
                    v.statuslineCenter = tval.map(String);
                    r.applied++;
                }
                break;
            case "editor.statusline.right":
                if (Array.isArray(tval)) {
                    v.statuslineRight = tval.map(String);
                    r.applied++;
                }
                break;
            case "editor.lsp.enable":
                v.lspEnable = Boolean(tval);
                r.applied++;
                break;
            case "editor.lsp.display-messages":
                v.lspDisplayMessages = Boolean(tval);
                r.applied++;
                break;
            case "editor.lsp.display-inlay-hints":
                v.lspDisplayInlayHints = Boolean(tval);
                r.applied++;
                break;
            case "editor.lsp.auto-signature-help":
                v.lspAutoSignatureHelp = Boolean(tval);
                r.applied++;
                break;
            case "editor.file-picker.hidden":
                v.filePickerHidden = Boolean(tval);
                r.applied++;
                break;
            case "editor.file-picker.git-ignore":
                v.filePickerGitIgnore = Boolean(tval);
                r.applied++;
                break;
            default:
                r.unknownLines.push(raw);
        }
    }
    return {...r, value: v};
}

// ----------------------------------------------------------------------
// Neovim: init.lua — best-effort lua 파서 (정규식)
// ----------------------------------------------------------------------

export function importNvimInit(text: string): ImportResult<NvimConfig> {
    const r = emptyResult<NvimConfig>();
    const v: Partial<NvimConfig> = {plugins: [], keymaps: [], lspServers: []};

    // vim.g.mapleader = " "
    const leader = text.match(/vim\.g\.mapleader\s*=\s*["'](.+?)["']/);
    if (leader) {
        v.leaderKey = leader[1];
        r.applied++;
    }
    // vim.opt.number = true
    const optBool = (key: string, field: keyof NvimConfig) => {
        const m = text.match(new RegExp(`vim\\.opt\\.${key}\\s*=\\s*(true|false)`));
        if (m) {
            (v as Record<string, unknown>)[field as string] = m[1] === "true";
            r.applied++;
        }
    };
    const optNum = (key: string, field: keyof NvimConfig) => {
        const m = text.match(new RegExp(`vim\\.opt\\.${key}\\s*=\\s*(\\d+)`));
        if (m) {
            (v as Record<string, unknown>)[field as string] = Number(m[1]);
            r.applied++;
        }
    };
    optBool("number", "lineNumbers");
    optBool("relativenumber", "relativeNumbers");
    optNum("tabstop", "tabWidth");
    optBool("expandtab", "expandTab");
    optBool("wrap", "wrap");
    optNum("scrolloff", "scrolloff");
    optNum("sidescrolloff", "sidescrolloff");
    optBool("ignorecase", "ignorecase");
    optBool("smartcase", "smartcase");

    // vim.opt.mouse = "a"
    const mouseMatch = text.match(/vim\.opt\.mouse\s*=\s*["'](.*?)["']/);
    if (mouseMatch) {
        v.mouse = mouseMatch[1].length > 0;
        r.applied++;
    }
    // vim.opt.clipboard = "unnamedplus"
    const clipMatch = text.match(/vim\.opt\.clipboard\s*=\s*["'](.*?)["']/);
    if (clipMatch) {
        v.clipboard = clipMatch[1].includes("unnamedplus") ? "unnamedplus" : "default";
        r.applied++;
    }
    // vim.cmd.colorscheme("tokyonight")
    const colorMatch = text.match(/vim\.cmd\.colorscheme\(["'](.+?)["']\)/);
    if (colorMatch) {
        v.colorscheme = colorMatch[1] as NvimConfig["colorscheme"];
        r.applied++;
    }
    // lualine
    if (/require\(["']lualine["']\)/.test(text)) {
        v.statusline = "lualine";
        v.plugins = [...(v.plugins ?? []), "lualine"];
        r.applied++;
    }

    // 플러그인 후보 (lazy.nvim setup 안에서 추출)
    const pluginIdByRepo: Record<string, string> = {
        "nvim-telescope/telescope.nvim": "telescope",
        "nvim-treesitter/nvim-treesitter": "treesitter",
        "neovim/nvim-lspconfig": "lspconfig",
        "williamboman/mason.nvim": "mason",
        "williamboman/mason-lspconfig.nvim": "mason-lspconfig",
        "nvim-lualine/lualine.nvim": "lualine",
        "nvim-neo-tree/neo-tree.nvim": "neo-tree",
        "lewis6991/gitsigns.nvim": "gitsigns",
        "folke/which-key.nvim": "which-key",
        "folke/tokyonight.nvim": "tokyonight",
        "stevearc/conform.nvim": "conform",
        "hrsh7th/nvim-cmp": "cmp",
        "catppuccin/nvim": "catppuccin",
        "ellisonleao/gruvbox.nvim": "gruvbox",
        "shaunsingh/nord.nvim": "nord",
        "rose-pine/neovim": "rose-pine",
        "rebelot/kanagawa.nvim": "kanagawa"
    };
    for (const [repo, id] of Object.entries(pluginIdByRepo)) {
        if (text.includes(repo)) {
            if (!v.plugins!.includes(id)) {
                v.plugins!.push(id);
                r.applied++;
            }
        }
    }

    // format_on_save
    if (/format_on_save/.test(text)) {
        v.formatOnSave = true;
        r.applied++;
    }

    // unmatched 줄은 모두 unknown으로
    const lines = text.split(/\r?\n/);
    for (const raw of lines) {
        const l = raw.trim();
        if (!l || l.startsWith("--") || l.startsWith("vim.")) continue;
        // 이미 처리한 패턴은 알려진 것으로 간주
        if (/require\(["'].+?["']\)/.test(l)) continue;
        if (/colorscheme|format_on_save|lualine/.test(l)) continue;
        if (l === "})" || l.startsWith("{") || l.startsWith("}")) continue;
        r.unknownLines.push(raw);
    }

    return {...r, value: v};
}

// ----------------------------------------------------------------------
// Warp: 테마 YAML
// ----------------------------------------------------------------------

export function importWarpTheme(text: string): ImportResult<WarpConfig> {
    const r = emptyResult<WarpConfig>();
    const v: Partial<WarpConfig> = {};

    const lines = text.split(/\r?\n/);
    let section: string[] = []; // 들여쓰기 트래킹용 (path)
    let pendingNormal: Partial<WarpTerminalColors> = {};
    let pendingBright: Partial<WarpTerminalColors> = {};
    const theme: Partial<WarpConfig["theme"]> = {};

    for (const raw of lines) {
        if (!raw.trim() || raw.trim().startsWith("#")) continue;
        const indent = raw.match(/^(\s*)/)?.[1].length ?? 0;
        const trimmed = raw.trim();
        const depth = Math.floor(indent / 2);

        // 섹션 추적 (단순화: deeper면 push, shallower면 pop)
        section = section.slice(0, depth);
        const kv = trimmed.match(/^([\w_-]+):\s*(.*)$/);
        if (!kv) continue;
        const [, key, value] = kv;
        const cleanValue = stripQuotes(value).trim();

        if (depth === 0) {
            // top-level
            if (key === "name") {
                v.themeName = cleanValue;
                r.applied++;
            }
            else if (key === "accent") {
                theme.accent = cleanValue;
                r.applied++;
            }
            else if (key === "background") {
                theme.background = cleanValue;
                r.applied++;
            }
            else if (key === "foreground") {
                theme.foreground = cleanValue;
                r.applied++;
            }
            else if (key === "details") {
                theme.details = cleanValue === "lighter" ? "lighter" : "darker";
                r.applied++;
            }
            else if (key === "terminal_colors") {
                section = ["terminal_colors"];
            }
            else {
                r.unknownLines.push(raw);
            }
        }
        else if (depth === 1 && section[0] === "terminal_colors") {
            if (key === "normal" || key === "bright") {
                section = ["terminal_colors", key];
            }
        }
        else if (depth === 2 && section[0] === "terminal_colors") {
            const palette = section[1];
            const target = palette === "normal" ? pendingNormal : pendingBright;
            if (
                ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"].includes(
                    key
                )
            ) {
                target[key as keyof WarpTerminalColors] = cleanValue;
                r.applied++;
            }
        }
    }

    // 보강: 누락된 색은 default와 병합 — 호출 측에서 처리
    if (Object.keys(pendingNormal).length > 0 || Object.keys(pendingBright).length > 0) {
        theme.normal = pendingNormal as WarpTerminalColors;
        theme.bright = pendingBright as WarpTerminalColors;
    }
    if (Object.keys(theme).length > 0) {
        v.theme = theme as WarpConfig["theme"];
    }
    return {...r, value: v};
}

// ----------------------------------------------------------------------
// utils
// ----------------------------------------------------------------------

function stripQuotes(s: string): string {
    return s.replace(/^['"]|['"]$/g, "").trim();
}

function parseTomlValue(s: string): unknown {
    if (s === "true") return true;
    if (s === "false") return false;
    if (/^-?\d+$/.test(s)) return Number(s);
    if (/^-?\d+\.\d+$/.test(s)) return Number(s);
    // 배열 [1, 2, 3] / ["a", "b"]
    if (s.startsWith("[") && s.endsWith("]")) {
        const inner = s.slice(1, -1).trim();
        if (!inner) return [];
        return inner.split(",").map(x => parseTomlValue(x.trim()));
    }
    // 문자열 "..."
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        return s.slice(1, -1);
    }
    return s;
}
