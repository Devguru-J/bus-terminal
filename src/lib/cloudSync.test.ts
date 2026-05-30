import {describe, expect, it, vi} from "vitest";
import {listCloudSnapshots, saveCloudSnapshot, deleteCloudSnapshot} from "./cloudSync";
import {SupabaseNotConfiguredError} from "./supabase";

vi.mock("./supabase", () => {
    class SupabaseNotConfiguredError extends Error {
        constructor() {
            super("클라우드 동기화가 설정되어 있지 않아요.");
            this.name = "SupabaseNotConfiguredError";
        }
    }

    return {
        SupabaseNotConfiguredError,
        requireSupabase: () => {
            throw new SupabaseNotConfiguredError();
        }
    };
});

// cloudSync는 Supabase 클라이언트가 없을 때 네트워크를 시도하지 않고 빠르게 실패해야 한다.

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
