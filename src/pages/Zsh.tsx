import {useState} from "react";
import {useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {StationHeader} from "@/components/shell/StationHeader";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {Label, Select, NumberInput, TextInput} from "@/components/ui/Field";
import {ToggleRow} from "@/components/ui/ToggleRow";
import {ConfigPanel} from "@/components/platform/ConfigPanel";
import {Badge, StatusDot} from "@/components/ui/Badge";
import {ZSH_PROMPTS, zshPlugins, type ZshPromptId} from "@/data/zsh";
import {useZshStore} from "@/stores/zshStore";
import {useRoutesStore} from "@/stores/routesStore";
import {toast} from "@/stores/toastStore";
import {ImportWizard} from "@/components/platform/ImportWizard";
import {importZshrc} from "@/lib/importers";
import {cn} from "@/lib/utils";

export function ZshPage() {
    const [importOpen, setImportOpen] = useState(false);
    const {
        config,
        setField,
        togglePlugin,
        setAlias,
        addAlias,
        removeAlias,
        exportText,
        reset
    } = useZshStore();
    const save = useRoutesStore(s => s.save);
    const navigate = useNavigate();

    const exported = useMemo(() => exportText(), [config, exportText]);
    const currentPrompt = ZSH_PROMPTS.find(p => p.id === config.prompt) ?? ZSH_PROMPTS[0];

    function handleBoard() {
        const name = window.prompt("차고에 보관할 노선 이름?", "내 Zsh 노선");
        if (!name) return;
        save({name, platform: "zsh", text: exported});
        toast(`"${name}" 노선이 차고에 보관되었어요.`, "success");
        navigate("/export");
    }

    return (
        <div className="max-w-7xl mx-auto">
            <StationHeader
                title={
                    <span className="inline-flex items-center gap-3">
                        Zsh 승강장
                        <StatusDot />
                    </span>
                }
                eyebrow="Platform 6 · ZSH-001"
                subtitle="프롬프트 · 히스토리 · 플러그인 · 별칭을 조합해 ~/.zshrc를 출발시킵니다."
                actions={
                    <>
                        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                            <Icon name="sync_alt" className="text-[16px]" /> 환승하기
                        </Button>
                        <Button variant="ghost" size="sm" onClick={reset}>
                            <Icon name="restart_alt" className="text-[14px]" /> 초기화
                        </Button>
                        <Button size="md" onClick={handleBoard}>
                            <Icon name="check_circle" className="text-[16px]" /> 탑승 완료
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
                <div className="space-y-5 min-w-0">
                    {/* 프롬프트 */}
                    <ConfigPanel
                        title="프롬프트"
                        actions={<Badge tone="active">{currentPrompt.ko}</Badge>}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {ZSH_PROMPTS.map(p => {
                                const on = p.id === config.prompt;
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setField("prompt", p.id as ZshPromptId)}
                                        className={cn(
                                            "text-left rounded-lg border p-3 transition",
                                            on
                                                ? "border-primary-fixed-dim/40 bg-primary-fixed-dim/[0.06]"
                                                : "border-white/[0.06] bg-surface-container-lowest/60 hover:border-white/15"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-code-sm text-on-surface">
                                                {p.ko}
                                            </span>
                                            <span
                                                className={cn(
                                                    "h-3 w-3 rounded-full border shrink-0",
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
                        </div>
                    </ConfigPanel>

                    {/* History */}
                    <ConfigPanel title="히스토리">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
                            <div>
                                <Label hint="HISTSIZE" help="현재 셸 세션 안에서 기억할 명령어 개수입니다. 값을 크게 하면 위/아래 방향키로 더 오래된 명령을 찾을 수 있습니다.">메모리 보관 줄 수</Label>
                                <NumberInput
                                    value={config.histsize}
                                    onChange={e =>
                                        setField("histsize", Number(e.target.value) || 0)
                                    }
                                />
                            </div>
                            <div>
                                <Label hint="SAVEHIST" help="셸을 껐다 켜도 남겨둘 명령어 개수입니다. 여러 터미널 세션에서 기록을 오래 보존하려면 크게 둡니다.">파일 보관 줄 수</Label>
                                <NumberInput
                                    value={config.savehist}
                                    onChange={e =>
                                        setField("savehist", Number(e.target.value) || 0)
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <ToggleRow
                                title="세션 간 히스토리 공유"
                                description="SHARE_HISTORY"
                                checked={config.shareHistory}
                                onChange={v => setField("shareHistory", v)}
                            />
                            <ToggleRow
                                title="중복 제거"
                                description="HIST_IGNORE_DUPS"
                                checked={config.ignoreDups}
                                onChange={v => setField("ignoreDups", v)}
                            />
                            <ToggleRow
                                title="AUTO_CD"
                                description="디렉터리 이름 입력만으로 cd"
                                checked={config.autoCd}
                                onChange={v => setField("autoCd", v)}
                            />
                        </div>
                    </ConfigPanel>

                    {/* 플러그인 */}
                    <ConfigPanel
                        title="플러그인"
                        actions={
                            <Badge tone="active">{config.plugins.length} selected</Badge>
                        }
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {zshPlugins.map(p => {
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
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-mono text-code-sm text-on-surface truncate">
                                                {p.ko}
                                            </span>
                                            <Badge tone={p.framework === "omz" ? "info" : "default"}>
                                                {p.framework === "omz" ? "omz" : "ext"}
                                            </Badge>
                                        </div>
                                        <p className="text-[11px] text-on-surface-variant mt-1">
                                            {p.desc}
                                        </p>
                                        <p className="text-[10px] text-on-surface-variant/50 mt-1 font-mono">
                                            {p.name}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </ConfigPanel>

                    {/* Aliases */}
                    <ConfigPanel
                        title="별칭 (Aliases)"
                        actions={
                            <Button size="sm" variant="ghost" onClick={addAlias}>
                                <Icon name="add" className="text-[14px]" /> 추가
                            </Button>
                        }
                    >
                        <div className="space-y-2">
                            {config.aliases.length === 0 && (
                                <p className="text-[12px] text-on-surface-variant/60">
                                    등록된 별칭이 없어요. "추가"로 새 alias를 만드세요.
                                </p>
                            )}
                            {config.aliases.map((a, i) => (
                                <div
                                    key={i}
                                    className="grid grid-cols-[120px_1fr_auto] gap-2 items-center"
                                >
                                    <TextInput
                                        placeholder="ll"
                                        value={a.name}
                                        onChange={e => setAlias(i, e.target.value, a.value)}
                                    />
                                    <TextInput
                                        placeholder="ls -lah"
                                        value={a.value}
                                        onChange={e => setAlias(i, a.name, e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeAlias(i)}
                                        className="h-10 w-10 grid place-items-center rounded text-on-surface-variant hover:text-error hover:bg-error/10 transition"
                                        aria-label="삭제"
                                    >
                                        <Icon name="delete" className="text-[16px]" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </ConfigPanel>

                    <ConfigPanel
                        title="Advanced / PATH · Env · Completion"
                        actions={<Badge tone="warn">advanced</Badge>}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
                            <div>
                                <Label hint="HISTFILE" help="명령어 히스토리를 저장할 파일 경로입니다. 기본은 ~/.zsh_history입니다.">히스토리 파일</Label>
                                <TextInput
                                    value={config.histfile}
                                    onChange={e => setField("histfile", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label hint="starship.toml" help="Starship 프롬프트를 선택했을 때 함께 생성할 starship.toml 스타일입니다. minimal은 빠르고, git-heavy는 Git 상태 표시가 풍부합니다.">Starship Preset</Label>
                                <Select
                                    value={config.starshipPreset}
                                    onChange={e =>
                                        setField(
                                            "starshipPreset",
                                            e.target.value as typeof config.starshipPreset
                                        )
                                    }
                                >
                                    <option value="minimal">minimal</option>
                                    <option value="developer">developer</option>
                                    <option value="git-heavy">git-heavy</option>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            <ToggleRow
                                title="전체 중복 히스토리 제거"
                                description="HIST_IGNORE_ALL_DUPS"
                                checked={config.ignoreAllDups}
                                onChange={v => setField("ignoreAllDups", v)}
                            />
                            <ToggleRow
                                title="히스토리 공백 정리"
                                description="HIST_REDUCE_BLANKS"
                                checked={config.reduceBlanks}
                                onChange={v => setField("reduceBlanks", v)}
                            />
                            <ToggleRow
                                title="명령 즉시 저장"
                                description="INC_APPEND_HISTORY"
                                checked={config.incAppendHistory}
                                onChange={v => setField("incAppendHistory", v)}
                            />
                            <ToggleRow
                                title="Completion 초기화"
                                description="compinit"
                                checked={config.completion}
                                onChange={v => setField("completion", v)}
                            />
                            <ToggleRow
                                title="대소문자 무시 completion"
                                description="zstyle matcher-list"
                                checked={config.caseInsensitiveCompletion}
                                onChange={v => setField("caseInsensitiveCompletion", v)}
                            />
                            <ToggleRow
                                title="Vi 입력 모드"
                                description="bindkey -v"
                                checked={config.viMode}
                                onChange={v => setField("viMode", v)}
                            />
                        </div>
                        <AdvancedList
                            title="PATH"
                            items={config.pathEntries}
                            placeholder="$HOME/.local/bin"
                            onChange={items => setField("pathEntries", items)}
                        />
                        <KeyValueList
                            title="ENV"
                            items={config.envVars}
                            keyPlaceholder="EDITOR"
                            valuePlaceholder="nvim"
                            onChange={items => setField("envVars", items)}
                        />
                        <FunctionList
                            items={config.functions}
                            onChange={items => setField("functions", items)}
                        />
                    </ConfigPanel>
                </div>

                <div className="space-y-5">
                    <ConfigPanel title="실시간 미리보기 · ~/.zshrc">
                        <pre className="rounded-lg bg-surface-container-lowest border border-white/[0.06] p-3 text-[11.5px] font-mono text-on-surface-variant max-h-[560px] overflow-auto whitespace-pre-wrap">
                            {exported}
                        </pre>
                    </ConfigPanel>
                </div>
            </div>


            <ImportWizard
                open={importOpen}
                onClose={() => setImportOpen(false)}
                title="zsh 설정 환승하기"
                accept=".zshrc,.sh,.txt"
                placeholder="~/.zshrc 내용을 붙여넣어 주세요."
                hint="ZSH_THEME, plugins=(...), alias, export, HISTSIZE/HISTFILE를 자동 흡수합니다."
                parse={importZshrc}
                onApply={(r) => {
                    for (const [k, v] of Object.entries(r.value)) {
                        setField(k as never, v as never);
                    }
                    toast(`${r.applied}개 키를 환승했어요.`, "success");
                }}
            />
        </div>
    );
}

function AdvancedList({
    title,
    items,
    placeholder,
    onChange
}: {
    title: string;
    items: string[];
    placeholder: string;
    onChange: (items: string[]) => void;
}) {
    return (
        <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
                <Label>{title}</Label>
                <Button size="sm" variant="ghost" onClick={() => onChange([...items, ""])}>
                    <Icon name="add" className="text-[14px]" /> 추가
                </Button>
            </div>
            <div className="space-y-2">
                {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-[1fr_auto] gap-2">
                        <TextInput
                            value={item}
                            placeholder={placeholder}
                            onChange={e => {
                                const next = items.slice();
                                next[i] = e.target.value;
                                onChange(next);
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                            className="h-10 w-10 grid place-items-center rounded text-on-surface-variant hover:text-error hover:bg-error/10"
                            aria-label={`${title} 삭제`}
                        >
                            <Icon name="delete" className="text-[16px]" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function KeyValueList({
    title,
    items,
    keyPlaceholder,
    valuePlaceholder,
    onChange
}: {
    title: string;
    items: Array<{name: string; value: string}>;
    keyPlaceholder: string;
    valuePlaceholder: string;
    onChange: (items: Array<{name: string; value: string}>) => void;
}) {
    return (
        <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
                <Label>{title}</Label>
                <Button size="sm" variant="ghost" onClick={() => onChange([...items, {name: "", value: ""}])}>
                    <Icon name="add" className="text-[14px]" /> 추가
                </Button>
            </div>
            <div className="space-y-2">
                {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-[120px_1fr_auto] gap-2">
                        <TextInput
                            value={item.name}
                            placeholder={keyPlaceholder}
                            onChange={e => {
                                const next = items.slice();
                                next[i] = {...item, name: e.target.value};
                                onChange(next);
                            }}
                        />
                        <TextInput
                            value={item.value}
                            placeholder={valuePlaceholder}
                            onChange={e => {
                                const next = items.slice();
                                next[i] = {...item, value: e.target.value};
                                onChange(next);
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                            className="h-10 w-10 grid place-items-center rounded text-on-surface-variant hover:text-error hover:bg-error/10"
                            aria-label={`${title} 삭제`}
                        >
                            <Icon name="delete" className="text-[16px]" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FunctionList({
    items,
    onChange
}: {
    items: Array<{name: string; body: string}>;
    onChange: (items: Array<{name: string; body: string}>) => void;
}) {
    return (
        <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
                <Label>Functions</Label>
                <Button size="sm" variant="ghost" onClick={() => onChange([...items, {name: "", body: ""}])}>
                    <Icon name="add" className="text-[14px]" /> 추가
                </Button>
            </div>
            <div className="space-y-3">
                {items.map((item, i) => (
                    <div key={i} className="rounded-lg border border-white/[0.06] bg-surface-container-lowest p-3">
                        <div className="grid grid-cols-[1fr_auto] gap-2 mb-2">
                            <TextInput
                                value={item.name}
                                placeholder="mkcd"
                                onChange={e => {
                                    const next = items.slice();
                                    next[i] = {...item, name: e.target.value};
                                    onChange(next);
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                                className="h-10 w-10 grid place-items-center rounded text-on-surface-variant hover:text-error hover:bg-error/10"
                                aria-label="함수 삭제"
                            >
                                <Icon name="delete" className="text-[16px]" />
                            </button>
                        </div>
                        <textarea
                            value={item.body}
                            placeholder={'mkdir -p "$1"\ncd "$1"'}
                            onChange={e => {
                                const next = items.slice();
                                next[i] = {...item, body: e.target.value};
                                onChange(next);
                            }}
                            className="w-full min-h-[84px] rounded bg-surface-container-low border border-white/[0.06] px-3 py-2 font-mono text-[12px] text-on-surface outline-none focus:border-primary-fixed-dim/60"
                        />
                    </div>
                ))}
            </div>        </div>
    );
}
