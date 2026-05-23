import {Trash2, Copy, FileDown, RotateCw, Bus} from "lucide-react";
import {Link} from "react-router-dom";
import {useRoutesStore} from "@/stores/routesStore";
import {Card, CardHeader, CardBody, CardTitle, CardSubtitle} from "@/components/ui/Card";
import {Button} from "@/components/ui/Button";
import {Badge} from "@/components/ui/Badge";
import {copyText, downloadText} from "@/lib/download";
import {useGhosttyStore} from "@/stores/ghosttyStore";
import {toast} from "@/stores/toastStore";

function fmtDate(ts: number): string {
    const d = new Date(ts);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function MyRoutesPage() {
    const {routes, remove, rename} = useRoutesStore();
    const importGhostty = useGhosttyStore(s => s.importText);

    return (
        <div className="mx-auto max-w-7xl px-5 pt-10 pb-16">
            <div className="flex items-end justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <span className="led-text text-3xl text-route-saved">4번</span>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">내 노선 · 차고</h1>
                        <p className="text-sm text-white/45 mt-1">
                            저장한 설정을 다시 꺼내 출발하세요. (브라우저 로컬에만 저장됩니다)
                        </p>
                    </div>
                </div>
                <Badge tone="blue">{routes.length}개 보관중</Badge>
            </div>

            {routes.length === 0 ? (
                <Card>
                    <CardBody className="py-16 text-center">
                        <Bus size={36} className="mx-auto text-white/30 mb-4" />
                        <p className="text-white/60">
                            아직 보관된 노선이 없어요.
                        </p>
                        <p className="text-xs text-white/40 mt-1">
                            Ghostty 또는 tmux 승강장에서 "차고 보관"을 눌러보세요.
                        </p>
                        <div className="mt-5 flex items-center justify-center gap-2">
                            <Link to="/ghostty">
                                <Button size="sm">Ghostty 승강장으로</Button>
                            </Link>
                            <Link to="/tmux">
                                <Button size="sm" variant="outline">tmux 승강장으로</Button>
                            </Link>
                        </div>
                    </CardBody>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {routes.map(r => (
                        <Card key={r.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <CardTitle className="truncate">{r.name}</CardTitle>
                                        <CardSubtitle>
                                            {r.platform === "ghostty" ? "Ghostty 노선" : "tmux 노선"} ·{" "}
                                            {fmtDate(r.createdAt)}
                                        </CardSubtitle>
                                    </div>
                                    <Badge
                                        tone={r.platform === "ghostty" ? "default" : "green"}
                                    >
                                        {r.platform}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <pre className="rounded-lg bg-ink-900/70 border border-line p-3 text-[11px] font-mono text-white/65 max-h-32 overflow-auto">
                                    {r.text.slice(0, 600)}
                                    {r.text.length > 600 && "\n…"}
                                </pre>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {r.platform === "ghostty" && (
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                importGhostty(r.text);
                                                toast(`"${r.name}"으로 환승했어요.`, "success");
                                            }}
                                        >
                                            <RotateCw size={14} /> 다시 탑승
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            downloadText(
                                                r.platform === "ghostty" ? "ghostty-config" : ".tmux.conf",
                                                r.text
                                            )
                                        }
                                    >
                                        <FileDown size={14} /> 다운로드
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                            copyText(r.text).then(() =>
                                                toast("복사 완료.", "success")
                                            )
                                        }
                                    >
                                        <Copy size={14} /> 복사
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            const n = window.prompt("새 이름?", r.name);
                                            if (n) rename(r.id, n);
                                        }}
                                    >
                                        이름 변경
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        className="ml-auto"
                                        onClick={() => {
                                            if (confirm(`"${r.name}"을(를) 폐차하시겠어요?`)) remove(r.id);
                                        }}
                                    >
                                        <Trash2 size={14} /> 폐차
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
