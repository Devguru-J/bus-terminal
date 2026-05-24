import {describe, expect, test} from "vitest";
import {
    computeInitialSelection,
    countSelected,
    isExportEmpty,
    selectAllPlatforms,
    selectNoPlatforms,
    type ExportPlatform
} from "./exportSelection";

function makeModified(overrides: Partial<Record<ExportPlatform, boolean>> = {}): Record<ExportPlatform, boolean> {
    return {
        ghostty: false,
        warp: false,
        iterm2: false,
        neovim: false,
        helix: false,
        zsh: false,
        tmux: false,
        ...overrides
    };
}

describe("export selection", () => {
    test("defaults to modified platforms only — nothing modified means nothing selected", () => {
        const modified = makeModified();
        const initial = computeInitialSelection(modified);
        expect(countSelected(initial)).toBe(0);
        expect(initial).toEqual(makeModified());
    });

    test("defaults to modified platforms only — single platform", () => {
        const modified = makeModified({ghostty: true});
        const initial = computeInitialSelection(modified);
        expect(initial.ghostty).toBe(true);
        expect(initial.warp).toBe(false);
        expect(initial.tmux).toBe(false);
        expect(countSelected(initial)).toBe(1);
    });

    test("defaults to modified platforms only — multiple platforms", () => {
        const modified = makeModified({ghostty: true, warp: true, helix: true});
        const initial = computeInitialSelection(modified);
        expect(initial).toEqual(
            makeModified({ghostty: true, warp: true, helix: true})
        );
        expect(countSelected(initial)).toBe(3);
    });

    test("never falls back to all-selected when nothing modified (regression guard)", () => {
        // 가장 위험한 회귀 — 미수정 fallback이 전체 체크로 되돌아가면 안 됨.
        const modified = makeModified();
        const initial = computeInitialSelection(modified);
        expect(Object.values(initial).every(v => v === false)).toBe(true);
    });

    test("isExportEmpty true only when nothing modified and nothing selected", () => {
        expect(isExportEmpty(makeModified(), selectNoPlatforms())).toBe(true);
        expect(isExportEmpty(makeModified({ghostty: true}), selectNoPlatforms())).toBe(false);
        expect(
            isExportEmpty(makeModified(), {...selectNoPlatforms(), ghostty: true})
        ).toBe(false);
    });

    test("selectAllPlatforms checks every platform", () => {
        const all = selectAllPlatforms();
        expect(countSelected(all)).toBe(7);
    });

    test("selectNoPlatforms unchecks every platform", () => {
        const none = selectNoPlatforms();
        expect(countSelected(none)).toBe(0);
    });
});
