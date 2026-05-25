import {useEffect, useRef, useState} from "react";
import {StationHeader} from "@/components/shell/StationHeader";
import {ConfigPanel} from "@/components/platform/ConfigPanel";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {Badge} from "@/components/ui/Badge";
import {useAuthStore} from "@/stores/authStore";
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
import {clearLocalBackup, collectLocalBackup, countBackupItems, restoreLocalBackup, STORAGE_KEYS} from "@/lib/localBackup";
import {deleteCloudSnapshot, listCloudSnapshots, saveCloudSnapshot, type CloudSnapshot} from "@/lib/cloudSync";
import {trackEvent} from "@/lib/analytics";

export function SettingsPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const user = useAuthStore(s => s.user);
    const authStatus = useAuthStore(s => s.status);
    const openAuth = useAuthStore(s => s.openModal);
    const [cloudBusy, setCloudBusy] = useState(false);
    const [snapshots, setSnapshots] = useState<CloudSnapshot[]>([]);
    const [snapshotLabel, setSnapshotLabel] = useState("내 개발환경");

    function exportBackup() {
        const payload = collectLocalBackup();
        const filename = `bus-terminal-backup-${new Date()
            .toISOString()
            .slice(0, 19)
            .replace(/[:T]/g, "-")}.json`;
        downloadText(filename, JSON.stringify(payload, null, 2));
        toast(`${Object.keys(payload.data).length}개 항목을 백업했어요.`, "success");
    }

    async function refreshCloudSnapshots() {
        if (!user) {
            setSnapshots([]);
            return;
        }
        setCloudBusy(true);
        try {
            setSnapshots(await listCloudSnapshots());
        }
        catch (err) {
            toast(`클라우드 목록을 불러오지 못했어요: ${err instanceof Error ? err.message : "알 수 없는 오류"}`, "error");
        }
        finally {
            setCloudBusy(false);
        }
    }

    async function saveToCloud() {
        if (!user) {
            openAuth();
            return;
        }
        const payload = collectLocalBackup();
        const count = Object.keys(payload.data).length;
        if (count === 0) {
            toast("저장할 로컬 설정이 아직 없어요.", "warn");
            return;
        }
        setCloudBusy(true);
        try {
            await saveCloudSnapshot(snapshotLabel.trim() || "내 개발환경", payload);
            trackEvent("Cloud Sync", {action: "save"});
            toast(`${count}개 항목을 클라우드에 저장했어요.`, "success");
            await refreshCloudSnapshots();
        }
        catch (err) {
            toast(`클라우드 저장 실패: ${err instanceof Error ? err.message : "알 수 없는 오류"}`, "error");
        }
        finally {
            setCloudBusy(false);
        }
    }

    async function restoreFromCloud(snapshot: CloudSnapshot) {
        const count = countBackupItems(snapshot.data.data);
        if (!window.confirm(`'${snapshot.label}' 스냅샷의 ${count}개 항목으로 현재 로컬 설정을 대체할까요?`)) return;
        setCloudBusy(true);
        try {
            const restored = restoreLocalBackup(snapshot.data.data);
            trackEvent("Cloud Sync", {action: "restore"});
            toast(`${restored}개 항목을 복원했어요. 새로고침 후 적용됩니다.`, "success");
            setTimeout(() => window.location.reload(), 900);
        }
        catch (err) {
            toast(`복원 실패: ${err instanceof Error ? err.message : "알 수 없는 오류"}`, "error");
        }
        finally {
            setCloudBusy(false);
        }
    }

    async function removeCloudSnapshot(snapshot: CloudSnapshot) {
        if (!window.confirm(`'${snapshot.label}' 스냅샷을 삭제할까요? 로컬 설정은 삭제되지 않습니다.`)) return;
        setCloudBusy(true);
        try {
            await deleteCloudSnapshot(snapshot.id);
            toast("클라우드 스냅샷을 삭제했어요.", "success");
            await refreshCloudSnapshots();
        }
        catch (err) {
            toast(`삭제 실패: ${err instanceof Error ? err.message : "알 수 없는 오류"}`, "error");
        }
        finally {
            setCloudBusy(false);
        }
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
                restored += restoreLocalBackup({[key]: value});
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
        clearLocalBackup();
        toast("모두 초기화했어요. 새로고침 합니다.", "success");
        setTimeout(() => window.location.reload(), 800);
    }

    useEffect(() => {
        if (user) void refreshCloudSnapshots();
        else setSnapshots([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <StationHeader
                title="터미널 관리실"
                eyebrow="Control Tower"
                subtitle="보관함과 노선 데이터를 관리합니다. 비회원은 로컬 저장, 로그인하면 클라우드 스냅샷으로 보관할 수 있습니다."
            />

            <ConfigPanel
                title="계정 / 클라우드 보관함"
                actions={<Badge tone={user ? "active" : "info"}>{user ? "Connected" : "Optional"}</Badge>}
            >
                <div className="space-y-4">
                    <div className="rounded-lg border border-white/[0.06] bg-surface-container-lowest p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="text-code-sm text-on-surface">
                                    {user ? user.email ?? "연결된 계정" : "비회원 로컬 모드"}
                                </div>
                                <p className="mt-1 text-[12px] leading-relaxed text-on-surface-variant">
                                    {user
                                        ? "현재 브라우저의 설정을 Supabase에 스냅샷으로 저장하고, 다른 기기에서 다시 불러올 수 있습니다."
                                        : "로그인하지 않아도 모든 기능을 사용할 수 있습니다. 클라우드 보관함만 계정이 필요합니다."}
                                </p>
                            </div>
                            {!user && (
                                <Button onClick={openAuth} disabled={authStatus === "booting"}>
                                    <Icon name="login" className="text-[16px]" />
                                    계정 연결
                                </Button>
                            )}
                        </div>
                    </div>

                    {user && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2">
                                <input
                                    value={snapshotLabel}
                                    onChange={e => setSnapshotLabel(e.target.value)}
                                    className="h-10 rounded border border-white/10 bg-surface px-3 text-body-sm text-on-surface outline-none focus:border-primary-fixed-dim"
                                    placeholder="스냅샷 이름"
                                />
                                <Button onClick={saveToCloud} disabled={cloudBusy}>
                                    <Icon name="cloud_upload" className="text-[16px]" />
                                    클라우드 저장
                                </Button>
                                <Button variant="outline" onClick={refreshCloudSnapshots} disabled={cloudBusy}>
                                    <Icon name="refresh" className="text-[16px]" />
                                    새로고침
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {snapshots.length === 0 && (
                                    <div className="rounded-lg border border-dashed border-white/10 px-4 py-5 text-center text-[12px] text-on-surface-variant">
                                        아직 클라우드 스냅샷이 없습니다.
                                    </div>
                                )}
                                {snapshots.map(snapshot => (
                                    <div
                                        key={snapshot.id}
                                        className="flex flex-col gap-3 rounded-lg border border-white/[0.06] bg-surface-container-lowest px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="min-w-0">
                                            <div className="text-code-sm text-on-surface truncate">{snapshot.label}</div>
                                            <div className="mt-1 text-[11px] text-on-surface-variant">
                                                {new Date(snapshot.updated_at).toLocaleString()} · {countBackupItems(snapshot.data.data)}개 항목
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 gap-2">
                                            <Button variant="outline" size="sm" onClick={() => restoreFromCloud(snapshot)} disabled={cloudBusy}>
                                                복원
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => removeCloudSnapshot(snapshot)} disabled={cloudBusy}>
                                                삭제
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </ConfigPanel>

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
                    비회원 데이터와 현재 브라우저의 작업 상태는{" "}
                    <code className="font-mono text-primary-fixed-dim">localStorage</code>
                    에 보관됩니다. 로그인 후 직접 저장한 스냅샷만 Supabase 클라우드 보관함에 올라갑니다.
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
                        desc="저장된 모든 노선을 삭제합니다."
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
