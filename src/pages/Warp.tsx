import {useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {StationHeader} from "@/components/shell/StationHeader";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {ConfigPanel} from "@/components/platform/ConfigPanel";
import {
    Label,
    NumberInput,
    Segmented,
    Select,
    RangeInput,
    TextInput
} from "@/components/ui/Field";
import {ToggleRow} from "@/components/ui/ToggleRow";
import {Badge} from "@/components/ui/Badge";
import {WARP_FONT_FAMILIES, type WarpTerminalColors} from "@/data/warp";
import {useWarpStore} from "@/stores/warpStore";
import {useRoutesStore} from "@/stores/routesStore";
import {toast} from "@/stores/toastStore";
import {useState} from "react";
import {ImportWizard} from "@/components/platform/ImportWizard";
import {importWarpTheme} from "@/lib/importers";
import {cn} from "@/lib/utils";

const COLOR_KEYS: Array<keyof WarpTerminalColors> = [
    "black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"
];

export function WarpPage() {
    const [importOpen, setImportOpen] = useState(false);
    const {
        config,
        setAppearance,
        setAi,
        setThemeField,
        setNormalColor,
        setBrightColor,
        setThemeName,
        addWorkflow,
        removeWorkflow,
        updateWorkflow,
        exportTheme
    } = useWarpStore();
    const save = useRoutesStore(s => s.save);
    const navigate = useNavigate();
    const themeYaml = useMemo(() => exportTheme(), [config, exportTheme]);

    function handleSave() {
        const name = window.prompt("차고에 보관할 노선 이름?", `${config.themeName} 세트`);
        if (!name) return;
        save({name, platform: "warp", text: themeYaml});
        toast(`"${name}" 노선이 차고에 보관되었어요.`, "success");
    }

    function handleAddWorkflow() {
        const name = window.prompt("워크플로우 이름", "Git pull rebase");
        if (!name) return;
        const command = window.prompt(
            "실행할 명령",
            "git pull --rebase origin {{branch}}"
        );
        if (!command) return;
        addWorkflow({
            id: crypto.randomUUID(),
            name,
            command,
            description: "",
            tags: ["git"],
            arguments: command.match(/{{(\w+)}}/g)
                ? Array.from(
                      command.matchAll(/{{(\w+)}}/g),
                      m => ({name: m[1], description: "", default: ""})
                  )
                : []
        });
        toast(`"${name}" 워크플로우를 추가했어요.`, "success");
    }

    return (
        <div className="max-w-7xl mx-auto">
            <StationHeader
                title="Warp 승강장"
                eyebrow="Platform 2 Active"
                subtitle="AI 내장 차세대 터미널. 테마 / 워크플로우 / AI 설정을 한 번에 정리해 출발 준비."
                actions={
                    <>
                        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} title="기존 설정 파일을 가져와서 적용">
                            <Icon name="sync_alt" className="text-[16px]" /> 환승하기
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleSave} title="현재 설정을 내 노선으로 저장">
                            <Icon name="bookmark_add" className="text-[16px]" /> 차고 보관
                        </Button>
                        <Button size="sm" onClick={() => navigate("/export")} title="설정 파일 다운로드 화면으로 이동">
                            <Icon name="rocket_launch" className="text-[16px]" /> 출발권 만들기
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
                <div className="space-y-5 min-w-0">
                    <ConfigPanel
                        title="Theme"
                        actions={
                            <span className="font-mono text-[10px] text-on-surface-variant/60">
                                ~/.warp/themes/*.yaml
                            </span>
                        }
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <Label hint="name" help="Warp Settings에서 노출될 테마 이름">
                                    Theme Name
                                </Label>
                                <TextInput
                                    value={config.themeName}
                                    onChange={e => setThemeName(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label hint="details" help="패널/탭 등 세부 영역 톤">
                                    Details Tone
                                </Label>
                                <Segmented
                                    value={config.theme.details}
                                    onChange={v => setThemeField("details", v)}
                                    options={[
                                        {value: "darker", label: "Darker"},
                                        {value: "lighter", label: "Lighter"}
                                    ]}
                                />
                            </div>
                            <div>
                                <Label hint="accent" help="버튼/링크/하이라이트 강조색">
                                    Accent
                                </Label>
                                <input
                                    type="color"
                                    value={config.theme.accent}
                                    onChange={e =>
                                        setThemeField("accent", e.target.value)
                                    }
                                    className="h-10 w-full rounded border border-white/10 bg-transparent cursor-pointer"
                                />
                            </div>
                            <div>
                                <Label hint="background" help="기본 배경">
                                    Background
                                </Label>
                                <input
                                    type="color"
                                    value={config.theme.background}
                                    onChange={e =>
                                        setThemeField("background", e.target.value)
                                    }
                                    className="h-10 w-full rounded border border-white/10 bg-transparent cursor-pointer"
                                />
                            </div>
                            <div>
                                <Label hint="foreground" help="기본 글자색">
                                    Foreground
                                </Label>
                                <input
                                    type="color"
                                    value={config.theme.foreground}
                                    onChange={e =>
                                        setThemeField("foreground", e.target.value)
                                    }
                                    className="h-10 w-full rounded border border-white/10 bg-transparent cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <Label hint="normal" help="기본 8색 (0-7)">
                                    Terminal Normal
                                </Label>
                                <div className="grid grid-cols-8 gap-1.5">
                                    {COLOR_KEYS.map(k => (
                                        <label key={k} className="flex flex-col items-center gap-1 text-[10px] text-on-surface-variant">
                                            <input
                                                type="color"
                                                value={config.theme.normal[k]}
                                                onChange={e => setNormalColor(k, e.target.value)}
                                                className="h-8 w-full rounded border border-white/10 bg-transparent cursor-pointer"
                                                aria-label={`normal ${k}`}
                                            />
                                            <span className="font-mono">{k.slice(0, 3)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label hint="bright" help="bright 8색 (8-15)">
                                    Terminal Bright
                                </Label>
                                <div className="grid grid-cols-8 gap-1.5">
                                    {COLOR_KEYS.map(k => (
                                        <label key={k} className="flex flex-col items-center gap-1 text-[10px] text-on-surface-variant">
                                            <input
                                                type="color"
                                                value={config.theme.bright[k]}
                                                onChange={e => setBrightColor(k, e.target.value)}
                                                className="h-8 w-full rounded border border-white/10 bg-transparent cursor-pointer"
                                                aria-label={`bright ${k}`}
                                            />
                                            <span className="font-mono">{k.slice(0, 3)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ConfigPanel>

                    <ConfigPanel
                        title="Appearance"
                        actions={
                            <span className="font-mono text-[10px] text-on-surface-variant/60">
                                Settings › Appearance
                            </span>
                        }
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <Label hint="font" help="Hack / JetBrains Mono 권장">
                                    Font Family
                                </Label>
                                <Select
                                    value={config.appearance.fontFamily}
                                    onChange={e =>
                                        setAppearance("fontFamily", e.target.value)
                                    }
                                >
                                    {WARP_FONT_FAMILIES.map(f => (
                                        <option key={f} value={f}>
                                            {f}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Label hint="size" help="폰트 크기 (pt)">
                                    Font Size
                                </Label>
                                <NumberInput
                                    value={config.appearance.fontSize}
                                    min={8}
                                    max={32}
                                    onChange={e =>
                                        setAppearance("fontSize", Number(e.target.value) || 13)
                                    }
                                />
                            </div>
                            <div>
                                <Label hint="cursor-shape" help="커서 모양">
                                    Cursor Shape
                                </Label>
                                <Segmented
                                    value={config.appearance.cursorShape}
                                    onChange={v => setAppearance("cursorShape", v)}
                                    options={[
                                        {value: "block", label: "Block"},
                                        {value: "bar", label: "Bar"},
                                        {value: "underline", label: "Under"}
                                    ]}
                                />
                            </div>
                            <div>
                                <Label hint="opacity" help="배경 투명도 (0=완전 투명, 100=불투명)">
                                    Window Opacity
                                </Label>
                                <RangeInput
                                    value={config.appearance.windowOpacity}
                                    min={20}
                                    max={100}
                                    step={1}
                                    onChange={v => setAppearance("windowOpacity", v)}
                                />
                            </div>
                            <div>
                                <Label hint="input-type" help="입력 영역 스타일">
                                    Input Type
                                </Label>
                                <Segmented
                                    value={config.appearance.inputType}
                                    onChange={v => setAppearance("inputType", v)}
                                    options={[
                                        {value: "modern", label: "Modern"},
                                        {value: "classic", label: "Classic"}
                                    ]}
                                />
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <ToggleRow
                                title="cursor blink"
                                description="커서 깜빡임"
                                checked={config.appearance.cursorBlinking}
                                onChange={v => setAppearance("cursorBlinking", v)}
                            />
                            <ToggleRow
                                title="window blur"
                                description="배경 블러 (투명일 때)"
                                checked={config.appearance.windowBlur}
                                onChange={v => setAppearance("windowBlur", v)}
                            />
                            <ToggleRow
                                title="status bar"
                                description="하단 상태바"
                                checked={config.appearance.showStatusBar}
                                onChange={v => setAppearance("showStatusBar", v)}
                            />
                            <ToggleRow
                                title="block breadcrumbs"
                                description="명령 블록 경로 표시"
                                checked={config.appearance.blockBreadcrumbs}
                                onChange={v => setAppearance("blockBreadcrumbs", v)}
                            />
                            <ToggleRow
                                title="ligatures"
                                description="폰트 ligature 활성화"
                                checked={config.appearance.enable_ligatures}
                                onChange={v => setAppearance("enable_ligatures", v)}
                            />
                            <ToggleRow
                                title="pane dim"
                                description="비활성 pane 어둡게"
                                checked={config.appearance.pane_dim}
                                onChange={v => setAppearance("pane_dim", v)}
                            />
                        </div>
                    </ConfigPanel>

                    <ConfigPanel
                        title="Warp AI"
                        actions={
                            <Badge tone={config.ai.enabled ? "active" : "muted"}>
                                {config.ai.enabled ? "ON" : "OFF"}
                            </Badge>
                        }
                    >
                        <ToggleRow
                            title="AI 기능 사용"
                            description="자연어 → 명령, 자동완성, 에러 진단"
                            checked={config.ai.enabled}
                            onChange={v => setAi("enabled", v)}
                        />
                        {config.ai.enabled && (
                            <>
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <ToggleRow
                                        title="자동완성"
                                        description="AI 자동완성 제안"
                                        checked={config.ai.autosuggestions}
                                        onChange={v => setAi("autosuggestions", v)}
                                    />
                                    <ToggleRow
                                        title="자연어 입력 (#)"
                                        description="# 으로 시작하면 자연어 → 명령"
                                        checked={config.ai.naturalLanguageEnabled}
                                        onChange={v =>
                                            setAi("naturalLanguageEnabled", v)
                                        }
                                    />
                                    <ToggleRow
                                        title="Agent Mode"
                                        description="여러 명령을 알아서 실행"
                                        checked={config.ai.agentMode}
                                        onChange={v => setAi("agentMode", v)}
                                    />
                                </div>
                                <div className="mt-4">
                                    <Label
                                        hint="history-context"
                                        help="AI가 참고할 직전 명령 개수"
                                    >
                                        History Context
                                    </Label>
                                    <RangeInput
                                        value={config.ai.historyContext}
                                        min={0}
                                        max={100}
                                        step={1}
                                        onChange={v => setAi("historyContext", v)}
                                    />
                                </div>
                            </>
                        )}
                    </ConfigPanel>

                    <ConfigPanel
                        title="Workflows"
                        actions={<Badge tone="info">{config.workflows.length}</Badge>}
                    >
                        <div className="space-y-2">
                            {config.workflows.length === 0 && (
                                <p className="text-[12px] text-on-surface-variant">
                                    자주 쓰는 명령을 워크플로우로 저장하면 단축키나 검색으로
                                    바로 실행할 수 있습니다.
                                </p>
                            )}
                            {config.workflows.map(w => (
                                <div
                                    key={w.id}
                                    className="rounded-lg border border-white/[0.06] bg-surface-container-lowest p-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <TextInput
                                                value={w.name}
                                                onChange={e =>
                                                    updateWorkflow(w.id, {
                                                        name: e.target.value
                                                    })
                                                }
                                                aria-label="워크플로우 이름"
                                            />
                                            <textarea
                                                value={w.command}
                                                onChange={e =>
                                                    updateWorkflow(w.id, {
                                                        command: e.target.value
                                                    })
                                                }
                                                rows={Math.max(2, w.command.split("\n").length)}
                                                className="mt-2 w-full rounded border border-white/[0.08] bg-surface-container-lowest/60 px-3 py-2 font-mono text-[12px] text-on-surface focus:border-primary-fixed-dim focus:outline-none"
                                                placeholder="명령. {{arg}} 형식으로 인자 표시"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeWorkflow(w.id)}
                                            className="text-on-surface-variant hover:text-error"
                                            aria-label="삭제"
                                        >
                                            <Icon name="delete" className="text-[16px]" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddWorkflow}
                                className="w-full rounded-lg border border-dashed border-white/15 px-3 py-3 font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant hover:text-on-surface hover:border-white/30 transition inline-flex items-center justify-center gap-2"
                            >
                                <Icon name="add" className="text-[16px]" /> Add Workflow
                            </button>
                        </div>
                    </ConfigPanel>
                </div>

                <div className="space-y-5">
                    <ConfigPanel
                        title="실시간 미리보기"
                        actions={<Badge tone="info">warp</Badge>}
                    >
                        <WarpPreview />
                    </ConfigPanel>
                </div>
            </div>


            <ImportWizard
                open={importOpen}
                onClose={() => setImportOpen(false)}
                title="Warp 테마 환승하기"
                accept=".yaml,.yml,.txt"
                placeholder="~/.warp/themes/<name>.yaml 내용을 붙여넣어 주세요."
                hint="Warp 테마 YAML의 name / accent / background / foreground / details / terminal_colors를 흡수합니다."
                parse={importWarpTheme}
                onApply={(r) => {
                    if (r.value.themeName) setThemeName(r.value.themeName);
                    if (r.value.theme) {
                        if (r.value.theme.accent) setThemeField("accent", r.value.theme.accent);
                        if (r.value.theme.background) setThemeField("background", r.value.theme.background);
                        if (r.value.theme.foreground) setThemeField("foreground", r.value.theme.foreground);
                        if (r.value.theme.details) setThemeField("details", r.value.theme.details);
                        if (r.value.theme.normal) {
                            for (const [k, v] of Object.entries(r.value.theme.normal)) {
                                if (v) setNormalColor(k as never, v);
                            }
                        }
                        if (r.value.theme.bright) {
                            for (const [k, v] of Object.entries(r.value.theme.bright)) {
                                if (v) setBrightColor(k as never, v);
                            }
                        }
                    }
                    toast(`${r.applied}개 키를 환승했어요.`, "success");
                }}
            />
        </div>
    );
}

function WarpPreview() {
    const c = useWarpStore(s => s.config);
    const opacity = c.appearance.windowOpacity / 100;
    return (
        <div
            className="rounded-lg overflow-hidden border border-white/[0.08]"
            style={{background: c.theme.background, opacity}}
        >
            <div
                className="px-3 py-2 border-b flex items-center gap-2"
                style={{
                    background:
                        c.theme.details === "darker"
                            ? shade(c.theme.background, -10)
                            : shade(c.theme.background, 10),
                    borderColor: shade(c.theme.background, c.theme.details === "darker" ? -20 : 20)
                }}
            >
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                <span
                    className="ml-3 text-[11px] truncate"
                    style={{color: c.theme.foreground}}
                >
                    Warp · {c.themeName}
                </span>
            </div>
            <div
                className="p-3 font-mono text-[12px] leading-relaxed"
                style={{color: c.theme.foreground, fontFamily: c.appearance.fontFamily}}
            >
                <div className="flex items-center gap-2">
                    <span style={{color: c.theme.accent}}>›</span>
                    <span>git status</span>
                </div>
                <div className="mt-1 pl-4" style={{color: c.theme.normal.cyan}}>
                    On branch <span style={{color: c.theme.bright.magenta}}>main</span>
                </div>
                <div className="pl-4" style={{color: c.theme.normal.green}}>
                    nothing to commit, working tree clean
                </div>
                <div className="flex items-center gap-2 mt-3">
                    <span style={{color: c.theme.accent}}>›</span>
                    <span>{c.ai.enabled && c.ai.naturalLanguageEnabled ? "# 마지막 커밋 보여줘" : "git log -1"}</span>
                    <span
                        className={cn(
                            "inline-block ml-1",
                            c.appearance.cursorBlinking && "animate-pulse",
                            c.appearance.cursorShape === "block" && "w-2 h-3.5",
                            c.appearance.cursorShape === "bar" && "w-[2px] h-3.5",
                            c.appearance.cursorShape === "underline" && "w-2 h-[2px] translate-y-3"
                        )}
                        style={{background: c.theme.accent}}
                    />
                </div>
            </div>
            {c.appearance.showStatusBar && (
                <div
                    className="px-3 py-1.5 border-t text-[10px] flex justify-between"
                    style={{
                        borderColor: shade(c.theme.background, -20),
                        color: c.theme.foreground
                    }}
                >
                    <span>main · {c.appearance.fontFamily}</span>
                    <span>
                        {c.ai.enabled ? "AI ON" : "AI OFF"} · {c.workflows.length} workflows
                    </span>
                </div>
            )}        </div>
    );
}

function shade(hex: string, percent: number): string {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    const adjust = (v: number) =>
        Math.max(0, Math.min(255, Math.round(v + (255 * percent) / 100)));
    return `#${[adjust(r), adjust(g), adjust(b)]
        .map(v => v.toString(16).padStart(2, "0"))
        .join("")}`;
}
