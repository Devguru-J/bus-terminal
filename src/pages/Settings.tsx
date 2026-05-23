import {AlertTriangle, Trash2} from "lucide-react";
import {Card, CardHeader, CardBody, CardTitle, CardSubtitle} from "@/components/ui/Card";
import {Button} from "@/components/ui/Button";
import {useGhosttyStore} from "@/stores/ghosttyStore";
import {useTmuxStore} from "@/stores/tmuxStore";
import {useRoutesStore} from "@/stores/routesStore";
import {toast} from "@/stores/toastStore";

export function SettingsPage() {
    const resetGhostty = useGhosttyStore(s => s.resetAll);
    const resetTmux = useTmuxStore(s => s.reset);
    const clearRoutes = useRoutesStore(s => s.clear);

    return (
        <div className="mx-auto max-w-3xl px-5 pt-10 pb-16 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">터미널 관리실</h1>
                <p className="text-sm text-white/45 mt-1">
                    보관함과 노선 데이터를 관리합니다. 모든 데이터는 브라우저 로컬에만 저장됩니다.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>저장소 안내</CardTitle>
                    <CardSubtitle>
                        버스터미널은 외부 서버를 사용하지 않아요. 모든 노선과 설정은{" "}
                        <code className="text-led-amber font-mono">localStorage</code>에 보관됩니다.
                    </CardSubtitle>
                </CardHeader>
                <CardBody className="space-y-2 text-sm text-white/65 leading-relaxed">
                    <div>
                        <strong className="text-white/80">키 목록</strong>
                    </div>
                    <ul className="font-mono text-xs text-white/60 space-y-1">
                        <li>bus-terminal:ghostty — Ghostty 설정</li>
                        <li>bus-terminal:tmux — tmux 설정</li>
                        <li>bus-terminal:routes — 차고 보관 노선</li>
                    </ul>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-led-amber" />
                        <CardTitle>위험구역</CardTitle>
                    </div>
                    <CardSubtitle>되돌릴 수 없는 동작입니다.</CardSubtitle>
                </CardHeader>
                <CardBody className="space-y-3">
                    <div className="flex items-center justify-between gap-3 border border-line rounded-xl p-3">
                        <div>
                            <div className="text-sm">Ghostty 노선 초기화</div>
                            <div className="text-xs text-white/45">
                                모든 GUI 값을 기본값으로 되돌립니다.
                            </div>
                        </div>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                                if (confirm("Ghostty 설정을 모두 초기화할까요?")) {
                                    resetGhostty();
                                    toast("Ghostty 노선을 초기화했어요.", "success");
                                }
                            }}
                        >
                            <Trash2 size={14} /> 초기화
                        </Button>
                    </div>
                    <div className="flex items-center justify-between gap-3 border border-line rounded-xl p-3">
                        <div>
                            <div className="text-sm">tmux 노선 초기화</div>
                            <div className="text-xs text-white/45">
                                tmux 상태바/플러그인 선택을 초기화합니다.
                            </div>
                        </div>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                                if (confirm("tmux 설정을 모두 초기화할까요?")) {
                                    resetTmux();
                                    toast("tmux 노선을 초기화했어요.", "success");
                                }
                            }}
                        >
                            <Trash2 size={14} /> 초기화
                        </Button>
                    </div>
                    <div className="flex items-center justify-between gap-3 border border-line rounded-xl p-3">
                        <div>
                            <div className="text-sm">차고 비우기</div>
                            <div className="text-xs text-white/45">
                                저장된 모든 노선을 폐차합니다.
                            </div>
                        </div>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                                if (confirm("정말로 모든 노선을 폐차하시겠어요?")) {
                                    clearRoutes();
                                    toast("차고를 비웠어요.", "success");
                                }
                            }}
                        >
                            <Trash2 size={14} /> 전체 폐차
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
