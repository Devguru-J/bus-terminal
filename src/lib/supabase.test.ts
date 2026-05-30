import {afterEach, describe, expect, it, vi} from "vitest";

async function loadSupabaseWithEnv(url: string, anonKey: string) {
    vi.resetModules();
    vi.stubEnv("VITE_SUPABASE_URL", url);
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", anonKey);
    return import("./supabase");
}

describe("supabase config", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("isSupabaseConfigured is false when env is blank", async () => {
        const {isSupabaseConfigured} = await loadSupabaseWithEnv("", "");
        expect(isSupabaseConfigured).toBe(false);
    });

    it("supabase client is null when not configured", async () => {
        const {supabase} = await loadSupabaseWithEnv("", "");
        expect(supabase).toBeNull();
    });

    it("requireSupabase throws SupabaseNotConfiguredError when not configured", async () => {
        const {requireSupabase, SupabaseNotConfiguredError} = await loadSupabaseWithEnv("", "");
        expect(() => requireSupabase()).toThrow(SupabaseNotConfiguredError);
    });

    it("SupabaseNotConfiguredError carries a user-friendly message", async () => {
        const {requireSupabase, SupabaseNotConfiguredError} = await loadSupabaseWithEnv("", "");
        try {
            requireSupabase();
        } catch (e) {
            expect(e).toBeInstanceOf(SupabaseNotConfiguredError);
            expect((e as Error).message).toContain("클라우드 동기화");
        }
    });

    it("creates a client when env is present", async () => {
        const {isSupabaseConfigured, supabase} = await loadSupabaseWithEnv(
            "https://example.supabase.co",
            "anon-key"
        );
        expect(isSupabaseConfigured).toBe(true);
        expect(supabase).not.toBeNull();
    });
});
