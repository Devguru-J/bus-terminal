import {requireSupabase} from "@/lib/supabase";
import type {BackupPayload} from "@/lib/localBackup";

export interface CloudSnapshot {
    id: string;
    user_id: string;
    label: string;
    data: BackupPayload;
    created_at: string;
    updated_at: string;
}

const SNAPSHOT_TABLE = "bus_terminal_snapshots";

function normalizeSnapshot(row: unknown): CloudSnapshot {
    const r = row as CloudSnapshot;
    return {
        id: r.id,
        user_id: r.user_id,
        label: r.label,
        data: r.data,
        created_at: r.created_at,
        updated_at: r.updated_at
    };
}

async function getCurrentUserId(): Promise<string> {
    const supabase = requireSupabase();
    const {data, error} = await supabase.auth.getUser();
    if (error) throw error;
    if (!data.user) throw new Error("로그인이 필요합니다.");
    return data.user.id;
}

export async function listCloudSnapshots(): Promise<CloudSnapshot[]> {
    const supabase = requireSupabase();
    const userId = await getCurrentUserId();
    const {data, error} = await supabase
        .from(SNAPSHOT_TABLE)
        .select("id,user_id,label,data,created_at,updated_at")
        .eq("user_id", userId)
        .order("updated_at", {ascending: false});

    if (error) throw error;
    return (data ?? []).map(normalizeSnapshot);
}

export async function saveCloudSnapshot(label: string, payload: BackupPayload): Promise<CloudSnapshot> {
    const supabase = requireSupabase();
    const userId = await getCurrentUserId();

    const {data, error} = await supabase
        .from(SNAPSHOT_TABLE)
        .insert({
            user_id: userId,
            label,
            data: payload
        })
        .select("id,user_id,label,data,created_at,updated_at")
        .single();

    if (error) throw error;
    return normalizeSnapshot(data);
}

export async function deleteCloudSnapshot(id: string) {
    const supabase = requireSupabase();
    const userId = await getCurrentUserId();
    const {error} = await supabase
        .from(SNAPSHOT_TABLE)
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
    if (error) throw error;
}
