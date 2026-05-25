export const BACKUP_VERSION = 1;

export const STORAGE_KEYS = [
    "bus-terminal:ghostty",
    "bus-terminal:tmux",
    "bus-terminal:neovim",
    "bus-terminal:zsh",
    "bus-terminal:helix",
    "bus-terminal:iterm2",
    "bus-terminal:warp",
    "bus-terminal:routes",
    "bus-terminal:favorites",
    "bus-terminal:user-themes"
] as const;

export type StorageKey = (typeof STORAGE_KEYS)[number];

export interface BackupPayload {
    $schema: "bus-terminal-backup";
    version: typeof BACKUP_VERSION;
    exportedAt: string;
    data: Partial<Record<StorageKey, unknown>>;
}

export function collectLocalBackup(): BackupPayload {
    const data: Partial<Record<StorageKey, unknown>> = {};
    for (const key of STORAGE_KEYS) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        try {
            data[key] = JSON.parse(raw);
        }
        catch {
            data[key] = raw;
        }
    }
    return {
        $schema: "bus-terminal-backup",
        version: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        data
    };
}

export function restoreLocalBackup(data: unknown): number {
    if (!data || typeof data !== "object") {
        throw new Error("복원할 데이터가 비어 있습니다.");
    }

    let restored = 0;
    for (const [key, value] of Object.entries(data)) {
        if (!STORAGE_KEYS.includes(key as StorageKey)) continue;
        localStorage.setItem(key, JSON.stringify(value));
        restored++;
    }
    return restored;
}

export function clearLocalBackup() {
    for (const key of STORAGE_KEYS) localStorage.removeItem(key);
}

export function countBackupItems(data: unknown): number {
    if (!data || typeof data !== "object") return 0;
    return Object.keys(data).filter(key => STORAGE_KEYS.includes(key as StorageKey)).length;
}
