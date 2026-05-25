import {describe, it, expect} from "vitest";
import {isSupabaseConfigured, supabase, requireSupabase, SupabaseNotConfiguredError} from "./supabase";

// 테스트 환경: VITE_SUPABASE_URL / KEY 없음 → 비설정 상태가 기본.

describe("supabase config", () => {
    it("isSupabaseConfigured is false when env is unset", () => {
        expect(isSupabaseConfigured).toBe(false);
    });

    it("supabase client is null when not configured", () => {
        expect(supabase).toBeNull();
    });

    it("requireSupabase throws SupabaseNotConfiguredError when not configured", () => {
        expect(() => requireSupabase()).toThrow(SupabaseNotConfiguredError);
    });

    it("SupabaseNotConfiguredError carries a user-friendly message", () => {
        try {
            requireSupabase();
        } catch (e) {
            expect(e).toBeInstanceOf(SupabaseNotConfiguredError);
            expect((e as Error).message).toContain("클라우드 동기화");
        }
    });
});
