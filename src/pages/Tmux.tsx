import {useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {StationHeader} from "@/components/shell/StationHeader";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {ConfigPanel} from "@/components/platform/ConfigPanel";
import {Label, TextInput, NumberInput, Segmented, Toggle} from "@/components/ui/Field";
import {TmuxPreview} from "@/components/platform/TmuxPreview";
import {Badge} from "@/components/ui/Badge";
import {tmuxPlugins} from "@/data/tmux";
import {useTmuxStore} from "@/stores/tmuxStore";
import {useRoutesStore} from "@/stores/routesStore";
import {toast} from "@/stores/toastStore";
import {cn} from "@/lib/utils";

export function TmuxPage() {
    const {config, setField, togglePlugin, exportText} = useTmuxStore();
    const save = useRoutesStore(s => s.save);
    const navigate = useNavigate();

    const exported = useMemo(() => exportText(), [config, exportText]);

    function handleSave() {
        const name = window.prompt("차고에 보관할 노선 이름?", "내 tmux 노선");
        if (!name) return;
        save({name, platform: "tmux", text: exported});
        toast(`"${name}" 노선이 차고에 보관되었어요.`, "success");
    }

    return (
        <div className="max-w-7xl mx-auto">
            <StationHeader
                title="tmux 승강장"
                eyebrow="Platform 2 Active"
                subtitle="전문가용 tmux 세션 인터페이스 및 실시간 미리보기. 변경사항은 다음 출발 때 적용됩니다."
                actions={
                    <>
                        <Button variant="outline" size="sm" onClick={handleSave}>
                            <Icon name="bookmark_add" className="text-[16px]" /> 차고 보관
                        </Button>
                        <Button size="sm" onClick={() => navigate("/export")}>
                            <Icon name="rocket_launch" className="text-[16px]" /> 출발 완료
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
                <div className="space-y-5 min-w-0">
                    <ConfigPanel
                        title="Status Bar"
                        actions={<span className="font-mono text-[10px] text-on-surface-variant/60">tmux.conf</span>}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <Label hint="status-position">Position</Label>
                                <Segmented
                                    value={config.statusPosition}
                                    onChange={v => setField("statusPosition", v)}
                                    options={[
                                        {value: "top", label: "Top"},
                                        {value: "bottom", label: "Bottom"}
                                    ]}
                                />
                            </div>
                            <div>
                                <Label hint="status-interval">Refresh Interval (sec)</Label>
                                <NumberInput
                                    value={config.statusInterval}
                                    min={0}
                                    max={60}
                                    onChange={e =>
                                        setField("statusInterval", Number(e.target.value) || 0)
                                    }
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <Label hint="status-style">Status Style</Label>
                                <TextInput
                                    value={config.statusStyle}
                                    onChange={e => setField("statusStyle", e.target.value)}
                                />
                            </div>
                        </div>
                        <pre className="mt-4 rounded-lg bg-surface-container-lowest border border-white/[0.06] p-3 text-[12px] font-mono text-on-surface-variant whitespace-pre-wrap">
                            {`set-option -g status-position ${config.statusPosition}\nset-option -g status-interval 1\nset -g status-style "${config.statusStyle}"`}
                        </pre>
                    </ConfigPanel>

                    <ConfigPanel title="Layout / Behavior">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div>
                                <Label hint="prefix">Prefix Key</Label>
                                <TextInput
                                    value={config.prefix}
                                    onChange={e => setField("prefix", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label hint="base-index">Base Index</Label>
                                <NumberInput
                                    value={config.baseIndex}
                                    min={0}
                                    max={1}
                                    onChange={e =>
                                        setField("baseIndex", Number(e.target.value) || 0)
                                    }
                                />
                            </div>
                            <div>
                                <Label hint="mouse">Mouse</Label>
                                <div className="h-10 flex items-center">
                                    <Toggle
                                        checked={config.mouse}
                                        onChange={v => setField("mouse", v)}
                                        label={config.mouse ? "ON" : "OFF"}
                                    />
                                </div>
                            </div>
                        </div>
                    </ConfigPanel>

                    <ConfigPanel
                        title="Plugins (TPM)"
                        actions={
                            <Badge tone="active">{config.plugins.length} selected</Badge>
                        }
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {tmuxPlugins.map(p => {
                                const on = config.plugins.includes(p.id);
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => togglePlugin(p.id)}
                                        className={cn(
                                            "text-left rounded-lg border p-3 transition",
                                            on
                                                ? "border-primary-fixed-dim/40 bg-primary-fixed-dim/[0.06]"
                                                : "border-white/[0.06] bg-surface-container-lowest/60 hover:border-white/15"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-code-sm text-on-surface truncate">
                                                {p.name}
                                            </span>
                                            <span
                                                className={cn(
                                                    "h-3 w-3 rounded-full border",
                                                    on
                                                        ? "bg-primary-fixed-dim border-primary-fixed-dim"
                                                        : "border-white/30"
                                                )}
                                            />
                                        </div>
                                        <p className="text-[11px] text-on-surface-variant mt-1">
                                            {p.desc}
                                        </p>
                                    </button>
                                );
                            })}
                            <button
                                type="button"
                                className="rounded-lg border border-dashed border-white/15 p-3 text-on-surface-variant/60 hover:border-white/30 hover:text-on-surface transition flex items-center justify-center gap-2 font-mono text-label-xs uppercase tracking-[0.12em]"
                            >
                                <Icon name="add" className="text-[16px]" /> Add Plugin
                            </button>
                        </div>
                    </ConfigPanel>
                </div>

                <div className="space-y-5">
                    <ConfigPanel
                        title="실시간 미리보기"
                        actions={<Badge tone="info">tmux</Badge>}
                    >
                        <TmuxPreview config={config} />
                    </ConfigPanel>

                    <ConfigPanel
                        title="Key Bindings"
                        actions={
                            <button className="text-on-surface-variant hover:text-on-surface text-[14px]">
                                <Icon name="refresh" />
                            </button>
                        }
                    >
                        <div className="space-y-3">
                            <KeyBinding label="Prefix Key" sub="Main trigger" combo={config.prefix} />
                            <KeyBinding label="Split Horizontal" sub="New pane" combo="%" />
                            <KeyBinding label="Split Vertical" sub="New pane" combo='"' />
                            <button className="w-full rounded-lg border border-dashed border-white/15 px-3 py-3 font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant hover:text-on-surface hover:border-white/30 transition inline-flex items-center justify-center gap-2">
                                <Icon name="add" className="text-[16px]" /> Add Binding
                            </button>
                        </div>
                    </ConfigPanel>
                </div>
            </div>
        </div>
    );
}

function KeyBinding({label, sub, combo}: {label: string; sub: string; combo: string}) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-surface-container-lowest px-3 py-2.5">
            <div>
                <div className="text-code-sm text-on-surface">{label}</div>
                <div className="text-[11px] text-on-surface-variant">{sub}</div>
            </div>
            <span className="font-mono text-code-sm px-2 py-1 rounded bg-primary-fixed-dim/15 text-primary-fixed-dim border border-primary-fixed-dim/30">
                {combo}
            </span>
        </div>
    );
}
