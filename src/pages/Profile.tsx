import {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {StationHeader} from "@/components/shell/StationHeader";
import {ConfigPanel} from "@/components/platform/ConfigPanel";
import {Badge} from "@/components/ui/Badge";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {useAuthStore, signOut} from "@/stores/authStore";
import {toast} from "@/stores/toastStore";
import {collectLocalBackup} from "@/lib/localBackup";
import {listCloudSnapshots, type CloudSnapshot} from "@/lib/cloudSync";

function metaString(value: unknown): string {
    return typeof value === "string" ? value : "";
}

function formatDate(value?: string | null): string {
    if (!value) return "기록 없음";
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(new Date(value));
}

export function ProfilePage() {
    const navigate = useNavigate();
    const user = useAuthStore(s => s.user);
    const status = useAuthStore(s => s.status);
    const openAuth = useAuthStore(s => s.openModal);
    const [snapshots, setSnapshots] = useState<CloudSnapshot[]>([]);
    const [loading, setLoading] = useState(false);

    const metadata = user?.user_metadata ?? {};
    const avatarUrl = metaString(metadata.avatar_url) || metaString(metadata.picture);
    const displayName =
        metaString(metadata.full_name) ||
        metaString(metadata.name) ||
        metaString(metadata.user_name) ||
        user?.email ||
        "BusTerminal User";
    const provider = user?.app_metadata?.provider ? String(user.app_metadata.provider) : "email";
    const localItemCount = useMemo(() => Object.keys(collectLocalBackup().data).length, []);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        listCloudSnapshots()
            .then(setSnapshots)
            .catch(err => {
                toast(`클라우드 보관함을 불러오지 못했어요: ${err instanceof Error ? err.message : "알 수 없는 오류"}`, "error");
            })
            .finally(() => setLoading(false));
    }, [user]);

    async function handleSignOut() {
        if (!window.confirm("로그아웃할까요? 로컬 설정은 이 브라우저에 그대로 남아 있습니다.")) return;
        await signOut();
        toast("로그아웃했어요.", "success");
        navigate("/");
    }

    if (status !== "signed-in" || !user) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <StationHeader
                    title="내 프로필"
                    eyebrow="Profile"
                    subtitle="계정을 연결하면 클라우드 보관함과 로그인 정보를 관리할 수 있습니다."
                />
                <ConfigPanel title="계정 연결 필요" actions={<Badge tone="info">Optional</Badge>}>
                    <p className="text-body-md text-on-surface-variant mb-4">
                        비회원 상태에서도 모든 설정 기능은 사용할 수 있습니다. 프로필과 클라우드 스냅샷 관리는 로그인 후 사용할 수 있어요.
                    </p>
                    <Button onClick={openAuth}>
                        <Icon name="login" className="text-[16px]" />
                        계정 연결
                    </Button>
                </ConfigPanel>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <StationHeader
                title="내 프로필"
                eyebrow="Profile"
                subtitle="계정 정보, 클라우드 보관함, 로컬 작업 상태를 한 곳에서 확인합니다."
            />

            <ConfigPanel title="계정 카드" actions={<Badge tone="active">Signed in</Badge>}>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-surface-container-lowest">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                            <div className="grid h-full w-full place-items-center font-display text-title-lg text-primary-fixed-dim">
                                {displayName.slice(0, 1).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="font-display text-title-lg text-on-surface truncate">{displayName}</div>
                        <div className="mt-1 font-mono text-[12px] text-on-surface-variant truncate">{user.email}</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Badge tone="info">{provider}</Badge>
                            <Badge tone="active">{snapshots.length} cloud snapshots</Badge>
                            <Badge tone="info">{localItemCount} local items</Badge>
                        </div>
                    </div>
                    <Button variant="danger" onClick={handleSignOut}>
                        <Icon name="logout" className="text-[16px]" />
                        로그아웃
                    </Button>
                </div>
            </ConfigPanel>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ConfigPanel title="계정 정보">
                    <dl className="space-y-3 text-[13px]">
                        <InfoRow label="Provider" value={provider} />
                        <InfoRow label="User ID" value={user.id} mono />
                        <InfoRow label="가입 시각" value={formatDate(user.created_at)} />
                        <InfoRow label="마지막 로그인" value={formatDate(user.last_sign_in_at)} />
                    </dl>
                </ConfigPanel>

                <ConfigPanel title="빠른 작업">
                    <div className="grid grid-cols-1 gap-2">
                        <Button variant="outline" onClick={() => navigate("/settings")}>
                            <Icon name="cloud_upload" className="text-[16px]" />
                            클라우드 보관함 관리
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/my-routes")}>
                            <Icon name="bookmark" className="text-[16px]" />
                            내 노선 보기
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/export")}>
                            <Icon name="sensors" className="text-[16px]" />
                            출발 전 점검
                        </Button>
                    </div>
                </ConfigPanel>
            </div>

            <ConfigPanel title="최근 클라우드 스냅샷" actions={<Badge tone="info">{loading ? "Loading" : `${snapshots.length}`}</Badge>}>
                {snapshots.length === 0 ? (
                    <p className="text-body-md text-on-surface-variant">
                        아직 저장된 클라우드 스냅샷이 없습니다. 설정 페이지에서 현재 로컬 설정을 클라우드에 저장할 수 있어요.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {snapshots.slice(0, 5).map(snapshot => (
                            <div
                                key={snapshot.id}
                                className="flex flex-col gap-1 rounded-lg border border-white/[0.06] bg-surface-container-lowest px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="text-code-sm text-on-surface">{snapshot.label}</div>
                                <div className="text-[11px] text-on-surface-variant">
                                    {formatDate(snapshot.updated_at)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ConfigPanel>
        </div>
    );
}

function InfoRow({label, value, mono}: {label: string; value: string; mono?: boolean}) {
    return (
        <div className="grid grid-cols-[120px_1fr] gap-3">
            <dt className="font-mono uppercase tracking-[0.12em] text-on-surface-variant">{label}</dt>
            <dd className={mono ? "truncate font-mono text-on-surface" : "truncate text-on-surface"}>{value}</dd>
        </div>
    );
}
