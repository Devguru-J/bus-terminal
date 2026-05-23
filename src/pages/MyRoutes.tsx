import {StationHeader} from "@/components/shell/StationHeader";
import {RouteTable} from "@/components/platform/RouteTable";
import {Icon} from "@/components/ui/Icon";
import {Badge} from "@/components/ui/Badge";
import {useRoutesStore} from "@/stores/routesStore";
import {useGhosttyStore} from "@/stores/ghosttyStore";
import {toast} from "@/stores/toastStore";

export function MyRoutesPage() {
    const {routes, remove} = useRoutesStore();
    const importGhostty = useGhosttyStore(s => s.importText);

    return (
        <div className="max-w-7xl mx-auto">
            <StationHeader
                title="내 노선"
                eyebrow={`Saved · ${routes.length} Stored`}
                subtitle="Stored developer environment configurations ready for deployment. Select a route to initiate the local terminal setup sequence."
                actions={
                    <Badge tone="active">
                        <Icon name="garage" className="text-[14px]" />
                        차고 보관 (Saved)
                    </Badge>
                }
            />

            <RouteTable
                routes={routes}
                onPlay={r => {
                    if (r.platform === "ghostty") {
                        importGhostty(r.text);
                        toast(`"${r.name}"으로 환승했어요.`, "success");
                    }
                    else {
                        toast("이 노선은 tmux 설정이라 다운로드만 가능해요.", "info");
                    }
                }}
                onDelete={r => {
                    if (confirm(`"${r.name}"을(를) 폐차하시겠어요?`)) {
                        remove(r.id);
                    }
                }}
            />

            {/* System activity log */}
            <div className="mt-8 rounded-xl border border-white/[0.06] bg-surface-container-lowest/60 px-5 py-4">
                <div className="font-mono text-label-xs uppercase tracking-[0.16em] text-primary-fixed-dim mb-3">
                    System Activity
                </div>
                <pre className="font-mono text-[12px] leading-relaxed text-on-surface-variant">{`[SYS] Checking repository consistency... OK
[SYS] Verifying tmux socket permissions... OK
[SYS] Scanning available manifests... ${routes.length} found
[INFO] BT-9991 manifest hashed. Ready.`}</pre>
            </div>
        </div>
    );
}
