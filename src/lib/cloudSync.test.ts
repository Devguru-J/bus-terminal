import {describe, it, expect} from "vitest";
import {listCloudSnapshots, saveCloudSnapshot, deleteCloudSnapshot} from "./cloudSync";
import {SupabaseNotConfiguredError} from "./supabase";

// env가 비어 있는 테스트 환경에서 모든 cloudSync 호출은
// SupabaseNotConfiguredError로 빠르게 실패해야 한다 (silent 시도 금지).

describe("cloudSync (not configured)", () => {
    it("listCloudSnapshots rejects with SupabaseNotConfiguredError", async () => {
        await expect(listCloudSnapshots()).rejects.toBeInstanceOf(SupabaseNotConfiguredError);
    });

    it("saveCloudSnapshot rejects with SupabaseNotConfiguredError", async () => {
        await expect(
            saveCloudSnapshot("test", {
                $schema: "bus-terminal-backup",
                version: 1,
                exportedAt: new Date().toISOString(),
                data: {}
            })
        ).rejects.toBeInstanceOf(SupabaseNotConfiguredError);
    });

    it("deleteCloudSnapshot rejects with SupabaseNotConfiguredError", async () => {
        await expect(deleteCloudSnapshot("any-id")).rejects.toBeInstanceOf(SupabaseNotConfiguredError);
    });
});
