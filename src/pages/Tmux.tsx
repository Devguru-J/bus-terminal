import {useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {StationHeader} from "@/components/shell/StationHeader";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {ConfigPanel} from "@/components/platform/ConfigPanel";
import {
    Label,
    TextInput,
    NumberInput,
    Segmented,
    Toggle,
    RangeInput,
    Select
} from "@/components/ui/Field";
import {ToggleRow} from "@/components/ui/ToggleRow";
import {TmuxPreview} from "@/components/platform/TmuxPreview";
import {Badge} from "@/components/ui/Badge";
import {tmuxDefaultKeyBindings, tmuxPlugins, type TmuxKeyBinding} from "@/data/tmux";
import {useTmuxStore} from "@/stores/tmuxStore";
import {useRoutesStore} from "@/stores/routesStore";
import {toast, toastWithUndo} from "@/stores/toastStore";
import {ImportWizard} from "@/components/platform/ImportWizard";
import {importTmuxConf} from "@/lib/importers";
import {cn} from "@/lib/utils";

export function TmuxPage() {
    const [importOpen, setImportOpen] = useState(false);
    const {config, setField, togglePlugin, exportText} = useTmuxStore();
    const save = useRoutesStore(s => s.save);
    const navigate = useNavigate();
    const [bindingQuery, setBindingQuery] = useState("");

    const exported = useMemo(() => exportText(), [config, exportText]);
    const filteredBindings = useMemo(() => {
        const q = bindingQuery.trim().toLowerCase();
        if (!q) return config.keyBindings;
        return config.keyBindings.filter(binding =>
            `${binding.key} ${binding.command} ${binding.label} ${binding.category}`
                .toLowerCase()
                .includes(q)
        );
    }, [bindingQuery, config.keyBindings]);

    function handleSave() {
        const name = window.prompt("차고에 보관할 노선 이름?", "내 tmux 노선");
        if (!name) return;
        save({name, platform: "tmux", text: exported});
        toast(`"${name}" 노선이 차고에 보관되었어요.`, "success");
    }

    function addCustomPlugin() {
        const plugin = window.prompt("추가할 TPM 플러그인 경로", "tmux-plugins/tmux-open");
        if (!plugin?.trim()) return;
        const next = Array.from(new Set([...config.customPlugins, plugin.trim()]));
        setField("customPlugins", next);
        toast(`${plugin.trim()} 플러그인을 추가했어요.`, "success");
    }

    function addCustomBinding() {
        const key = window.prompt("바인딩 키", "r");
        if (!key?.trim()) return;
        const command = window.prompt("tmux 명령", "source-file ~/.tmux.conf \\; display-message 'Reloaded'");
        if (!command?.trim()) return;
        const label = window.prompt("표시 이름", "Reload config") ?? "";
        setField("keyBindings", [
            ...config.keyBindings,
            {
                id: `custom-${crypto.randomUUID()}`,
                key: key.trim(),
                command: command.trim(),
                label: label.trim() || command.trim(),
                category: "custom",
                enabled: true,
                builtin: false
            }
        ]);
        toast(`${key.trim()} 바인딩을 추가했어요.`, "success");
    }

    function resetCustomBindings() {
        setField("keyBindings", tmuxDefaultKeyBindings.map(binding => ({...binding})));
        toast("tmux 기본 키바인딩으로 복원했어요.", "success");
    }

    function updateBinding(id: string, patch: Partial<TmuxKeyBinding>) {
        setField(
            "keyBindings",
            config.keyBindings.map(binding =>
                binding.id === id ? {...binding, ...patch} : binding
            )
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <StationHeader
                title="tmux 승강장"
                eyebrow="Platform 7 Active"
                subtitle="전문가용 tmux 세션 인터페이스 및 실시간 미리보기. 변경사항은 다음 출발 때 적용됩니다."
                actions={
                    <>
                        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                            <Icon name="sync_alt" className="text-[16px]" /> 환승하기
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleSave}>
                            <Icon name="bookmark_add" className="text-[16px]" /> 차고 보관
                        </Button>
                        <Button size="sm" onClick={() => navigate("/export")}>
                            <Icon name="rocket_launch" className="text-[16px]" /> 출발권 만들기
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
                                <Label hint="status-position" help="tmux 상태바를 터미널 위쪽 또는 아래쪽에 표시합니다. 기본은 bottom입니다.">Position</Label>
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
                                <Label hint="status-interval" help="상태바의 시간, 배터리, 커스텀 정보가 몇 초마다 새로고침될지 정합니다. 0이면 자동 갱신을 끕니다.">Refresh Interval (sec)</Label>
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
                                <Label hint="status-style" help="상태바의 글자색과 배경색입니다. 예: fg=white,bg=black 또는 fg=#ffffff,bg=#111111">Status Style</Label>
                                <TextInput
                                    value={config.statusStyle}
                                    onChange={e => setField("statusStyle", e.target.value)}
                                />
                            </div>
                        </div>
                        <pre className="mt-4 rounded-lg bg-surface-container-lowest border border-white/[0.06] p-3 text-[12px] font-mono text-on-surface-variant whitespace-pre-wrap">
                            {`set-option -g status-position ${config.statusPosition}\nset-option -g status-interval ${config.statusInterval}\nset -g status-style "${config.statusStyle}"`}
                        </pre>
                    </ConfigPanel>

                    <ConfigPanel title="Layout / Behavior">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div>
                                <Label hint="prefix" help="tmux 명령을 시작하는 기준 키입니다. 기본 C-b, screen 스타일은 C-a를 많이 씁니다.">Prefix Key</Label>
                                <TextInput
                                    value={config.prefix}
                                    onChange={e => setField("prefix", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label hint="base-index" help="윈도우 번호를 0부터 시작할지 1부터 시작할지 정합니다. 사람이 읽기에는 1이 편한 경우가 많습니다.">Base Index</Label>
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
                                <Label hint="pane-base-index" help="pane 번호를 0부터 시작할지 1부터 시작할지 정합니다. base-index와 맞추면 혼동이 줄어듭니다.">Pane Base Index</Label>
                                <NumberInput
                                    value={config.paneBaseIndex}
                                    min={0}
                                    max={1}
                                    onChange={e =>
                                        setField("paneBaseIndex", Number(e.target.value) || 0)
                                    }
                                />
                            </div>
                            <div>
                                <Label hint="mouse" help="마우스로 pane 선택, resize, 스크롤을 할 수 있게 합니다. 초보자는 켜두면 편합니다.">Mouse</Label>
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
                        title="Advanced / Copy & Panes"
                        actions={<Badge tone="warn">advanced</Badge>}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <Label hint="mode-keys" help="tmux 복사 모드에서 사용할 키 스타일입니다. Vim에 익숙하면 vi를 추천합니다.">Copy Mode Keys</Label>
                                <Segmented
                                    value={config.modeKeys}
                                    onChange={v => setField("modeKeys", v)}
                                    options={[
                                        {value: "emacs", label: "Emacs"},
                                        {value: "vi", label: "Vi"}
                                    ]}
                                />
                            </div>
                            <div>
                                <Label hint="history-limit" help="tmux가 기억할 이전 출력 줄 수입니다. 로그를 많이 보면 크게, 메모리를 아끼려면 작게 둡니다.">Scrollback Lines</Label>
                                <RangeInput
                                    value={config.historyLimit}
                                    min={2000}
                                    max={50000}
                                    step={1000}
                                    onChange={v => setField("historyLimit", v)}
                                />
                            </div>
                            <div>
                                <Label hint="escape-time" help="Esc 입력을 기다리는 시간입니다. Vim을 tmux 안에서 쓸 때 반응이 느리면 낮추는 경우가 많습니다.">Escape Time</Label>
                                <NumberInput
                                    value={config.escapeTime}
                                    min={0}
                                    max={1000}
                                    onChange={e =>
                                        setField("escapeTime", Number(e.target.value) || 0)
                                    }
                                />
                            </div>
                            <div>
                                <Label hint="split-window" help="pane을 가로/세로로 나누는 단축키 묶음입니다. Vim-friendly는 | 와 - 를 사용합니다.">Split Binding Preset</Label>
                                <Select
                                    value={config.splitPreset}
                                    onChange={e =>
                                        setField(
                                            "splitPreset",
                                            e.target.value as typeof config.splitPreset
                                        )
                                    }
                                >
                                    <option value="tmux-default">% / "</option>
                                    <option value="vim-friendly">| / -</option>
                                </Select>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <ToggleRow
                                title="윈도우 번호 자동 정렬"
                                description="renumber-windows on"
                                checked={config.renumberWindows}
                                onChange={v => setField("renumberWindows", v)}
                            />
                            <ToggleRow
                                title="Vim식 pane 이동"
                                description="prefix + h/j/k/l"
                                checked={config.vimPaneNavigation}
                                onChange={v => setField("vimPaneNavigation", v)}
                            />
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
                                onClick={addCustomPlugin}
                                className="rounded-lg border border-dashed border-white/15 p-3 text-on-surface-variant/60 hover:border-white/30 hover:text-on-surface transition flex items-center justify-center gap-2 font-mono text-label-xs uppercase tracking-[0.12em]"
                            >
                                <Icon name="add" className="text-[16px]" /> Add Plugin
                            </button>
                        </div>
                        {config.customPlugins.length > 0 && (
                            <div className="mt-4 rounded-lg border border-white/[0.06] bg-surface-container-lowest p-3">
                                <Label hint="custom TPM plugins" help="목록에 없는 TPM 플러그인을 owner/repo 형식으로 직접 추가합니다. export 시 @plugin 줄로 생성됩니다.">Custom Plugins</Label>
                                <div className="space-y-2">
                                    {config.customPlugins.map(plugin => (
                                        <div
                                            key={plugin}
                                            className="flex items-center justify-between gap-3 rounded bg-white/[0.03] px-3 py-2"
                                        >
                                            <span className="font-mono text-[12px] text-on-surface-variant truncate">
                                                {plugin}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setField(
                                                        "customPlugins",
                                                        config.customPlugins.filter(p => p !== plugin)
                                                    )
                                                }
                                                className="text-on-surface-variant hover:text-error"
                                                aria-label={`${plugin} 제거`}
                                            >
                                                <Icon name="close" className="text-[14px]" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                            <button
                                type="button"
                                onClick={resetCustomBindings}
                                className="text-on-surface-variant hover:text-on-surface text-[14px]"
                                title="기본 키바인딩 복원"
                                aria-label="기본 키바인딩 복원"
                            >
                                <Icon name="refresh" />
                            </button>
                        }
                    >
                        <div className="space-y-3">
                            <TextInput
                                value={bindingQuery}
                                onChange={e => setBindingQuery(e.target.value)}
                                placeholder="키, 명령, 기능 검색"
                            />
                            <div className="max-h-[580px] overflow-y-auto pr-1 space-y-2">
                                {filteredBindings.map(binding => (
                                    <KeyBindingEditor
                                        key={binding.id}
                                        binding={binding}
                                        onChange={patch => updateBinding(binding.id, patch)}
                                        onDelete={() =>
                                            setField(
                                                "keyBindings",
                                                config.keyBindings.filter(x => x.id !== binding.id)
                                            )
                                        }
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={addCustomBinding}
                                className="w-full rounded-lg border border-dashed border-white/15 px-3 py-3 font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant hover:text-on-surface hover:border-white/30 transition inline-flex items-center justify-center gap-2"
                            >
                                <Icon name="add" className="text-[16px]" /> Add Binding
                            </button>
                        </div>
                    </ConfigPanel>
                </div>
            </div>


            <ImportWizard
                open={importOpen}
                onClose={() => setImportOpen(false)}
                title="tmux 설정 환승하기"
                accept=".conf,.tmux,.txt"
                placeholder="~/.tmux.conf 내용을 붙여넣어 주세요."
                hint="기존 ~/.tmux.conf를 흡수해 현재 설정에 덮어씁니다. set/setw/bind 줄을 인식합니다."
                parse={importTmuxConf}
                onApply={(r) => {
                    const before = {...useTmuxStore.getState().config};
                    for (const [k, v] of Object.entries(r.value)) {
                        setField(k as never, v as never);
                    }
                    toastWithUndo(
                        `${r.applied}개 키를 환승했어요.`,
                        () => useTmuxStore.setState({config: before as never})
                    );
                }}
            />
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

function KeyBindingEditor({
    binding,
    onChange,
    onDelete
}: {
    binding: TmuxKeyBinding;
    onChange: (patch: Partial<TmuxKeyBinding>) => void;
    onDelete: () => void;
}) {
    return (
        <div className="rounded-lg border border-white/[0.06] bg-surface-container-lowest p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <button
                        type="button"
                        onClick={() => onChange({enabled: !binding.enabled})}
                        className={cn(
                            "h-5 w-5 shrink-0 rounded border transition",
                            binding.enabled
                                ? "border-primary-fixed-dim bg-primary-fixed-dim"
                                : "border-white/20 bg-white/[0.03]"
                        )}
                        aria-label={binding.enabled ? "비활성화" : "활성화"}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant">
                        {binding.category}
                    </span>
                    {binding.builtin && <Badge tone="muted">default</Badge>}
                </div>
                {!binding.builtin && (
                    <button
                        type="button"
                        onClick={onDelete}
                        className="text-on-surface-variant hover:text-error"
                        aria-label="바인딩 삭제"
                    >
                        <Icon name="delete" className="text-[15px]" />
                    </button>
                )}
            </div>
            <div className="grid grid-cols-[72px_1fr] gap-2">
                <TextInput
                    value={binding.key}
                    onChange={e => onChange({key: e.target.value})}
                    aria-label={`${binding.label} key`}
                />
                <TextInput
                    value={binding.command}
                    onChange={e => onChange({command: e.target.value})}
                    aria-label={`${binding.label} command`}
                />
            </div>
            <TextInput
                className="mt-2"
                value={binding.label}
                onChange={e => onChange({label: e.target.value})}
                aria-label={`${binding.label} label`}
            />        </div>
    );
}
