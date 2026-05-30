import {describe, expect, it} from "vitest";
import {APPLY_GUIDES, APPLY_GUIDE_ORDER} from "./applyGuide";
import {EXPORT_PLATFORMS} from "./exportSelection";

describe("apply guides", () => {
    it("covers every export platform", () => {
        expect(APPLY_GUIDE_ORDER).toEqual(EXPORT_PLATFORMS);
        for (const platform of EXPORT_PLATFORMS) {
            expect(APPLY_GUIDES[platform]).toBeTruthy();
        }
    });

    it("includes commands and destination mapping for every platform", () => {
        for (const guide of Object.values(APPLY_GUIDES)) {
            expect(guide.files.length).toBeGreaterThan(0);
            expect(guide.commands.length).toBeGreaterThan(0);
            expect(guide.verify.length).toBeGreaterThan(10);
        }
    });
});
