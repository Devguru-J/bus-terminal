import {useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {StationHeader} from "@/components/shell/StationHeader";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {ConfigPanel} from "@/components/platform/ConfigPanel";
import {TerminalPreview} from "@/components/platform/TerminalPreview";
import {
    Label,
    TextInput,
    NumberInput,
    Select,
    Textarea,
    Toggle,
    ColorInput,
    RangeInput
} from "@/components/ui/Field";
import {Badge} from "@/components/ui/Badge";
import {ghosttySchema} from "@/data/ghosttySchema";
import {useGhosttyStore} from "@/stores/ghosttyStore";
import {useRoutesStore} from "@/stores/routesStore";
import {toast} from "@/stores/toastStore";
import {copyText} from "@/lib/download";
import {buildShareUrl, encodePayload} from "@/lib/share";

export function GhosttyPage() {
    const {config, palette, setField, importText, exportText} = useGhosttyStore();
    const save = useRoutesStore(s => s.save);
    const navigate = useNavigate();
    const [importBuffer, setImportBuffer] = useState("");

    const exported = useMemo(() => exportText(), [config, palette, exportText]);

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

    function handleSave() {
        const name = window.prompt("차고에 보관할 노선 이름?", "내 Ghostty 노선");
        if (!name) return;
        save({name, platform: "ghostty", text: exported});
        toast(`"${name}" 노선이 차고에 보관되었어요.`, "success");
    }

    function handleShareLink() {
        const url = buildShareUrl(location.origin, "/ghostty", encodePayload(exported));
        copyText(url).then(() => toast("공유 링크를 복사했어요.", "success"));
    }

    return (
        <div className="max-w-7xl mx-auto">
            <StationHeader
                title="Ghostty 승강장"
                eyebrow="System Configuration Payload · ghy-001"
                actions={
                    <>
                        <Button variant="outline" size="sm" onClick={handleSave}>
                            <Icon name="bookmark_add" className="text-[16px]" /> 차고 보관
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleShareLink}>
                            <Icon name="link" className="text-[16px]" /> 공유 링크
                        </Button>
                        <Button size="sm" onClick={() => navigate("/export")}>
                            <Icon name="rocket_launch" className="text-[16px]" /> 출발 완료
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-[400px_minmax(0,1fr)] gap-6">
                {/* === Left: Settings === */}
                <div className="space-y-5">
                    <ConfigPanel
                        title="환승하기 · Import"
                        actions={<Badge tone="warn">Auto Parse</Badge>}
                    >
                        <Textarea
                            placeholder={`font-family = JetBrains Mono\nfont-size = 14\nbackground = 1a1b26`}
                            value={importBuffer}
                            onChange={e => setImportBuffer(e.target.value)}
                        />
                        <div className="mt-3 flex gap-2">
                            <Button size="sm" onClick={handleImport}>
                                <Icon name="upload" className="text-[14px]" /> Import
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setImportBuffer("")}
                            >
                                Clear
                            </Button>
                        </div>
                    </ConfigPanel>

                    {/* Schema groups */}
                    {ghosttySchema.map(group => (
                        <ConfigPanel key={group.id} title={group.ko}>
                            <p className="text-[12px] text-on-surface-variant mb-4">
                                {group.desc}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {group.fields.map(f => (
                                    <div key={f.id} className="min-w-0">
                                        <Label hint={f.id}>{f.ko}</Label>
                                        {f.kind === "string" && (
                                            <TextInput
                                                value={String(config[f.id] ?? "")}
                                                placeholder={f.placeholder}
                                                onChange={e =>
                                                    setField(f.id, e.target.value)
                                                }
                                            />
                                        )}
                                        {f.kind === "number" && f.min !== undefined ? (
                                            <RangeInput
                                                value={Number(config[f.id] ?? 0)}
                                                min={f.min}
                                                max={f.max ?? 100}
                                                step={f.step}
                                                onChange={v => setField(f.id, v)}
                                            />
                                        ) : null}
                                        {f.kind === "number" && f.min === undefined && (
                                            <NumberInput
                                                value={Number(config[f.id] ?? 0)}
                                                onChange={e =>
                                                    setField(f.id, Number(e.target.value))
                                                }
                                            />
                                        )}
                                        {f.kind === "boolean" && (
                                            <div className="h-10 flex items-center">
                                                <Toggle
                                                    checked={Boolean(config[f.id])}
                                                    onChange={v => setField(f.id, v)}
                                                    label={config[f.id] ? "ON" : "OFF"}
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
                                                onChange={e =>
                                                    setField(f.id, e.target.value)
                                                }
                                            >
                                                {f.options.map(o => (
                                                    <option key={o.value} value={o.value}>
                                                        {o.ko}
                                                    </option>
                                                ))}
                                            </Select>
                                        )}
                                        {f.help && (
                                            <p className="text-[11px] text-on-surface-variant/60 mt-2 leading-relaxed">
                                                {f.help}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ConfigPanel>
                    ))}
                </div>

                {/* === Right: Preview === */}
                <div className="space-y-5 min-w-0">
                    <div>
                        <div className="font-mono text-label-xs uppercase tracking-[0.16em] text-primary-fixed-dim mb-3 flex items-center gap-2">
                            <Icon name="visibility" className="text-[14px]" /> 승차 미리보기
                        </div>
                        <TerminalPreview
                            background={String(config["background"] ?? "#0e0e0e")}
                            foreground={String(config["foreground"] ?? "#e5e2e1")}
                            cursor={String(config["cursor-color"] ?? "#00e55b")}
                            selectionBg={String(config["selection-background"] ?? "#264f78")}
                            selectionFg={String(config["selection-foreground"] ?? "#ffffff")}
                            fontFamily={String(config["font-family"] ?? "JetBrains Mono")}
                            fontSize={Number(config["font-size"] ?? 14)}
                            paddingX={Number(config["window-padding-x"] ?? 12)}
                            paddingY={Number(config["window-padding-y"] ?? 12)}
                            opacity={Number(config["background-opacity"] ?? 1)}
                        />
                    </div>

                    <ConfigPanel
                        title="출발권 · Generated Config"
                        actions={<Badge tone="active">Ready</Badge>}
                    >
                        <pre className="rounded-lg bg-surface-container-lowest border border-white/[0.06] p-3 text-[12px] font-mono text-on-surface-variant max-h-[260px] overflow-auto whitespace-pre-wrap">
                            {exported}
                        </pre>
                    </ConfigPanel>
                </div>
            </div>
        </div>
    );
}
