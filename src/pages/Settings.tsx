import {StationHeader} from "@/components/shell/StationHeader";
import {ConfigPanel} from "@/components/platform/ConfigPanel";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {useGhosttyStore} from "@/stores/ghosttyStore";
import {useTmuxStore} from "@/stores/tmuxStore";
import {useRoutesStore} from "@/stores/routesStore";
import {toast} from "@/stores/toastStore";

export function SettingsPage() {
    const resetGhostty = useGhosttyStore(s => s.resetAll);
    const resetTmux = useTmuxStore(s => s.reset);
    const clearRoutes = useRoutesStore(s => s.clear);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <StationHeader
                title="터미널 관리실"
                eyebrow="Control Tower"
                subtitle="보관함과 노선 데이터를 관리합니다. 모든 데이터는 브라우저 로컬에만 저장됩니다."
            />

            <ConfigPanel title="Storage">
                <p className="text-body-md text-on-surface-variant mb-3">
                    버스터미널은 외부 서버를 사용하지 않아요. 모든 노선과 설정은{" "}
                    <code className="font-mono text-primary-fixed-dim">localStorage</code>에 보관됩니다.
                </p>
                <ul className="font-mono text-[12px] text-on-surface-variant space-y-1">
                    <li>bus-terminal:ghostty — Ghostty 설정</li>
                    <li>bus-terminal:tmux — tmux 설정</li>
                    <li>bus-terminal:routes — 차고 보관 노선</li>
                </ul>
            </ConfigPanel>

            <ConfigPanel title="Danger Zone">
                <div className="space-y-3">
                    <DangerRow
                        title="Ghostty 노선 초기화"
                        desc="모든 GUI 값을 기본값으로 되돌립니다."
                        onClick={() => {
                            if (confirm("Ghostty 설정을 모두 초기화할까요?")) {
                                resetGhostty();
                                toast("Ghostty 노선을 초기화했어요.", "success");
                            }
                        }}
                    />
                    <DangerRow
                        title="tmux 노선 초기화"
                        desc="tmux 상태바/플러그인 선택을 초기화합니다."
                        onClick={() => {
                            if (confirm("tmux 설정을 모두 초기화할까요?")) {
                                resetTmux();
                                toast("tmux 노선을 초기화했어요.", "success");
                            }
                        }}
                    />
                    <DangerRow
                        title="차고 비우기"
                        desc="저장된 모든 노선을 폐차합니다."
                        onClick={() => {
                            if (confirm("정말로 모든 노선을 폐차하시겠어요?")) {
                                clearRoutes();
                                toast("차고를 비웠어요.", "success");
                            }
                        }}
                    />
                </div>
            </ConfigPanel>
        </div>
    );
}

function DangerRow({title, desc, onClick}: {title: string; desc: string; onClick: () => void}) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-surface-container-lowest px-4 py-3">
            <div>
                <div className="text-code-sm text-on-surface">{title}</div>
                <div className="text-[11px] text-on-surface-variant">{desc}</div>
            </div>
            <Button variant="danger" size="sm" onClick={onClick}>
                <Icon name="delete_forever" className="text-[14px]" /> 초기화
            </Button>
        </div>
    );
}
