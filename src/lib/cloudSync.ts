import {supabase} from "@/lib/supabase";
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

export async function listCloudSnapshots(): Promise<CloudSnapshot[]> {
    const {data, error} = await supabase
        .from(SNAPSHOT_TABLE)
        .select("id,user_id,label,data,created_at,updated_at")
        .order("updated_at", {ascending: false});

    if (error) throw error;
    return (data ?? []).map(normalizeSnapshot);
}

export async function saveCloudSnapshot(label: string, payload: BackupPayload): Promise<CloudSnapshot> {
    const {data: userData, error: userError} = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userData.user) throw new Error("로그인이 필요합니다.");

    const {data, error} = await supabase
        .from(SNAPSHOT_TABLE)
        .insert({
            user_id: userData.user.id,
            label,
            data: payload
        })
        .select("id,user_id,label,data,created_at,updated_at")
        .single();

    if (error) throw error;
    return normalizeSnapshot(data);
}

export async function deleteCloudSnapshot(id: string) {
    const {error} = await supabase.from(SNAPSHOT_TABLE).delete().eq("id", id);
    if (error) throw error;
}
