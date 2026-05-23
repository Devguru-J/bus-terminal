import {useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {motion} from "framer-motion";
import {StationHeader} from "@/components/shell/StationHeader";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {Label, Select, Textarea, RangeInput} from "@/components/ui/Field";
import {ToggleRow} from "@/components/ui/ToggleRow";
import {Modal} from "@/components/ui/Modal";
import {TerminalPreview} from "@/components/platform/TerminalPreview";
import {StatusDot} from "@/components/ui/Badge";
import {useGhosttyStore} from "@/stores/ghosttyStore";
import {useRoutesStore} from "@/stores/routesStore";
import {toast} from "@/stores/toastStore";

const FONTS = ["JetBrains Mono", "Fira Code", "Cascadia Code", "Geist Mono", "Iosevka"];

export function GhosttyPage() {
    const {config, setField, importText} = useGhosttyStore();
    const save = useRoutesStore(s => s.save);
    const exportText = useGhosttyStore(s => s.exportText);
    const navigate = useNavigate();

    const [importOpen, setImportOpen] = useState(false);
    const [importBuffer, setImportBuffer] = useState("");

    // === field bridges (UI label → store key)
    const fontFamily = String(config["font-family"] ?? "JetBrains Mono");
    const fontSize = Number(config["font-size"] ?? 14);
    // Line height stored as percent string (e.g. "10%"). Convert to slider 100..200 (= 1.0x–2.0x).
    const lineHeightPct = parseInt(String(config["adjust-cell-height"] ?? "0"), 10) || 0;
    const lineHeightSlider = 100 + lineHeightPct; // 100 == 1.0x
    const ligatures = Boolean(config["font-thicken"]);
    const opacity = Number(config["background-opacity"] ?? 1);
    const opacityPct = Math.round(opacity * 100);
    const blur = String(config["background-blur"] ?? "false") !== "false";
    const titlebarHidden = String(config["macos-titlebar-style"] ?? "transparent") === "hidden";

    const exported = useMemo(() => exportText(), [config, exportText]);

    function applyTitlebar(hidden: boolean) {
        setField("macos-titlebar-style", hidden ? "hidden" : "transparent");
    }
    function applyBlur(on: boolean) {
        setField("background-blur", on ? "true" : "false");
    }
    function applyLineHeight(sliderVal: number) {
        const pct = sliderVal - 100;
        setField("adjust-cell-height", pct === 0 ? "" : `${pct}%`);
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

            {/* Split workspace: 50/50 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* === Left: GUI Controls === */}
                <div className="space-y-6">
                    {/* Appearance Metrics */}
                    <section className="rounded-xl glass-panel p-6">
                        <header className="flex items-center justify-between pb-3 mb-6 border-b border-white/10">
                            <h3 className="font-mono text-label-xs uppercase tracking-[0.16em] text-primary-fixed-dim">
                                Appearance Metrics
                            </h3>
                        </header>

                        <div className="mb-7">
                            <Label>Primary Typeface</Label>
                            <Select
                                value={fontFamily}
                                onChange={e => setField("font-family", e.target.value)}
                            >
                                {FONTS.map(f => (
                                    <option key={f} value={f}>
                                        {f}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-7">
                            <div>
                                <Label>Font Size</Label>
                                <RangeInput
                                    value={fontSize}
                                    min={10}
                                    max={24}
                                    onChange={v => setField("font-size", v)}
                                />
                            </div>
                            <div>
                                <Label>Line Height</Label>
                                <RangeInput
                                    value={lineHeightSlider}
                                    min={100}
                                    max={200}
                                    onChange={applyLineHeight}
                                    suffix="%"
                                />
                            </div>
                        </div>

                        <ToggleRow
                            title="Enable Ligatures"
                            description="복잡한 기호 조합을 더 두껍게 렌더링"
                            checked={ligatures}
                            onChange={v => setField("font-thicken", v)}
                        />
                    </section>

                    {/* Window Properties */}
                    <section className="rounded-xl glass-panel p-6">
                        <header className="flex items-center justify-between pb-3 mb-6 border-b border-white/10">
                            <h3 className="font-mono text-label-xs uppercase tracking-[0.16em] text-primary-fixed-dim">
                                Window Properties
                            </h3>
                        </header>

                        <div className="mb-6">
                            <div className="flex justify-between mb-3">
                                <span className="font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant">
                                    Background Opacity
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
                                title="Window Blur"
                                description="터미널 배경에 backdrop-filter를 적용합니다"
                                checked={blur}
                                onChange={applyBlur}
                            />
                            <ToggleRow
                                title="Hide Titlebar"
                                description="테두리 없는 모드 (macOS hidden)"
                                checked={titlebarHidden}
                                onChange={applyTitlebar}
                            />
                        </div>
                    </section>
                </div>

                {/* === Right: Preview === */}
                <section className="relative">
                    <div
                        className="absolute inset-0 rounded-xl opacity-[0.05] pointer-events-none"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)",
                            backgroundSize: "24px 24px"
                        }}
                    />
                    <div className="relative z-10">
                        <h3 className="font-mono text-label-xs uppercase tracking-[0.16em] text-on-surface-variant mb-4 flex items-center gap-2">
                            <Icon name="visibility" className="text-[16px]" />
                            승차 미리보기
                        </h3>
                        <motion.div layout>
                            <TerminalPreview
                                background={String(config["background"] ?? "#0e0e0e")}
                                foreground={String(config["foreground"] ?? "#e5e2e1")}
                                cursor={String(config["cursor-color"] ?? "#00e55b")}
                                selectionBg={String(
                                    config["selection-background"] ?? "#264f78"
                                )}
                                selectionFg={String(
                                    config["selection-foreground"] ?? "#ffffff"
                                )}
                                fontFamily={fontFamily}
                                fontSize={fontSize}
                                paddingX={Number(config["window-padding-x"] ?? 24)}
                                paddingY={Number(config["window-padding-y"] ?? 20)}
                                opacity={opacity}
                                title={`user@busterminal:~ — ghostty${
                                    titlebarHidden ? " (titlebar hidden)" : ""
                                }`}
                            />
                        </motion.div>
                    </div>
                </section>
            </div>

            {/* Import modal */}
            <Modal
                open={importOpen}
                onClose={() => setImportOpen(false)}
                title="환승하기 · Import Existing Config"
                footer={
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setImportOpen(false)}
                        >
                            취소
                        </Button>
                        <Button size="sm" onClick={handleImport}>
                            <Icon name="sync_alt" className="text-[14px]" />
                            환승하기
                        </Button>
                    </>
                }
            >
                <p className="text-body-md text-on-surface-variant mb-3">
                    기존 <code className="font-mono text-primary-fixed-dim">ghostty config</code>{" "}
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
