import {useMemo} from "react";
import {Copy, FileDown, Save, RotateCcw, Plug} from "lucide-react";
import {Button} from "@/components/ui/Button";
import {Card, CardHeader, CardBody, CardTitle, CardSubtitle} from "@/components/ui/Card";
import {Label, TextInput, NumberInput, Select, Toggle} from "@/components/ui/Field";
import {Badge} from "@/components/ui/Badge";
import {tmuxPlugins} from "@/data/tmux";
import {useTmuxStore} from "@/stores/tmuxStore";
import {useRoutesStore} from "@/stores/routesStore";
import {downloadText, copyText} from "@/lib/download";
import {toast} from "@/stores/toastStore";

export function TmuxPage() {
    const {config, setField, togglePlugin, exportText, reset} = useTmuxStore();
    const save = useRoutesStore(s => s.save);

    const exported = useMemo(() => exportText(), [config, exportText]);

    function handleSave() {
        const name = window.prompt("차고에 보관할 노선 이름?", "내 tmux 노선");
        if (!name) return;
        save({name, platform: "tmux", text: exported});
        toast(`"${name}" 노선이 차고에 보관되었어요.`, "success");
    }

    return (
        <div className="mx-auto max-w-7xl px-5 pt-10 pb-16">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <span className="led-text text-3xl text-route-tmux">2번</span>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">tmux 승강장</h1>
                        <p className="text-sm text-white/45 mt-1">
                            상태바와 플러그인을 조합형 카드로 빠르게 구성하세요.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={reset}>
                        <RotateCcw size={14} /> 초기화
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSave}>
                        <Save size={14} /> 차고 보관
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_460px] gap-6">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>기본 동작</CardTitle>
                            <CardSubtitle>프리픽스 키와 인덱스를 정해요.</CardSubtitle>
                        </CardHeader>
                        <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label hint="prefix">프리픽스 키</Label>
                                <TextInput
                                    value={config.prefix}
                                    onChange={e => setField("prefix", e.target.value)}
                                    placeholder="C-a"
                                />
                            </div>
                            <div>
                                <Label hint="base-index">시작 인덱스</Label>
                                <NumberInput
                                    value={config.baseIndex}
                                    min={0}
                                    max={1}
                                    onChange={e => setField("baseIndex", Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <Label hint="mouse">마우스</Label>
                                <div className="h-10 flex items-center">
                                    <Toggle
                                        checked={config.mouse}
                                        onChange={v => setField("mouse", v)}
                                        label={config.mouse ? "사용" : "사용 안 함"}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label hint="status-position">상태바 위치</Label>
                                <Select
                                    value={config.statusPosition}
                                    onChange={e =>
                                        setField("statusPosition", e.target.value as "top" | "bottom")
                                    }
                                >
                                    <option value="top">위</option>
                                    <option value="bottom">아래</option>
                                </Select>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>상태바 디자인</CardTitle>
                            <CardSubtitle>
                                tmux 포맷 문자열을 그대로 씁니다. 예:{" "}
                                <code className="text-led-amber font-mono">{`#[fg=#a6e3a1] #S `}</code>
                            </CardSubtitle>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <div>
                                <Label>전체 스타일</Label>
                                <TextInput
                                    value={config.statusStyle}
                                    onChange={e => setField("statusStyle", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>왼쪽 영역</Label>
                                <TextInput
                                    value={config.leftSegments.join("")}
                                    onChange={e => setField("leftSegments", [e.target.value])}
                                />
                            </div>
                            <div>
                                <Label>오른쪽 영역</Label>
                                <TextInput
                                    value={config.rightSegments.join("")}
                                    onChange={e =>
                                        setField("rightSegments", e.target.value.split("|"))
                                    }
                                />
                                <p className="text-[11px] text-white/40 mt-1.5">
                                    파이프(<code className="text-led-amber font-mono">|</code>)로 세그먼트를 나눠요.
                                </p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>플러그인 (TPM)</CardTitle>
                                    <CardSubtitle>
                                        체크한 플러그인을 자동 등록합니다. TPM은 기본 포함.
                                    </CardSubtitle>
                                </div>
                                <Badge tone="amber">
                                    <Plug size={10} /> {config.plugins.length}개 선택
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {tmuxPlugins.map(p => {
                                const on = config.plugins.includes(p.id);
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => togglePlugin(p.id)}
                                        className={`text-left rounded-xl border p-3 transition ${
                                            on
                                                ? "border-led-green/40 bg-led-green/5"
                                                : "border-line hover:border-line-strong bg-ink-700/40"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{p.ko}</span>
                                            <span
                                                className={`h-4 w-4 rounded-full border ${
                                                    on
                                                        ? "bg-led-green border-led-green"
                                                        : "border-white/30"
                                                }`}
                                            />
                                        </div>
                                        <p className="text-xs text-white/50 mt-1">{p.desc}</p>
                                        <p className="text-[10px] text-white/30 mt-1 font-mono">{p.name}</p>
                                    </button>
                                );
                            })}
                        </CardBody>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>승차 미리보기</CardTitle>
                            <CardSubtitle>상태바가 이렇게 보입니다.</CardSubtitle>
                        </CardHeader>
                        <CardBody>
                            <div
                                className="rounded-xl overflow-hidden border border-line-strong bg-[#1e1e2e] text-[#cdd6f4]"
                                style={{
                                    fontFamily: "JetBrains Mono, monospace"
                                }}
                            >
                                <div className="px-3 py-1.5 text-xs font-mono border-b border-white/5 flex items-center justify-between">
                                    <span className="text-led-green">{config.leftSegments.join("")}</span>
                                    <span className="text-white/40">window 1 · 2 · 3</span>
                                    <span className="text-led-blue">{config.rightSegments.join("")}</span>
                                </div>
                                <div className="p-4 text-xs leading-relaxed text-white/60 min-h-[140px]">
                                    <div>prefix: <span className="text-led-amber">{config.prefix}</span></div>
                                    <div>mouse: {config.mouse ? "on" : "off"}</div>
                                    <div>base-index: {config.baseIndex}</div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>출발권 · ~/.tmux.conf</CardTitle>
                                    <CardSubtitle>홈 디렉터리에 저장하고 tmux를 다시 시작하세요.</CardSubtitle>
                                </div>
                                <Badge tone="green">READY</Badge>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <pre className="rounded-xl bg-ink-900/80 border border-line p-3 text-[11.5px] font-mono text-white/75 max-h-[300px] overflow-auto whitespace-pre-wrap">
                                {exported}
                            </pre>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <Button onClick={() => downloadText(".tmux.conf", exported)}>
                                    <FileDown size={14} /> 다운로드
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        copyText(exported).then(ok =>
                                            toast(
                                                ok ? "출발권을 복사했어요." : "복사 실패.",
                                                ok ? "success" : "error"
                                            )
                                        )
                                    }
                                >
                                    <Copy size={14} /> 클립보드 복사
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}
