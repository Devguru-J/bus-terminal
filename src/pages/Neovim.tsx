import {useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {StationHeader} from "@/components/shell/StationHeader";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {Label, Select, RangeInput, TextInput} from "@/components/ui/Field";
import {ToggleRow} from "@/components/ui/ToggleRow";
import {ConfigPanel} from "@/components/platform/ConfigPanel";
import {Badge, StatusDot} from "@/components/ui/Badge";
import {
    nvimPlugins,
    NVIM_COLORSCHEMES,
    NVIM_STATUSLINES
} from "@/data/neovim";
import {useNeovimStore} from "@/stores/neovimStore";
import {useRoutesStore} from "@/stores/routesStore";
import {toast, toastWithUndo} from "@/stores/toastStore";
import {ImportWizard} from "@/components/platform/ImportWizard";
import {importNvimInit} from "@/lib/importers";
import {cn} from "@/lib/utils";

const LSP_SERVERS = ["ts_ls", "eslint", "lua_ls", "pyright", "rust_analyzer", "gopls", "jsonls", "cssls", "html"];

export function NeovimPage() {
    const [importOpen, setImportOpen] = useState(false);
    const {config, setField, togglePlugin, addKeymap, removeKeymap, exportText, reset} =
        useNeovimStore();
    const save = useRoutesStore(s => s.save);
    const navigate = useNavigate();
    const [newKey, setNewKey] = useState({lhs: "", rhs: "", desc: ""});

    const exported = useMemo(() => exportText(), [config, exportText]);

    function handleBoard() {
        const name = window.prompt("차고에 보관할 노선 이름?", "내 Neovim 노선");
        if (!name) return;
        save({name, platform: "neovim", text: exported});
        toast(`"${name}" 노선이 차고에 보관되었어요.`, "success");
        navigate("/export");
    }

    return (
        <div className="max-w-7xl mx-auto">
            <StationHeader
                title={
                    <span className="inline-flex items-center gap-3">
                        Neovim 승강장
                        <StatusDot />
                    </span>
                }
                eyebrow="Platform 4 · NVM-001"
                subtitle="Vim 기반의 확장형 에디터입니다. 테마, 플러그인, 키맵을 화면에서 고른 뒤 lazy.nvim 기반 init.lua 파일로 내보냅니다."
                actions={
                    <>
                        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} title="기존 설정 파일을 가져와서 적용">
                            <Icon name="sync_alt" className="text-[16px]" /> 환승하기
                        </Button>
                        <Button variant="ghost" size="sm" onClick={reset}>
                            <Icon name="restart_alt" className="text-[14px]" /> 초기화
                        </Button>
                        <Button size="md" onClick={handleBoard} title="현재 설정을 내 노선으로 저장">
                            <Icon name="check_circle" className="text-[16px]" /> 탑승 완료
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
                <div className="space-y-5 min-w-0">
                    {/* 기본 옵션 */}
                    <ConfigPanel title="기본 옵션">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <Label hint="g.mapleader" help="Neovim 커스텀 단축키의 기준 키입니다. Space나 \\ 를 많이 씁니다. 예: <leader>ff">Leader Key</Label>
                                <TextInput
                                    value={config.leaderKey === " " ? "Space" : config.leaderKey}
                                    onChange={e => {
                                        const v = e.target.value;
                                        setField("leaderKey", v === "Space" ? " " : v);
                                    }}
                                    placeholder="Space"
                                />
                            </div>
                            <div>
                                <Label hint="tabstop / shiftwidth" help="Tab 한 번을 몇 칸으로 볼지, 자동 들여쓰기를 몇 칸으로 할지 정합니다. 프로젝트 스타일과 맞추세요.">Tab Width</Label>
                                <RangeInput
                                    value={config.tabWidth}
                                    min={1}
                                    max={8}
                                    onChange={v => setField("tabWidth", v)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            <ToggleRow
                                title="줄 번호"
                                description="vim.opt.number = true"
                                checked={config.lineNumbers}
                                onChange={v => setField("lineNumbers", v)}
                            />
                            <ToggleRow
                                title="상대 줄 번호"
                                description="vim.opt.relativenumber = true"
                                checked={config.relativeNumbers}
                                onChange={v => setField("relativeNumbers", v)}
                            />
                            <ToggleRow
                                title="공백으로 들여쓰기"
                                description="expandtab = true (탭 → 스페이스)"
                                checked={config.expandTab}
                                onChange={v => setField("expandTab", v)}
                            />
                            <ToggleRow
                                title="마우스"
                                description='mouse = "a"'
                                checked={config.mouse}
                                onChange={v => setField("mouse", v)}
                            />
                        </div>
                    </ConfigPanel>

                    {/* UI */}
                    <ConfigPanel title="UI / 테마">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <Label hint="colorscheme" help="Neovim 전체 색상 테마입니다. 선택한 테마에 맞는 플러그인이 필요할 수 있습니다.">컬러스킴</Label>
                                <Select
                                    value={config.colorscheme}
                                    onChange={e =>
                                        setField(
                                            "colorscheme",
                                            e.target.value as (typeof NVIM_COLORSCHEMES)[number]
                                        )
                                    }
                                >
                                    {NVIM_COLORSCHEMES.map(c => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Label hint="statusline" help="에디터 하단에 현재 파일, 모드, Git 상태 등을 보여주는 줄입니다. lualine이 가장 흔합니다.">상태바</Label>
                                <Select
                                    value={config.statusline}
                                    onChange={e =>
                                        setField(
                                            "statusline",
                                            e.target.value as (typeof NVIM_STATUSLINES)[number]
                                        )
                                    }
                                >
                                    {NVIM_STATUSLINES.map(s => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <ToggleRow
                                title="투명 배경"
                                description="Normal/NormalFloat 배경을 none으로"
                                checked={config.transparent}
                                onChange={v => setField("transparent", v)}
                            />
                        </div>
                    </ConfigPanel>

                    {/* 플러그인 */}
                    <ConfigPanel
                        title="플러그인 (lazy.nvim)"
                        actions={
                            <Badge tone="active">{config.plugins.length} selected</Badge>
                        }
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {nvimPlugins.map(p => {
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
                                            <span
                                                className={cn(
                                                    "h-3 w-3 rounded-full border shrink-0",
                                                    on
                                                        ? "bg-primary-fixed-dim border-primary-fixed-dim"
                                                        : "border-white/30"
                                                )}
                                            />
                                        </div>
                                        <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-2">
                                            {p.desc}
                                        </p>
                                        <p className="text-[10px] text-on-surface-variant/50 mt-1 font-mono">
                                            {p.repo}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </ConfigPanel>

                    <ConfigPanel
                        title="Advanced / Editor & LSP"
                        actions={<Badge tone="warn">advanced</Badge>}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <Label hint="scrolloff" help="커서 위아래에 항상 남겨둘 최소 줄 수입니다. 값을 올리면 화면 끝에 커서가 붙지 않아 읽기 편합니다.">Scrolloff</Label>
                                <RangeInput
                                    value={config.scrolloff}
                                    min={0}
                                    max={20}
                                    onChange={v => setField("scrolloff", v)}
                                />
                            </div>
                            <div>
                                <Label hint="sidescrolloff" help="가로 스크롤 시 커서 좌우에 남겨둘 최소 칸 수입니다. 긴 줄을 볼 때 여유 공간을 만듭니다.">Side Scrolloff</Label>
                                <RangeInput
                                    value={config.sidescrolloff}
                                    min={0}
                                    max={20}
                                    onChange={v => setField("sidescrolloff", v)}
                                />
                            </div>
                            <div>
                                <Label hint="clipboard" help="Neovim 복사/붙여넣기를 시스템 클립보드와 연결할지 정합니다. unnamedplus는 OS 클립보드를 사용합니다.">Clipboard</Label>
                                <Select
                                    value={config.clipboard}
                                    onChange={e =>
                                        setField("clipboard", e.target.value as typeof config.clipboard)
                                    }
                                >
                                    <option value="default">default</option>
                                    <option value="unnamedplus">system clipboard</option>
                                </Select>
                            </div>
                            <div>
                                <Label hint="Mason ensure_installed" help="언어별 자동완성, 진단, go-to-definition을 제공하는 LSP 서버입니다. 선택하면 Mason 설치 목록에 들어갑니다.">LSP Servers</Label>
                                <Select
                                    value=""
                                    onChange={e => {
                                        const value = e.target.value;
                                        if (!value) return;
                                        setField(
                                            "lspServers",
                                            Array.from(new Set([...config.lspServers, value]))
                                        );
                                        if (!config.plugins.includes("mason")) togglePlugin("mason");
                                        if (!config.plugins.includes("mason-lspconfig")) {
                                            togglePlugin("mason-lspconfig");
                                        }
                                        if (!config.plugins.includes("lspconfig")) {
                                            togglePlugin("lspconfig");
                                        }
                                    }}
                                >
                                    <option value="">Add server...</option>
                                    {LSP_SERVERS.map(server => (
                                        <option key={server} value={server}>
                                            {server}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <ToggleRow
                                title="긴 줄 줄바꿈"
                                description="vim.opt.wrap"
                                checked={config.wrap}
                                onChange={v => setField("wrap", v)}
                            />
                            <ToggleRow
                                title="검색 대소문자 무시"
                                description="ignorecase"
                                checked={config.ignorecase}
                                onChange={v => setField("ignorecase", v)}
                            />
                            <ToggleRow
                                title="스마트 대소문자 검색"
                                description="smartcase"
                                checked={config.smartcase}
                                onChange={v => setField("smartcase", v)}
                            />
                            <ToggleRow
                                title="저장 시 포맷팅"
                                description="conform.nvim"
                                checked={config.formatOnSave}
                                onChange={v => {
                                    setField("formatOnSave", v);
                                    if (v && !config.plugins.includes("conform")) togglePlugin("conform");
                                }}
                            />
                        </div>
                        {config.lspServers.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {config.lspServers.map(server => (
                                    <button
                                        key={server}
                                        type="button"
                                        onClick={() =>
                                            setField(
                                                "lspServers",
                                                config.lspServers.filter(x => x !== server)
                                            )
                                        }
                                        className="inline-flex items-center gap-1 rounded border border-secondary-fixed-dim/30 bg-secondary-fixed-dim/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-secondary-fixed-dim"
                                    >
                                        {server}
                                        <Icon name="close" className="text-[13px]" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </ConfigPanel>

                    {/* 키 매핑 */}
                    <ConfigPanel title="키 매핑">
                        <div className="space-y-2">
                            {config.keymaps.map(k => (
                                <div
                                    key={k.lhs}
                                    className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-surface-container-lowest px-3 py-2.5"
                                >
                                    <span className="font-mono text-code-sm px-2 py-1 rounded bg-primary-fixed-dim/15 text-primary-fixed-dim border border-primary-fixed-dim/30 min-w-[80px] text-center">
                                        {k.lhs}
                                    </span>
                                    <Icon
                                        name="arrow_forward"
                                        className="text-[14px] text-on-surface-variant/50"
                                    />
                                    <span className="font-mono text-code-sm text-on-surface truncate flex-1">
                                        {k.rhs}
                                    </span>
                                    <span className="text-[11px] text-on-surface-variant truncate max-w-[140px]">
                                        {k.desc}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeKeymap(k.lhs)}
                                        className="text-on-surface-variant hover:text-error p-1"
                                        aria-label="삭제"
                                    >
                                        <Icon name="close" className="text-[14px]" />
                                    </button>
                                </div>
                            ))}
                            <div className="grid grid-cols-[100px_1fr_140px_auto] gap-2">
                                <TextInput
                                    placeholder="<leader>x"
                                    value={newKey.lhs}
                                    onChange={e =>
                                        setNewKey(s => ({...s, lhs: e.target.value}))
                                    }
                                />
                                <TextInput
                                    placeholder=":Telescope ..."
                                    value={newKey.rhs}
                                    onChange={e =>
                                        setNewKey(s => ({...s, rhs: e.target.value}))
                                    }
                                />
                                <TextInput
                                    placeholder="설명"
                                    value={newKey.desc}
                                    onChange={e =>
                                        setNewKey(s => ({...s, desc: e.target.value}))
                                    }
                                />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        if (!newKey.lhs || !newKey.rhs) {
                                            toast("lhs/rhs를 입력해주세요.", "warn");
                                            return;
                                        }
                                        addKeymap(newKey);
                                        setNewKey({lhs: "", rhs: "", desc: ""});
                                    }}
                                >
                                    <Icon name="add" className="text-[14px]" /> 추가
                                </Button>
                            </div>
                        </div>
                    </ConfigPanel>
                </div>

                {/* Right: preview */}
                <div className="space-y-5">
                    <ConfigPanel title="실시간 미리보기 · init.lua">
                        <pre className="rounded-lg bg-surface-container-lowest border border-white/[0.06] p-3 text-[11.5px] font-mono text-on-surface-variant max-h-[560px] overflow-auto whitespace-pre-wrap">
                            {exported}
                        </pre>
                    </ConfigPanel>
                </div>
            </div>

            <ImportWizard
                open={importOpen}
                onClose={() => setImportOpen(false)}
                title="Neovim 설정 환승하기"
                accept=".lua,.vim,.txt"
                placeholder="~/.config/nvim/init.lua 내용을 붙여넣어 주세요."
                hint="vim.opt.* / vim.g.* / colorscheme / lazy.nvim 플러그인 목록을 흡수합니다. (best-effort, lossy)"
                parse={importNvimInit}
                onApply={(r) => {
                    const before = {...useNeovimStore.getState().config};
                    for (const [k, v] of Object.entries(r.value)) {
                        setField(k as never, v as never);
                    }
                    toastWithUndo(
                        `${r.applied}개 키를 환승했어요.`,
                        () => useNeovimStore.setState({config: before as never})
                    );
                }}
            />
        </div>
    );
}
