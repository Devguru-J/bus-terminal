import {useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {motion} from "framer-motion";
import {StationHeader} from "@/components/shell/StationHeader";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {
    Label,
    Select,
    Segmented,
    Textarea,
    RangeInput
} from "@/components/ui/Field";
import {ToggleRow} from "@/components/ui/ToggleRow";
import {Toggle} from "@/components/ui/Field";
import {Modal} from "@/components/ui/Modal";
import {TerminalPreview} from "@/components/platform/TerminalPreview";
import {StatusDot} from "@/components/ui/Badge";
import {themes} from "@/data/themes";
import {useGhosttyStore} from "@/stores/ghosttyStore";
import {useRoutesStore} from "@/stores/routesStore";
import {toast} from "@/stores/toastStore";
import {cn} from "@/lib/utils";

// Google Fonts에 실제로 로드되는 폰트만 노출. (Cascadia/Iosevka는 GF에 없음)
const FONTS = [
    "JetBrains Mono",
    "Fira Code",
    "Geist Mono",
    "IBM Plex Mono",
    "Source Code Pro",
    "Roboto Mono"
];

export function GhosttyPage() {
    const {config, palette, setField, applyTheme, importText, exportText} = useGhosttyStore();
    const save = useRoutesStore(s => s.save);
    const routesCount = useRoutesStore(s => s.routes.length);
    const navigate = useNavigate();

    const [importOpen, setImportOpen] = useState(false);
    const [importBuffer, setImportBuffer] = useState("");
    const [tabPosition, setTabPosition] = useState<"top" | "bottom">("top");

    // === field bridges
    const fontFamily = String(config["font-family"] ?? "JetBrains Mono");
    const fontSize = Number(config["font-size"] ?? 14);
    const lineHeightPct = parseInt(String(config["adjust-cell-height"] ?? "0"), 10) || 0;
    const lineHeightSlider = 100 + lineHeightPct; // 100 == 기본(1.0배), 200 == 2.0배
    const lineHeightFactor = lineHeightSlider / 100; // 미리보기에 전달용
    const cursorStyle = String(config["cursor-style"] ?? "block") as "block" | "bar" | "underline";
    const cursorBlink = String(config["cursor-style-blink"] ?? "true") === "true";
    const paddingX = Number(config["window-padding-x"] ?? 16);
    const paddingY = Number(config["window-padding-y"] ?? 16);
    const opacity = Number(config["background-opacity"] ?? 1);
    const opacityPct = Math.round(opacity * 100);
    const blur = String(config["background-blur"] ?? "false") !== "false";
    const titlebarHidden = String(config["macos-titlebar-style"] ?? "transparent") === "hidden";

    // 노선 스타일 — 매핑: store의 background와 테마 카탈로그의 background로 현재 테마 추론
    const currentThemeId = useMemo(() => {
        const bg = String(config["background"] ?? "").toLowerCase();
        const match = themes.find(t => t.background.toLowerCase() === bg);
        return match?.id ?? "tokyo-night";
    }, [config]);

    const exported = useMemo(() => exportText(), [config, palette, exportText]);

    function applyLineHeight(sliderVal: number) {
        const pct = sliderVal - 100;
        setField("adjust-cell-height", pct === 0 ? "" : `${pct}%`);
    }
    function setTheme(id: string) {
        const t = themes.find(x => x.id === id);
        if (!t) return;
        applyTheme(t);
        toast(`"${t.ko}"으로 환승했어요.`, "success");
    }

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
        setImportOpen(false);
    }

    function handleBoard() {
        const name = window.prompt("차고에 보관할 노선 이름?", "내 Ghostty 노선");
        if (!name) return;
        save({name, platform: "ghostty", text: exported});
        toast(`"${name}" 노선이 차고에 보관되었어요.`, "success");
        navigate("/export");
    }

    const themeName = themes.find(t => t.id === currentThemeId)?.ko ?? "BusTerminal Dark";

    return (
        <div className="max-w-7xl mx-auto">
            <StationHeader
                title={
                    <span className="inline-flex items-center gap-3">
                        Ghostty 승강장
                        <StatusDot />
                    </span>
                }
                eyebrow="System Configuration Payload · GHY-001"
                actions={
                    <>
                        <Button variant="outline" size="md" onClick={() => setImportOpen(true)}>
                            <Icon name="sync_alt" className="text-[16px]" /> 환승하기
                        </Button>
                        <Button size="md" onClick={handleBoard}>
                            <Icon name="check_circle" className="text-[16px]" /> 탑승 완료
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-6">
                {/* === Left: 4 control panels === */}
                <div className="space-y-5">
                    {/* 1. 폰트 */}
                    <Panel title="폰트">
                        <Label>폰트</Label>
                        <Select
                            value={fontFamily}
                            onChange={e => setField("font-family", e.target.value)}
                            className="mb-5"
                        >
                            {FONTS.map(f => (
                                <option key={f} value={f}>
                                    {f}
                                </option>
                            ))}
                        </Select>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="min-w-0">
                                <Label>폰트 크기</Label>
                                <RangeInput
                                    value={fontSize}
                                    min={10}
                                    max={24}
                                    onChange={v => setField("font-size", v)}
                                />
                            </div>
                            <div className="min-w-0">
                                <Label>줄간격</Label>
                                <RangeInput
                                    value={lineHeightSlider}
                                    min={100}
                                    max={200}
                                    onChange={applyLineHeight}
                                    suffix="%"
                                />
                            </div>
                        </div>
                    </Panel>

                    {/* 2. 커서 */}
                    <Panel title="커서">
                        <Label>Style</Label>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <Segmented
                                value={cursorStyle}
                                onChange={v => setField("cursor-style", v)}
                                options={[
                                    {value: "block", label: "Block"},
                                    {value: "bar", label: "Bar"},
                                    {value: "underline", label: "Underline"}
                                ]}
                            />
                        </div>
                        <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-white/[0.05]">
                            <div>
                                <h4 className="font-mono text-code-sm text-on-surface">깜빡임</h4>
                                <p className="text-[11px] text-on-surface-variant/80 mt-1">
                                    커서가 입력 대기 중 깜빡이도록 설정
                                </p>
                            </div>
                            <Toggle
                                checked={cursorBlink}
                                onChange={v =>
                                    setField("cursor-style-blink", v ? "true" : "false")
                                }
                            />
                        </div>
                    </Panel>

                    {/* 3. 윈도우 */}
                    <Panel title="윈도우">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="min-w-0">
                                <Label>패딩 X</Label>
                                <RangeInput
                                    value={paddingX}
                                    min={0}
                                    max={48}
                                    onChange={v => setField("window-padding-x", v)}
                                />
                            </div>
                            <div className="min-w-0">
                                <Label>패딩 Y</Label>
                                <RangeInput
                                    value={paddingY}
                                    min={0}
                                    max={48}
                                    onChange={v => setField("window-padding-y", v)}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <div className="flex justify-between mb-2">
                                <span className="font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant">
                                    투명도
                                </span>
                                <span className="font-mono text-code-sm text-primary-fixed-dim">
                                    {opacityPct}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={opacityPct}
                                onChange={e =>
                                    setField("background-opacity", Number(e.target.value) / 100)
                                }
                                className="w-full accent-primary-fixed-dim"
                            />
                        </div>
                        <div className="space-y-3">
                            <ToggleRow
                                title="블러"
                                description="배경에 backdrop-filter 적용"
                                checked={blur}
                                onChange={on => setField("background-blur", on ? "true" : "false")}
                            />
                            <ToggleRow
                                title="타이틀바"
                                description={titlebarHidden ? "Hidden (테두리 없음)" : "Transparent"}
                                checked={titlebarHidden}
                                onChange={on =>
                                    setField(
                                        "macos-titlebar-style",
                                        on ? "hidden" : "transparent"
                                    )
                                }
                            />
                        </div>
                    </Panel>

                    {/* 4. 노선 스타일 */}
                    <Panel title="노선 스타일">
                        <div className="space-y-4">
                            <div>
                                <Label>스타일</Label>
                                <Select
                                    value={currentThemeId}
                                    onChange={e => setTheme(e.target.value)}
                                >
                                    {themes.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.ko}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Label>탭 위치</Label>
                                <Select
                                    value={tabPosition}
                                    onChange={e =>
                                        setTabPosition(e.target.value as "top" | "bottom")
                                    }
                                >
                                    <option value="top">Top</option>
                                    <option value="bottom">Bottom</option>
                                </Select>
                            </div>
                        </div>
                    </Panel>
                </div>

                {/* === Right: Preview === */}
                <section className="min-w-0">
                    {/* Info tab strip */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <span className="inline-flex items-center gap-2 px-3 h-8 rounded bg-primary-fixed-dim/15 border border-primary-fixed-dim/30 font-mono text-label-xs uppercase tracking-[0.14em] text-primary-fixed-dim">
                            <Icon name="visibility" className="text-[14px]" /> 현재 구성
                        </span>
                        <InfoChip label="Theme" value={themeName} />
                        <InfoChip label="Font" value={`${fontFamily} ${fontSize}`} />
                        <InfoChip label="생성 파일" value={String(routesCount)} />
                    </div>

                    <motion.div layout>
                        <TerminalPreview
                            background={String(config["background"] ?? "#0e0e0e")}
                            foreground={String(config["foreground"] ?? "#e5e2e1")}
                            cursor={String(config["cursor-color"] ?? "#00e55b")}
                            selectionBg={String(config["selection-background"] ?? "#264f78")}
                            selectionFg={String(config["selection-foreground"] ?? "#ffffff")}
                            fontFamily={fontFamily}
                            fontSize={fontSize}
                            lineHeight={lineHeightFactor}
                            paddingX={paddingX}
                            paddingY={paddingY}
                            opacity={opacity}
                            cursorStyle={cursorStyle}
                            cursorBlink={cursorBlink}
                            blur={blur}
                            hideTitlebar={titlebarHidden}
                            tabPosition={tabPosition}
                            title="user@busterminal:~ — ghostty"
                        />
                    </motion.div>
                </section>
            </div>

            {/* Import modal */}
            <Modal
                open={importOpen}
                onClose={() => setImportOpen(false)}
                title="환승하기 · Import Existing Config"
                footer={
                    <>
                        <Button variant="ghost" size="sm" onClick={() => setImportOpen(false)}>
                            취소
                        </Button>
                        <Button size="sm" onClick={handleImport}>
                            <Icon name="sync_alt" className="text-[14px]" /> 환승하기
                        </Button>
                    </>
                }
            >
                <p className="text-body-md text-on-surface-variant mb-3">
                    기존{" "}
                    <code className="font-mono text-primary-fixed-dim">ghostty config</code>{" "}
                    내용을 그대로 붙여넣으세요.
                </p>
                <Textarea
                    placeholder={`font-family = JetBrains Mono\nfont-size = 14\nbackground = 1a1b26`}
                    value={importBuffer}
                    onChange={e => setImportBuffer(e.target.value)}
                />
            </Modal>
        </div>
    );
}

function Panel({title, children}: {title: string; children: React.ReactNode}) {
    return (
        <section className="rounded-xl glass-panel p-5">
            <header className="flex items-center justify-between pb-3 mb-5 border-b border-white/10">
                <h3 className="font-mono text-label-xs uppercase tracking-[0.16em] text-primary-fixed-dim">
                    {title}
                </h3>
            </header>
            {children}
        </section>
    );
}

function InfoChip({label, value}: {label: string; value: string}) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-2 px-3 h-8 rounded",
                "bg-surface-container-low border border-white/[0.06]",
                "font-mono text-[11px] text-on-surface-variant"
            )}
        >
            <span className="uppercase tracking-[0.12em] text-on-surface-variant/60">
                {label}:
            </span>
            <span className="text-on-surface truncate max-w-[180px]">{value}</span>
        </span>
    );
}
