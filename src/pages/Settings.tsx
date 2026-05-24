import {useRef, useState} from "react";
import {StationHeader} from "@/components/shell/StationHeader";
import {ConfigPanel} from "@/components/platform/ConfigPanel";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {Badge} from "@/components/ui/Badge";
import {useGhosttyStore} from "@/stores/ghosttyStore";
import {useTmuxStore} from "@/stores/tmuxStore";
import {useNeovimStore} from "@/stores/neovimStore";
import {useZshStore} from "@/stores/zshStore";
import {useHelixStore} from "@/stores/helixStore";
import {useIterm2Store} from "@/stores/iterm2Store";
import {useWarpStore} from "@/stores/warpStore";
import {useRoutesStore} from "@/stores/routesStore";
import {useFavoritesStore} from "@/stores/favoritesStore";
import {useUserThemesStore} from "@/stores/userThemesStore";
import {toast} from "@/stores/toastStore";
import {downloadText} from "@/lib/download";

/** 백업 JSON의 schema 버전 */
const BACKUP_VERSION = 1;

const STORAGE_KEYS = [
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

export function SettingsPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);

    function exportBackup() {
        const data: Record<string, unknown> = {};
        for (const key of STORAGE_KEYS) {
            const raw = localStorage.getItem(key);
            if (raw) {
                try {
                    data[key] = JSON.parse(raw);
                }
                catch {
                    data[key] = raw;
                }
            }
        }
        const payload = {
            $schema: "bus-terminal-backup",
            version: BACKUP_VERSION,
            exportedAt: new Date().toISOString(),
            data
        };
        const filename = `bus-terminal-backup-${new Date()
            .toISOString()
            .slice(0, 19)
            .replace(/[:T]/g, "-")}.json`;
        downloadText(filename, JSON.stringify(payload, null, 2));
        toast(`${Object.keys(data).length}개 항목을 백업했어요.`, "success");
    }

    async function handleImportFile() {
        fileInputRef.current?.click();
    }

    async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        setBusy(true);
        try {
            const text = await file.text();
            const payload = JSON.parse(text);
            if (payload?.$schema !== "bus-terminal-backup" || !payload.data) {
                toast("백업 파일 형식이 아닙니다.", "warn");
                return;
            }
            if (
                !window.confirm(
                    `복원하면 현재 저장된 모든 설정이 백업 파일로 대체됩니다. 진행할까요?\n\n백업 시각: ${
                        payload.exportedAt ?? "unknown"
                    }`
                )
            ) {
                return;
            }
            let restored = 0;
            for (const [key, value] of Object.entries(payload.data)) {
                if (!STORAGE_KEYS.includes(key as (typeof STORAGE_KEYS)[number])) continue;
                localStorage.setItem(key, JSON.stringify(value));
                restored++;
            }
            toast(`${restored}개 항목을 복원했어요. 새로고침 후 적용됩니다.`, "success");
            setTimeout(() => window.location.reload(), 1200);
        }
        catch (err) {
            toast(`복원 실패: ${err instanceof Error ? err.message : "알 수 없는 오류"}`, "error");
        }
        finally {
            setBusy(false);
        }
    }

    function resetAll() {
        if (!window.confirm("정말로 모든 설정/노선/즐겨찾기를 초기화할까요?")) return;
        for (const key of STORAGE_KEYS) localStorage.removeItem(key);
        toast("모두 초기화했어요. 새로고침 합니다.", "success");
        setTimeout(() => window.location.reload(), 800);
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <StationHeader
                title="터미널 관리실"
                eyebrow="Control Tower"
                subtitle="보관함과 노선 데이터를 관리합니다. 모든 데이터는 브라우저 로컬에만 저장됩니다."
            />

            <ConfigPanel
                title="백업 / 복원"
                actions={<Badge tone="info">JSON</Badge>}
            >
                <p className="text-body-md text-on-surface-variant mb-4">
                    설정·노선·즐겨찾기·사용자 테마를 한 파일로 내보내고 다른 브라우저에서 복원할 수 있어요.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button onClick={exportBackup}>
                        <Icon name="file_download" className="text-[16px]" />
                        백업 다운로드
                    </Button>
                    <Button variant="outline" onClick={handleImportFile} disabled={busy}>
                        <Icon name="file_upload" className="text-[16px]" />
                        백업 복원
                    </Button>
                    <Button variant="danger" onClick={resetAll}>
                        <Icon name="delete_forever" className="text-[16px]" />
                        전체 초기화
                    </Button>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={onFile}
                    className="hidden"
                />
            </ConfigPanel>

            <ConfigPanel title="Storage 키 목록">
                <p className="text-body-md text-on-surface-variant mb-3">
                    버스터미널은 외부 서버를 사용하지 않아요. 모든 데이터는{" "}
                    <code className="font-mono text-primary-fixed-dim">localStorage</code>
                    에만 보관됩니다.
                </p>
                <ul className="font-mono text-[12px] text-on-surface-variant space-y-1">
                    <li>bus-terminal:ghostty — Ghostty 설정</li>
                    <li>bus-terminal:warp — Warp 설정</li>
                    <li>bus-terminal:iterm2 — iTerm2 프로파일</li>
                    <li>bus-terminal:neovim — Neovim 설정</li>
                    <li>bus-terminal:helix — Helix 설정</li>
                    <li>bus-terminal:zsh — Zsh 설정</li>
                    <li>bus-terminal:tmux — tmux 설정</li>
                    <li>bus-terminal:routes — 차고 보관 노선</li>
                    <li>bus-terminal:favorites — 즐겨찾기 (테마·폰트)</li>
                    <li>bus-terminal:user-themes — 가져온 사용자 테마</li>
                </ul>
            </ConfigPanel>

            <ConfigPanel title="개별 초기화" actions={<Badge tone="warn">danger</Badge>}>
                <div className="space-y-2">
                    <DangerRow
                        title="Ghostty 노선 초기화"
                        desc="모든 GUI 값을 기본값으로 되돌립니다."
                        store={useGhosttyStore.getState().resetAll}
                    />
                    <DangerRow
                        title="Warp 노선 초기화"
                        desc="테마·AI·워크플로우를 기본값으로 되돌립니다."
                        store={useWarpStore.getState().reset}
                    />
                    <DangerRow
                        title="iTerm2 프로파일 초기화"
                        desc="색·폰트·핫키를 기본값으로 되돌립니다."
                        store={useIterm2Store.getState().reset}
                    />
                    <DangerRow
                        title="Neovim 노선 초기화"
                        desc="플러그인·키 매핑을 기본값으로 되돌립니다."
                        store={useNeovimStore.getState().reset}
                    />
                    <DangerRow
                        title="Helix 노선 초기화"
                        desc="theme·LSP·statusline을 기본값으로 되돌립니다."
                        store={useHelixStore.getState().reset}
                    />
                    <DangerRow
                        title="Zsh 노선 초기화"
                        desc="prompt·alias·plugins을 기본값으로 되돌립니다."
                        store={useZshStore.getState().reset}
                    />
                    <DangerRow
                        title="tmux 노선 초기화"
                        desc="status·키바인딩·플러그인을 기본값으로 되돌립니다."
                        store={useTmuxStore.getState().reset}
                    />
                    <DangerRow
                        title="차고 비우기"
                        desc="저장된 모든 노선을 폐차합니다."
                        store={useRoutesStore.getState().clear}
                    />
                    <DangerRow
                        title="사용자 테마 전체 삭제"
                        desc="외부에서 가져온 테마를 모두 삭제합니다."
                        store={useUserThemesStore.getState().clear}
                    />
                    <DangerRow
                        title="즐겨찾기 비우기"
                        desc="테마·폰트 즐겨찾기를 모두 비웁니다."
                        store={useFavoritesStore.getState().clear}
                    />
                </div>
            </ConfigPanel>
        </div>
    );
}

function DangerRow({title, desc, store}: {title: string; desc: string; store: () => void}) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-surface-container-lowest px-4 py-3">
            <div className="min-w-0">
                <div className="text-code-sm text-on-surface truncate">{title}</div>
                <div className="text-[11px] text-on-surface-variant">{desc}</div>
            </div>
            <Button
                variant="danger"
                size="sm"
                onClick={() => {
                    if (window.confirm(`${title}? 되돌릴 수 없어요.`)) {
                        store();
                        toast("초기화했어요.", "success");
                    }
                }}
            >
                <Icon name="delete_forever" className="text-[14px]" /> 초기화
            </Button>
        </div>
    );
}
