import {describe, expect, test} from "vitest";
import {buildInstallScript, shellSingleQuoteEscape} from "./installScript";
import type {ExportPlatform} from "./exportSelection";

describe("shellSingleQuoteEscape — ANSI-C bash quoting", () => {
    test("plain ASCII is wrapped in $'...'", () => {
        expect(shellSingleQuoteEscape("hello world")).toBe("$'hello world'");
    });

    test("single quote is escaped (\\')", () => {
        const result = shellSingleQuoteEscape("it's a config");
        expect(result).toBe("$'it\\'s a config'");
        // 인용 차단 검증: 원시 작은따옴표가 그대로 들어가면 안 됨
        const inner = result.slice(2, -1);
        expect(inner.match(/(^|[^\\])'/)).toBeNull();
    });

    test("backslash is doubled BEFORE other replacements (order matters)", () => {
        expect(shellSingleQuoteEscape("a\\b")).toBe("$'a\\\\b'");
        // 다른 문자가 추가로 도입한 백슬래시가 이중 이스케이프되면 안 됨 — 원본 백슬래시만 \\\\
    });

    test("backslash + single quote together", () => {
        expect(shellSingleQuoteEscape("a\\'b")).toBe("$'a\\\\\\'b'");
        // 원본 \\ → \\\\, 원본 ' → \\' — 합치면 \\\\\\\\'  (JS 리터럴 표기로 \\\\\\')
    });

    test("newlines become \\n", () => {
        expect(shellSingleQuoteEscape("line1\nline2")).toBe("$'line1\\nline2'");
    });

    test("CR is stripped (\\r removed)", () => {
        expect(shellSingleQuoteEscape("a\r\nb")).toBe("$'a\\nb'");
    });

    test("real-world: alias with single quote in value", () => {
        const input = `alias greet='echo "hello, it'\\''s me"'`;
        const out = shellSingleQuoteEscape(input);
        // $'...' 안에 raw ' 가 남으면 안 됨
        const inner = out.slice(2, -1);
        expect(inner.match(/(^|[^\\])'/)).toBeNull();
    });

    test("safe against injection attempts (semicolon, $(...), backtick)", () => {
        const malicious = "x'; rm -rf /; echo '";
        const out = shellSingleQuoteEscape(malicious);
        // bash가 `$'...'`로 보는 한, 내부에 raw `'`가 없으면 새 명령어가 시작될 수 없음
        const inner = out.slice(2, -1);
        expect(inner.match(/(^|[^\\])'/)).toBeNull();
    });

    test("empty string", () => {
        expect(shellSingleQuoteEscape("")).toBe("$''");
    });

    test("unicode / Korean is preserved as-is", () => {
        expect(shellSingleQuoteEscape("안녕 hello")).toBe("$'안녕 hello'");
    });
});

describe("buildInstallScript — selected platforms only", () => {
    const allFalse: Record<ExportPlatform, boolean> = {
        ghostty: false,
        warp: false,
        iterm2: false,
        neovim: false,
        helix: false,
        zsh: false,
        tmux: false
    };
    const labels: Record<ExportPlatform, string> = {
        ghostty: "Ghostty",
        warp: "Warp",
        iterm2: "iTerm2",
        neovim: "Neovim",
        helix: "Helix",
        zsh: "Zsh",
        tmux: "tmux"
    };
    const allFiles = {
        ghostty: "ghostty content",
        tmux: "tmux content",
        nvim: "nvim content",
        zsh: "zsh content",
        starship: "",
        helix: "helix content",
        helixLanguages: "",
        itermColors: "iterm colors",
        itermProfile: "iterm profile",
        warpTheme: "warp theme",
        warpWorkflows: "",
        warpSettings: "warp settings"
    };

    test("script header includes shebang and selected platform list", () => {
        const script = buildInstallScript({
            selected: {...allFalse, ghostty: true},
            labels,
            ...allFiles
        });
        expect(script.startsWith("#!/usr/bin/env bash")).toBe(true);
        expect(script).toContain("대상 플랫폼: Ghostty");
        expect(script).not.toContain("대상 플랫폼: Ghostty + tmux");
    });

    test("nothing selected → 대상 플랫폼: (none)", () => {
        const script = buildInstallScript({
            selected: allFalse,
            labels,
            ...allFiles
        });
        expect(script).toContain("대상 플랫폼: (none)");
    });

    test("only selected platforms produce write_file calls", () => {
        const script = buildInstallScript({
            selected: {...allFalse, ghostty: true, helix: true},
            labels,
            ...allFiles
        });
        expect(script).toContain("$HOME/.config/ghostty/config");
        expect(script).toContain("$HOME/.config/helix/config.toml");
        expect(script).not.toContain("$HOME/.tmux.conf");
        expect(script).not.toContain("$HOME/.zshrc");
    });

    test("optional files only included when content is non-empty", () => {
        const withStarship = buildInstallScript({
            selected: {...allFalse, zsh: true},
            labels,
            ...allFiles,
            starship: "starship content"
        });
        expect(withStarship).toContain("$HOME/.config/starship.toml");

        const withoutStarship = buildInstallScript({
            selected: {...allFalse, zsh: true},
            labels,
            ...allFiles,
            starship: ""
        });
        expect(withoutStarship).not.toContain("starship.toml");
    });

    test("install script content is properly escaped (single quotes don't break out)", () => {
        const dangerous = "alias x='evil'; rm -rf $HOME";
        const script = buildInstallScript({
            selected: {...allFalse, zsh: true},
            labels,
            ...allFiles,
            zsh: dangerous
        });
        // 사용자 입력이 $'...' 안에 들어가야 함. 그 안에서 raw ' 는 백슬래시로 escaping되어야 함.
        // 위험한 패턴 `'; rm -rf` 그대로가 script에 노출되면 안 됨.
        expect(script).not.toMatch(/[^\\]';\s*rm\s+-rf/);
    });
});
