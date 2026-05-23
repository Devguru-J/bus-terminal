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
import {cn} from "@/lib/utils";

export function ZshPage() {
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
                eyebrow="Platform 4 · ZSH-001"
                subtitle="프롬프트 · 히스토리 · 플러그인 · 별칭을 조합해 ~/.zshrc를 출발시킵니다."
                actions={
                    <>
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
                                <Label hint="HISTSIZE">메모리 보관 줄 수</Label>
                                <NumberInput
                                    value={config.histsize}
                                    onChange={e =>
                                        setField("histsize", Number(e.target.value) || 0)
                                    }
                                />
                            </div>
                            <div>
                                <Label hint="SAVEHIST">파일 보관 줄 수</Label>
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
                </div>

                <div className="space-y-5">
                    <ConfigPanel title="실시간 미리보기 · ~/.zshrc">
                        <pre className="rounded-lg bg-surface-container-lowest border border-white/[0.06] p-3 text-[11.5px] font-mono text-on-surface-variant max-h-[560px] overflow-auto whitespace-pre-wrap">
                            {exported}
                        </pre>
                    </ConfigPanel>
                </div>
            </div>
        </div>
    );
}
