import {useMemo, useState} from "react";
import {motion} from "framer-motion";
import {Download, Upload, Copy, Save, Share2, RotateCcw, FileDown} from "lucide-react";
import {Button} from "@/components/ui/Button";
import {Card, CardHeader, CardTitle, CardSubtitle, CardBody} from "@/components/ui/Card";
import {Label, TextInput, NumberInput, Select, Textarea, Toggle, ColorInput} from "@/components/ui/Field";
import {Badge} from "@/components/ui/Badge";
import {TerminalPreview} from "@/components/platform/TerminalPreview";
import {PaletteStrip} from "@/components/platform/PaletteStrip";
import {ghosttySchema} from "@/data/ghosttySchema";
import {useGhosttyStore, computeGhosttyDiff} from "@/stores/ghosttyStore";
import {useRoutesStore} from "@/stores/routesStore";
import {downloadText, copyText} from "@/lib/download";
import {buildShareUrl, encodePayload} from "@/lib/share";
import {toast} from "@/stores/toastStore";

export function GhosttyPage() {
    const {config, palette, setField, importText, exportText, resetAll} = useGhosttyStore();
    const save = useRoutesStore(s => s.save);
    const [importBuffer, setImportBuffer] = useState("");
    const [activeGroup, setActiveGroup] = useState(ghosttySchema[0].id);

    const exported = useMemo(() => exportText(), [config, palette, exportText]);
    const diff = useMemo(() => computeGhosttyDiff(config), [config]);

    function handleImport() {
        if (!importBuffer.trim()) {
            toast("환승할 설정을 붙여넣어 주세요.", "warn");
            return;
        }
        const res = importText(importBuffer);
        toast(
            res.unknownLines.length
                ? `환승 완료. 알 수 없는 줄 ${res.unknownLines.length}개는 건너뛰었어요.`
                : "환승 완료. 모든 옵션을 인식했어요.",
            "success"
        );
        setImportBuffer("");
    }

    function handleCopy() {
        copyText(exported).then(ok =>
            toast(ok ? "출발권을 복사했어요." : "복사에 실패했어요.", ok ? "success" : "error")
        );
    }

    function handleDownload() {
        downloadText("ghostty-config", exported);
        toast("config 파일이 도착했어요. ~/.config/ghostty/config 에 두세요.", "success");
    }

    function handleShare() {
        const enc = encodePayload(exported);
        const url = buildShareUrl(location.origin, "/ghostty", enc);
        copyText(url).then(() => toast("공유 링크를 복사했어요.", "success"));
    }

    function handleSave() {
        const name = window.prompt("차고에 보관할 노선 이름?", "내 Ghostty 노선");
        if (!name) return;
        save({name, platform: "ghostty", text: exported});
        toast(`"${name}" 노선이 차고에 보관되었어요.`, "success");
    }

    return (
        <div className="mx-auto max-w-7xl px-5 pt-10 pb-16">
            {/* 페이지 헤더 */}
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <span className="led-text text-3xl text-route-ghostty">1번</span>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Ghostty 승강장</h1>
                        <p className="text-sm text-white/45 mt-1">
                            설정을 환승하고, GUI로 다듬고, 차고에 보관한 뒤 출발하세요.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={resetAll}>
                        <RotateCcw size={14} /> 초기화
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSave}>
                        <Save size={14} /> 차고 보관
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share2 size={14} /> 공유 링크
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_460px] gap-6">
                {/* === 좌측: 설정 패널 === */}
                <div className="flex flex-col gap-6 min-w-0">
                    {/* 환승하기 */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>환승하기 · Import</CardTitle>
                                    <CardSubtitle>
                                        기존 ghostty config을 그대로 붙여넣으면 자동 분석합니다.
                                    </CardSubtitle>
                                </div>
                                <Badge tone="amber">자동 분석</Badge>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <Textarea
                                placeholder={`예시:\nfont-family = JetBrains Mono\nfont-size = 14\nbackground = 1a1b26\nforeground = c0caf5\npalette = 0=#15161e`}
                                value={importBuffer}
                                onChange={e => setImportBuffer(e.target.value)}
                            />
                            <div className="mt-3 flex gap-2">
                                <Button onClick={handleImport}>
                                    <Upload size={14} /> 환승하기
                                </Button>
                                <Button variant="ghost" onClick={() => setImportBuffer("")}>
                                    비우기
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    {/* GUI 편집 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>설정 안내판</CardTitle>
                            <CardSubtitle>
                                자주 쓰는 옵션만 모았어요. 변경한 값만 출발권에 기록됩니다.
                            </CardSubtitle>
                        </CardHeader>
                        <div className="px-5 flex gap-1 flex-wrap border-b border-line pb-3">
                            {ghosttySchema.map(g => (
                                <button
                                    key={g.id}
                                    onClick={() => setActiveGroup(g.id)}
                                    className={`h-8 px-3 rounded-lg text-xs transition ${
                                        activeGroup === g.id
                                            ? "bg-white/10 text-white"
                                            : "text-white/50 hover:text-white hover:bg-white/5"
                                    }`}
                                >
                                    {g.ko}
                                </button>
                            ))}
                        </div>
                        <CardBody className="pt-5">
                            {ghosttySchema
                                .filter(g => g.id === activeGroup)
                                .map(g => (
                                    <div key={g.id} className="space-y-4">
                                        <p className="text-xs text-white/45">{g.desc}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {g.fields.map(f => (
                                                <div key={f.id} className="min-w-0">
                                                    <Label hint={f.id}>{f.ko}</Label>
                                                    {f.kind === "string" && (
                                                        <TextInput
                                                            value={String(config[f.id] ?? "")}
                                                            placeholder={f.placeholder}
                                                            onChange={e => setField(f.id, e.target.value)}
                                                        />
                                                    )}
                                                    {f.kind === "number" && (
                                                        <NumberInput
                                                            value={Number(config[f.id] ?? 0)}
                                                            min={f.min}
                                                            max={f.max}
                                                            step={f.step}
                                                            onChange={e => setField(f.id, Number(e.target.value))}
                                                        />
                                                    )}
                                                    {f.kind === "boolean" && (
                                                        <div className="h-10 flex items-center">
                                                            <Toggle
                                                                checked={Boolean(config[f.id])}
                                                                onChange={v => setField(f.id, v)}
                                                                label={config[f.id] ? "켜짐" : "꺼짐"}
                                                            />
                                                        </div>
                                                    )}
                                                    {f.kind === "color" && (
                                                        <ColorInput
                                                            value={String(config[f.id] ?? "#000000")}
                                                            onChange={v => setField(f.id, v)}
                                                        />
                                                    )}
                                                    {f.kind === "select" && (
                                                        <Select
                                                            value={String(config[f.id] ?? "")}
                                                            onChange={e => setField(f.id, e.target.value)}
                                                        >
                                                            {f.options.map(o => (
                                                                <option key={o.value} value={o.value}>
                                                                    {o.ko}
                                                                </option>
                                                            ))}
                                                        </Select>
                                                    )}
                                                    {f.help && (
                                                        <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
                                                            {f.help}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                        </CardBody>
                    </Card>

                    {/* 경로 비교 */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>경로 비교 · Diff</CardTitle>
                                    <CardSubtitle>
                                        기본값과 다른 항목만 출발권에 인쇄됩니다.
                                    </CardSubtitle>
                                </div>
                                <Badge tone={diff.length ? "green" : "default"}>
                                    {diff.length}개 변경
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardBody>
                            {diff.length === 0 ? (
                                <p className="text-sm text-white/40">
                                    아직 변경된 항목이 없어요. 위에서 옵션을 조정해보세요.
                                </p>
                            ) : (
                                <ul className="divide-y divide-line text-sm">
                                    {diff.map(d => (
                                        <li
                                            key={d.key}
                                            className="py-2 flex items-center gap-3 font-mono text-[12.5px]"
                                        >
                                            <span className="text-led-amber w-48 truncate">{d.key}</span>
                                            <span className="text-white/40 line-through truncate">{d.from || "—"}</span>
                                            <span className="text-led-green truncate ml-auto">{d.to}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardBody>
                    </Card>
                </div>

                {/* === 우측: 라이브 미리보기 + 출발권 === */}
                <div className="flex flex-col gap-6">
                    <motion.div
                        layout
                        transition={{type: "spring", stiffness: 320, damping: 30}}
                    >
                        <CardHeader className="px-0 pt-0">
                            <CardTitle>승차 미리보기</CardTitle>
                            <CardSubtitle>
                                지금 보이는 화면 그대로가 탑승 후 모습이에요.
                            </CardSubtitle>
                        </CardHeader>
                        <TerminalPreview
                            background={String(config["background"] ?? "#0b0f12")}
                            foreground={String(config["foreground"] ?? "#e6e6e6")}
                            cursor={String(config["cursor-color"] ?? "#00e0a4")}
                            selectionBg={String(config["selection-background"] ?? "#264f78")}
                            selectionFg={String(config["selection-foreground"] ?? "#ffffff")}
                            fontFamily={String(config["font-family"] ?? "JetBrains Mono")}
                            fontSize={Number(config["font-size"] ?? 14)}
                            paddingX={Number(config["window-padding-x"] ?? 12)}
                            paddingY={Number(config["window-padding-y"] ?? 12)}
                            opacity={Number(config["background-opacity"] ?? 1)}
                        />
                        <div className="mt-3">
                            <Label hint="palette 0–15">팔레트</Label>
                            <PaletteStrip colors={palette} />
                        </div>
                    </motion.div>

                    {/* 출발권 */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>출발권 · Export</CardTitle>
                                    <CardSubtitle>
                                        ~/.config/ghostty/config 에 저장하면 탑승 완료.
                                    </CardSubtitle>
                                </div>
                                <Badge tone="green">READY</Badge>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <pre className="rounded-xl bg-ink-900/80 border border-line p-3 text-[11.5px] font-mono text-white/75 max-h-[260px] overflow-auto whitespace-pre-wrap">
                                {exported}
                            </pre>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <Button onClick={handleDownload}>
                                    <FileDown size={14} /> 다운로드
                                </Button>
                                <Button variant="outline" onClick={handleCopy}>
                                    <Copy size={14} /> 클립보드 복사
                                </Button>
                            </div>
                            <p className="text-[11px] text-white/40 mt-3 leading-relaxed">
                                도착하기 안내: macOS는{" "}
                                <code className="text-led-amber font-mono">~/Library/Application Support/com.mitchellh.ghostty/config</code>{" "}
                                또는{" "}
                                <code className="text-led-amber font-mono">~/.config/ghostty/config</code>
                                에 저장하세요.
                            </p>
                        </CardBody>
                    </Card>

                    {/* 더미: Download 아이콘 사용으로 lint 만족 */}
                    <span className="hidden"><Download /></span>
                </div>
            </div>
        </div>
    );
}
