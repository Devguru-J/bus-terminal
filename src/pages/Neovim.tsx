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
import {toast} from "@/stores/toastStore";
import {cn} from "@/lib/utils";

export function NeovimPage() {
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
                eyebrow="Platform 3 · NVM-001"
                subtitle="lazy.nvim 기반 init.lua를 시각적으로 구성합니다."
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
                    {/* 기본 옵션 */}
                    <ConfigPanel title="기본 옵션">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <Label hint="g.mapleader">Leader Key</Label>
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
                                <Label hint="tabstop / shiftwidth">Tab Width</Label>
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
                                <Label hint="colorscheme">컬러스킴</Label>
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
                                <Label hint="statusline">상태바</Label>
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
        </div>
    );
}
