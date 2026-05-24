import {describe, expect, test} from "vitest";
import {parseGhosttyConfig, serializeGhosttyConfig} from "./parse";
import {ghosttyDefaults, PALETTE_DEFAULT} from "@/data/ghosttySchema";

describe("Ghostty serialize", () => {
    test("defaults vs defaults produces minimal output (no field diffs)", () => {
        const defaults = ghosttyDefaults();
        const out = serializeGhosttyConfig(
            defaults,
            defaults,
            PALETTE_DEFAULT.slice(),
            PALETTE_DEFAULT.slice(),
            [],
            []
        );
        // 헤더 + 생성 시각만 있어야 함 — 필드 차이 없음
        const fieldLines = out
            .split("\n")
            .filter(l => l && !l.startsWith("#") && !l.startsWith("generated"));
        expect(fieldLines.length).toBe(0);
    });

    test("modified field is emitted", () => {
        const defaults = ghosttyDefaults();
        const current = {...defaults, "font-size": 16};
        const out = serializeGhosttyConfig(
            current,
            defaults,
            PALETTE_DEFAULT.slice(),
            PALETTE_DEFAULT.slice(),
            [],
            []
        );
        expect(out).toContain("font-size = 16");
    });

    test("palette diff is emitted as palette = N=#hex", () => {
        const defaults = ghosttyDefaults();
        const customPalette = PALETTE_DEFAULT.slice();
        customPalette[4] = "#7aa2f7";
        const out = serializeGhosttyConfig(
            defaults,
            defaults,
            customPalette,
            PALETTE_DEFAULT.slice(),
            [],
            []
        );
        expect(out).toMatch(/palette\s*=\s*4\s*=\s*#7aa2f7/);
    });

    test("keybinds appear in output", () => {
        const defaults = ghosttyDefaults();
        const out = serializeGhosttyConfig(
            defaults,
            defaults,
            PALETTE_DEFAULT.slice(),
            PALETTE_DEFAULT.slice(),
            ["ctrl+shift+t=new_tab"],
            []
        );
        expect(out).toContain("keybind = ctrl+shift+t=new_tab");
    });
});

describe("Ghostty parse — preserves unknown lines", () => {
    test("known keys land in raw map", () => {
        const text = "font-family = JetBrains Mono\nfont-size = 14";
        const parsed = parseGhosttyConfig(text);
        expect(parsed.raw["font-family"]).toBe("JetBrains Mono");
        expect(parsed.raw["font-size"]).toBe("14");
        expect(parsed.unknownLines.length).toBe(0);
    });

    test("unknown / malformed lines preserved in unknownLines (no silent data loss)", () => {
        const text = `font-family = JetBrains Mono
this-is-not-a-real-key = something
=missing-key
some completely free-form comment without prefix`;
        const parsed = parseGhosttyConfig(text);
        // 알려진 줄은 raw로
        expect(parsed.raw["font-family"]).toBe("JetBrains Mono");
        // 인식 못 한 키도 raw에 들어가서 보존되거나 (parser는 키만 있으면 통과시킴),
        // 형식 자체가 깨진 줄은 unknownLines에 들어가야 함.
        // 적어도 정보 손실은 없어야 한다.
        const total =
            Object.keys(parsed.raw).length +
            parsed.unknownLines.length +
            (parsed.keybind?.length ?? 0);
        expect(total).toBeGreaterThan(0);
        // "=missing-key"처럼 키 없는 형식은 unknownLines에 잡혀야 한다
        expect(
            parsed.unknownLines.some(l => l.includes("=missing-key") || l.includes("free-form"))
        ).toBe(true);
    });

    test("keybind = ... lines are captured separately", () => {
        const text = "keybind = ctrl+shift+t=new_tab\nkeybind = cmd+enter=toggle_fullscreen";
        const parsed = parseGhosttyConfig(text);
        expect(parsed.keybind).toContain("ctrl+shift+t=new_tab");
        expect(parsed.keybind).toContain("cmd+enter=toggle_fullscreen");
    });

    test("palette lines populate palette array by index", () => {
        const text = "palette = 0=#000000\npalette = 4=#7aa2f7";
        const parsed = parseGhosttyConfig(text);
        expect(parsed.palette[0]).toBe("#000000");
        expect(parsed.palette[4]).toBe("#7aa2f7");
    });

    test("comments and blank lines are ignored, not stored as unknown", () => {
        const text = `# comment

# another comment
font-family = Fira Code
`;
        const parsed = parseGhosttyConfig(text);
        expect(parsed.raw["font-family"]).toBe("Fira Code");
        // 주석은 정보가 아니므로 unknownLines에 누적되어 사용자에게 노출되면 안 됨
        const onlyComments = parsed.unknownLines.filter(l => l.trim().startsWith("#"));
        expect(onlyComments.length).toBe(0);
    });
});
