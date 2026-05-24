import {describe, expect, test} from "vitest";
import {
    importTmuxConf,
    importZshrc,
    importHelixToml,
    importNvimInit,
    importWarpTheme
} from "./importers";

describe("importTmuxConf", () => {
    test("recognizes known set keys", () => {
        const text = `set -g prefix C-a
set -g mouse on
set -g base-index 1
set -g status-position top`;
        const r = importTmuxConf(text);
        expect(r.value.prefix).toBe("C-a");
        expect(r.value.mouse).toBe(true);
        expect(r.value.baseIndex).toBe(1);
        expect(r.value.statusPosition).toBe("top");
        expect(r.applied).toBe(4);
    });

    test("preserves unknown lines instead of silently dropping", () => {
        const text = `set -g prefix C-a
bind r source-file ~/.tmux.conf
some-arbitrary-line that the parser does not know`;
        const r = importTmuxConf(text);
        expect(r.unknownLines.length).toBeGreaterThan(0);
        // bind 줄도 unknown으로 보존 (Phase 2에서 흡수 예정)
        expect(r.unknownLines.some(l => l.includes("bind r"))).toBe(true);
    });

    test("empty input produces ok with zero applied", () => {
        const r = importTmuxConf("");
        expect(r.ok).toBe(true);
        expect(r.applied).toBe(0);
    });
});

describe("importZshrc", () => {
    test("extracts ZSH_THEME and maps to prompt enum", () => {
        const text = `ZSH_THEME="starship"`;
        const r = importZshrc(text);
        expect(r.value.prompt).toBe("starship");
    });

    test("unknown theme falls back to default but still applied counter increments", () => {
        const text = `ZSH_THEME="something-custom"`;
        const r = importZshrc(text);
        expect(r.value.prompt).toBe("default");
        expect(r.applied).toBe(1);
    });

    test("extracts aliases", () => {
        const text = `alias ll='ls -lah'
alias gs="git status"`;
        const r = importZshrc(text);
        expect(r.value.aliases).toHaveLength(2);
        expect(r.value.aliases![0]).toEqual({name: "ll", value: "ls -lah"});
        expect(r.value.aliases![1]).toEqual({name: "gs", value: "git status"});
    });

    test("PATH export is split into entries", () => {
        const text = `export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin`;
        const r = importZshrc(text);
        expect(r.value.pathEntries).toContain("/usr/local/bin");
        expect(r.value.pathEntries).toContain("/opt/homebrew/bin");
    });

    test("source / setopt lines preserved in unknownLines", () => {
        const text = `source /opt/zsh/extra.sh
setopt AUTO_CD`;
        const r = importZshrc(text);
        expect(r.unknownLines).toHaveLength(2);
    });
});

describe("importHelixToml", () => {
    test("extracts theme and editor block", () => {
        const text = `theme = "tokyonight"

[editor]
line-number = "relative"
mouse = false
scrolloff = 10`;
        const r = importHelixToml(text);
        expect(r.value.theme).toBe("tokyonight");
        expect(r.value.lineNumber).toBe("relative");
        expect(r.value.mouse).toBe(false);
        expect(r.value.scrolloff).toBe(10);
    });

    test("handles editor.cursor-shape section", () => {
        const text = `[editor.cursor-shape]
insert = "bar"
normal = "block"`;
        const r = importHelixToml(text);
        expect(r.value.cursorInsert).toBe("bar");
        expect(r.value.cursorNormal).toBe("block");
    });

    test("array values are parsed (rulers, statusline)", () => {
        const text = `[editor]
rulers = [80, 120]

[editor.statusline]
left = ["mode", "file-name"]`;
        const r = importHelixToml(text);
        expect(r.value.rulers).toEqual([80, 120]);
        expect(r.value.statuslineLeft).toEqual(["mode", "file-name"]);
    });

    test("unknown keys preserved in unknownLines (no silent drop)", () => {
        const text = `[editor]
some-future-key = true`;
        const r = importHelixToml(text);
        expect(r.unknownLines.length).toBeGreaterThan(0);
    });
});

describe("importNvimInit", () => {
    test("extracts vim.opt boolean settings", () => {
        const text = `vim.opt.number = true
vim.opt.relativenumber = false
vim.opt.wrap = false`;
        const r = importNvimInit(text);
        expect(r.value.lineNumbers).toBe(true);
        expect(r.value.relativeNumbers).toBe(false);
        expect(r.value.wrap).toBe(false);
    });

    test("extracts colorscheme call", () => {
        const text = `vim.cmd.colorscheme("tokyonight")`;
        const r = importNvimInit(text);
        expect(r.value.colorscheme).toBe("tokyonight");
    });

    test("recognizes lazy.nvim plugin repos", () => {
        const text = `{
  "nvim-telescope/telescope.nvim",
  "neovim/nvim-lspconfig",
  "folke/tokyonight.nvim"
}`;
        const r = importNvimInit(text);
        expect(r.value.plugins).toContain("telescope");
        expect(r.value.plugins).toContain("lspconfig");
        expect(r.value.plugins).toContain("tokyonight");
    });

    test("unknown free-form lua lines preserved", () => {
        const text = `local foo = require("something")
print("hello")`;
        const r = importNvimInit(text);
        expect(r.unknownLines.length).toBeGreaterThan(0);
    });
});

describe("importWarpTheme", () => {
    test("extracts theme metadata", () => {
        const text = `name: My Theme
accent: "#ff0000"
background: "#000000"
foreground: "#ffffff"
details: darker`;
        const r = importWarpTheme(text);
        expect(r.value.themeName).toBe("My Theme");
        expect(r.value.theme?.accent).toBe("#ff0000");
        expect(r.value.theme?.background).toBe("#000000");
        expect(r.value.theme?.foreground).toBe("#ffffff");
        expect(r.value.theme?.details).toBe("darker");
    });

    test("extracts normal/bright terminal colors", () => {
        const text = `name: T
terminal_colors:
  normal:
    black: "#000000"
    red: "#ff5555"
  bright:
    black: "#666666"`;
        const r = importWarpTheme(text);
        expect(r.value.theme?.normal?.black).toBe("#000000");
        expect(r.value.theme?.normal?.red).toBe("#ff5555");
        expect(r.value.theme?.bright?.black).toBe("#666666");
    });
});
