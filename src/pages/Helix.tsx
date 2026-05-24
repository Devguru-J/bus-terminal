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
    Select
} from "@/components/ui/Field";
import {ToggleRow} from "@/components/ui/ToggleRow";
import {Badge} from "@/components/ui/Badge";
import {
    HELIX_THEMES,
    HELIX_LINE_NUMBER,
    HELIX_CURSOR_SHAPE,
    HELIX_BUFFERLINE,
    helixLanguageServers,
    type HelixKeymap
} from "@/data/helix";
import {useHelixStore} from "@/stores/helixStore";
import {useRoutesStore} from "@/stores/routesStore";
import {toast, toastWithUndo} from "@/stores/toastStore";
import {ImportWizard} from "@/components/platform/ImportWizard";
import {importHelixToml} from "@/lib/importers";
import {cn} from "@/lib/utils";

export function HelixPage() {
    const [importOpen, setImportOpen] = useState(false);
    const {config, setField, toggleLanguageServer, addKeymap, removeKeymap, exportText} =
        useHelixStore();
    const save = useRoutesStore(s => s.save);
    const navigate = useNavigate();
    const [serverQuery, setServerQuery] = useState("");
    const exported = useMemo(() => exportText(), [config, exportText]);

    function handleSave() {
        const name = window.prompt("차고에 보관할 노선 이름?", "내 Helix 노선");
        if (!name) return;
        save({name, platform: "helix", text: exported});
        toast(`"${name}" 노선이 차고에 보관되었어요.`, "success");
    }

    function addCustomKeymap() {
        const mode = window.prompt("모드 (normal / insert / select)", "normal");
        if (!mode || !["normal", "insert", "select"].includes(mode)) return;
        const lhs = window.prompt("키 (예: C-s)", "C-s");
        if (!lhs?.trim()) return;
        const rhs = window.prompt("동작 (예: :w)", ":w");
        if (!rhs?.trim()) return;
        const desc = window.prompt("설명", "Save") ?? "";
        addKeymap({mode: mode as HelixKeymap["mode"], lhs: lhs.trim(), rhs: rhs.trim(), desc});
        toast(`${lhs} 키매핑을 추가했어요.`, "success");
    }

    const filteredServers = useMemo(() => {
        const q = serverQuery.trim().toLowerCase();
        if (!q) return helixLanguageServers;
        return helixLanguageServers.filter(s =>
            `${s.ko} ${s.language} ${s.server} ${s.desc}`.toLowerCase().includes(q)
        );
    }, [serverQuery]);

    return (
        <div className="max-w-7xl mx-auto">
            <StationHeader
                title="Helix 승강장"
                eyebrow="Platform 5 Active"
                subtitle="Rust로 만들어진 모달 에디터. config.toml + languages.toml 두 벌이 출발권에 함께 실립니다."
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
                        title="Theme & Editor"
                        actions={
                            <span className="font-mono text-[10px] text-on-surface-variant/60">
                                config.toml
                            </span>
                        }
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <Label
                                    hint="theme"
                                    help="Helix가 사용할 컬러스킴입니다. :theme 명령으로도 바꿀 수 있습니다."
                                >
                                    Theme
                                </Label>
                                <Select
                                    value={config.theme}
                                    onChange={e =>
                                        setField(
                                            "theme",
                                            e.target.value as (typeof HELIX_THEMES)[number]
                                        )
                                    }
                                >
                                    {HELIX_THEMES.map(t => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Label
                                    hint="line-number"
                                    help="줄번호 표시 방식. relative는 현재 줄을 0 기준으로 위/아래 거리 표시."
                                >
                                    Line Number
                                </Label>
                                <Segmented
                                    value={config.lineNumber}
                                    onChange={v => setField("lineNumber", v)}
                                    options={HELIX_LINE_NUMBER.map(v => ({
                                        value: v,
                                        label: v
                                    }))}
                                />
                            </div>
                            <div>
                                <Label
                                    hint="scrolloff"
                                    help="커서 위/아래로 최소 몇 줄을 항상 보이게 유지할지."
                                >
                                    Scrolloff
                                </Label>
                                <NumberInput
                                    value={config.scrolloff}
                                    min={0}
                                    max={50}
                                    onChange={e =>
                                        setField("scrolloff", Number(e.target.value) || 0)
                                    }
                                />
                            </div>
                            <div>
                                <Label
                                    hint="bufferline"
                                    help="상단에 열린 버퍼 탭을 보여줄지. multiple은 2개 이상일 때만."
                                >
                                    Bufferline
                                </Label>
                                <Select
                                    value={config.bufferline}
                                    onChange={e =>
                                        setField(
                                            "bufferline",
                                            e.target
                                                .value as (typeof HELIX_BUFFERLINE)[number]
                                        )
                                    }
                                >
                                    {HELIX_BUFFERLINE.map(v => (
                                        <option key={v} value={v}>
                                            {v}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Label
                                    hint="idle-timeout"
                                    help="자동완성 팝업, diagnostic 같은 게 뜨기까지 기다리는 시간(ms)."
                                >
                                    Idle Timeout (ms)
                                </Label>
                                <NumberInput
                                    value={config.idleTimeoutMs}
                                    min={0}
                                    max={2000}
                                    onChange={e =>
                                        setField("idleTimeoutMs", Number(e.target.value) || 0)
                                    }
                                />
                            </div>
                            <div>
                                <Label
                                    hint="completion-trigger-len"
                                    help="자동완성이 뜨기 위한 최소 입력 글자 수."
                                >
                                    Completion Trigger
                                </Label>
                                <NumberInput
                                    value={config.completionTrigger}
                                    min={1}
                                    max={10}
                                    onChange={e =>
                                        setField(
                                            "completionTrigger",
                                            Number(e.target.value) || 1
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <ToggleRow
                                title="cursorline"
                                description="현재 줄 강조"
                                checked={config.cursorline}
                                onChange={v => setField("cursorline", v)}
                            />
                            <ToggleRow
                                title="auto-format"
                                description="저장 시 자동 포맷팅"
                                checked={config.autoFormat}
                                onChange={v => setField("autoFormat", v)}
                            />
                            <ToggleRow
                                title="auto-save"
                                description="포커스를 잃을 때 자동 저장"
                                checked={config.autoSave}
                                onChange={v => setField("autoSave", v)}
                            />
                            <ToggleRow
                                title="auto-completion"
                                description="자동완성 팝업"
                                checked={config.autoCompletion}
                                onChange={v => setField("autoCompletion", v)}
                            />
                            <ToggleRow
                                title="mouse"
                                description="마우스로 커서/선택 이동"
                                checked={config.mouse}
                                onChange={v => setField("mouse", v)}
                            />
                            <ToggleRow
                                title="true-color"
                                description="24-bit 트루컬러 (대부분 ON 권장)"
                                checked={config.trueColor}
                                onChange={v => setField("trueColor", v)}
                            />
                        </div>
                    </ConfigPanel>

                    <ConfigPanel title="Cursor Shape">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {(["cursorNormal", "cursorInsert", "cursorSelect"] as const).map(
                                k => (
                                    <div key={k}>
                                        <Label
                                            hint={k.replace("cursor", "").toLowerCase()}
                                            help={`${k.replace("cursor", "")} 모드에서 사용할 커서 모양`}
                                        >
                                            {k.replace("cursor", "")} mode
                                        </Label>
                                        <Segmented
                                            value={config[k]}
                                            onChange={v => setField(k, v)}
                                            options={HELIX_CURSOR_SHAPE.map(v => ({
                                                value: v,
                                                label: v
                                            }))}
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </ConfigPanel>

                    <ConfigPanel
                        title="Indent Guides & Statusline"
                        actions={<Badge tone="info">visual</Badge>}
                    >
                        <ToggleRow
                            title="indent-guides"
                            description={`들여쓰기 가이드 라인 (${config.indentGuideCharacter})`}
                            checked={config.indentGuides}
                            onChange={v => setField("indentGuides", v)}
                        />
                        {config.indentGuides && (
                            <div className="mt-3">
                                <Label hint="character" help="가이드 라인 문자">
                                    Guide Character
                                </Label>
                                <TextInput
                                    value={config.indentGuideCharacter}
                                    onChange={e =>
                                        setField("indentGuideCharacter", e.target.value || "│")
                                    }
                                />
                            </div>
                        )}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {(["statuslineLeft", "statuslineCenter", "statuslineRight"] as const).map(
                                key => (
                                    <div key={key}>
                                        <Label
                                            hint={key
                                                .replace("statusline", "")
                                                .toLowerCase()}
                                            help="콤마로 구분된 statusline 세그먼트 (mode, file-name, position 등)"
                                        >
                                            {key.replace("statusline", "")}
                                        </Label>
                                        <TextInput
                                            value={config[key].join(", ")}
                                            onChange={e =>
                                                setField(
                                                    key,
                                                    e.target.value
                                                        .split(",")
                                                        .map(x => x.trim())
                                                        .filter(Boolean)
                                                )
                                            }
                                            placeholder="mode, file-name"
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </ConfigPanel>

                    <ConfigPanel
                        title="LSP / File Picker"
                        actions={<Badge tone="active">{config.languageServers.length} LSP</Badge>}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <ToggleRow
                                title="enable"
                                description="LSP 켜기"
                                checked={config.lspEnable}
                                onChange={v => setField("lspEnable", v)}
                            />
                            <ToggleRow
                                title="display-messages"
                                description="LSP 메시지 표시"
                                checked={config.lspDisplayMessages}
                                onChange={v => setField("lspDisplayMessages", v)}
                            />
                            <ToggleRow
                                title="inlay-hints"
                                description="타입 힌트 inline 표시"
                                checked={config.lspDisplayInlayHints}
                                onChange={v => setField("lspDisplayInlayHints", v)}
                            />
                            <ToggleRow
                                title="signature-help"
                                description="호출 시 시그니처 자동"
                                checked={config.lspAutoSignatureHelp}
                                onChange={v => setField("lspAutoSignatureHelp", v)}
                            />
                            <ToggleRow
                                title="file-picker hidden"
                                description="숨김 파일 보이기"
                                checked={config.filePickerHidden}
                                onChange={v => setField("filePickerHidden", v)}
                            />
                            <ToggleRow
                                title=".gitignore 적용"
                                description="git-ignore 파일 숨기기"
                                checked={config.filePickerGitIgnore}
                                onChange={v => setField("filePickerGitIgnore", v)}
                            />
                        </div>

                        <div className="mt-5">
                            <Label
                                hint="language-servers"
                                help="언어별로 사용할 LSP. languages.toml에 자동 작성됩니다."
                            >
                                Language Servers
                            </Label>
                            <TextInput
                                value={serverQuery}
                                onChange={e => setServerQuery(e.target.value)}
                                placeholder="언어 검색"
                                className="mb-3"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {filteredServers.map(p => {
                                    const on = config.languageServers.includes(p.id);
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => toggleLanguageServer(p.id)}
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
                                            <p className="text-[10px] font-mono text-on-surface-variant/60 mt-1">
                                                {p.server}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </ConfigPanel>
                </div>

                <div className="space-y-5">
                    <ConfigPanel
                        title="실시간 미리보기"
                        actions={<Badge tone="info">helix</Badge>}
                    >
                        <HelixPreview />
                    </ConfigPanel>

                    <ConfigPanel
                        title="Key Mappings"
                        actions={<Badge tone="muted">{config.keymaps.length}</Badge>}
                    >
                        <div className="space-y-2">
                            {config.keymaps.length === 0 && (
                                <p className="text-[12px] text-on-surface-variant">
                                    Helix 기본 모달 키매핑을 그대로 쓰는 게 가장 좋습니다.
                                    필요할 때만 추가하세요.
                                </p>
                            )}
                            {config.keymaps.map(k => (
                                <div
                                    key={`${k.mode}-${k.lhs}`}
                                    className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-surface-container-lowest px-3 py-2"
                                >
                                    <div className="min-w-0">
                                        <div className="font-mono text-code-sm text-on-surface truncate">
                                            <span className="text-on-surface-variant/70 mr-2">
                                                [{k.mode}]
                                            </span>
                                            {k.lhs} → {k.rhs}
                                        </div>
                                        <div className="text-[10px] text-on-surface-variant/70">
                                            {k.desc}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeKeymap(k.mode, k.lhs)}
                                        className="text-on-surface-variant hover:text-error"
                                        aria-label="삭제"
                                    >
                                        <Icon name="close" className="text-[14px]" />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addCustomKeymap}
                                className="w-full rounded-lg border border-dashed border-white/15 px-3 py-3 font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant hover:text-on-surface hover:border-white/30 transition inline-flex items-center justify-center gap-2"
                            >
                                <Icon name="add" className="text-[16px]" /> Add Keymap
                            </button>
                        </div>
                    </ConfigPanel>
                </div>
            </div>


            <ImportWizard
                open={importOpen}
                onClose={() => setImportOpen(false)}
                title="Helix 설정 환승하기"
                accept=".toml,.txt"
                placeholder="~/.config/helix/config.toml 내용을 붙여넣어 주세요."
                hint="[editor] / [editor.cursor-shape] / [editor.lsp] / [editor.statusline] 섹션을 흡수합니다."
                parse={importHelixToml}
                onApply={(r) => {
                    const before = {...useHelixStore.getState().config};
                    for (const [k, v] of Object.entries(r.value)) {
                        setField(k as never, v as never);
                    }
                    toastWithUndo(
                        `${r.applied}개 키를 환승했어요.`,
                        () => useHelixStore.setState({config: before as never})
                    );
                }}
            />
        </div>
    );
}

function HelixPreview() {
    const c = useHelixStore(s => s.config);
    return (
        <div className="rounded-lg overflow-hidden border border-white/[0.06] bg-[#1e2030] text-[12px] font-mono">
            <div className="px-3 py-2 border-b border-white/[0.06] flex items-center gap-2 text-[11px] text-on-surface-variant">
                <span className="px-2 py-0.5 rounded bg-primary-fixed-dim/15 text-primary-fixed-dim font-bold">
                    NOR
                </span>
                <span>helix.tsx</span>
                <span className="text-on-surface-variant/50">·</span>
                <span>{c.theme}</span>
                <span className="ml-auto text-on-surface-variant/50">
                    {c.lineNumber}
                </span>
            </div>
            <pre className="p-3 text-on-surface leading-relaxed">
                <span className="text-on-surface-variant/50">
                    {c.lineNumber === "relative" ? "  3 " : " 12 "}
                </span>
                <span className="text-[#9ece6a]">fn</span>{" "}
                <span className="text-[#7aa2f7]">main</span>() {"{"}
                {"\n"}
                <span className="text-on-surface-variant/50">
                    {c.lineNumber === "relative" ? "  2 " : " 13 "}
                </span>
                {"    "}
                <span className="text-[#bb9af7]">let</span>{" "}
                <span className="text-on-surface">msg</span> ={" "}
                <span className="text-[#e0af68]">"내 개발환경으로 출발"</span>;{"\n"}
                <span className="text-on-surface-variant/50">
                    {c.lineNumber === "relative" ? "  1 " : " 14 "}
                </span>
                {"    "}
                <span className="text-[#7aa2f7]">println!</span>(
                <span className="text-[#e0af68]">"{"{}"}",</span> msg);{"\n"}
                <span
                    className={cn(
                        "text-primary-fixed-dim",
                        c.cursorline && "bg-primary-fixed-dim/[0.08]"
                    )}
                >
                    <span className="text-primary-fixed-dim">
                        {c.lineNumber === "relative" ? "  0 " : " 15 "}
                    </span>
                    {"}"}
                    <span
                        className={cn(
                            "ml-1 inline-block",
                            c.cursorNormal === "block" && "w-2 h-3.5 bg-primary-fixed-dim",
                            c.cursorNormal === "bar" && "w-[2px] h-3.5 bg-primary-fixed-dim",
                            c.cursorNormal === "underline" &&
                                "w-2 h-[2px] bg-primary-fixed-dim translate-y-3"
                        )}
                    />
                </span>
            </pre>
            <div className="px-3 py-1.5 border-t border-white/[0.06] flex justify-between text-[10px] text-on-surface-variant">
                <span>{c.statuslineLeft.slice(0, 3).join(" · ")}</span>
                <span>{c.statuslineRight.slice(0, 3).join(" · ")}</span>
            </div>        </div>
    );
}
