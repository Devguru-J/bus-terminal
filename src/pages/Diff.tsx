import {useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {StationHeader} from "@/components/shell/StationHeader";
import {DiffViewer} from "@/components/platform/DiffViewer";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {Badge} from "@/components/ui/Badge";
import {Select} from "@/components/ui/Field";
import {diffLines, collapseContext} from "@/lib/diff";

import {ghosttyDefaults, PALETTE_DEFAULT} from "@/data/ghosttySchema";
import {serializeGhosttyConfig} from "@/lib/parse";
import {useGhosttyStore} from "@/stores/ghosttyStore";

import {tmuxStatusDefault, serializeTmuxConf} from "@/data/tmux";
import {useTmuxStore} from "@/stores/tmuxStore";

import {nvimDefault, serializeNvimConfig} from "@/data/neovim";
import {useNeovimStore} from "@/stores/neovimStore";

import {zshDefault, serializeZshConfig} from "@/data/zsh";
import {useZshStore} from "@/stores/zshStore";

import {helixDefault, serializeHelixConfig} from "@/data/helix";
import {useHelixStore} from "@/stores/helixStore";

import {iterm2Default, serializeIterm2Colors} from "@/data/iterm2";
import {useIterm2Store} from "@/stores/iterm2Store";

import {warpDefault, serializeWarpTheme} from "@/data/warp";
import {useWarpStore} from "@/stores/warpStore";

import {useRoutesStore, type SavedRoute} from "@/stores/routesStore";
import {toast} from "@/stores/toastStore";

type Platform = SavedRoute["platform"];

const PLATFORMS: Array<{id: Platform; label: string; filename: string}> = [
    {id: "ghostty", label: "Ghostty", filename: "ghostty-config"},
    {id: "warp", label: "Warp", filename: "warp-theme.yaml"},
    {id: "iterm2", label: "iTerm2", filename: "BusTerminal.itermcolors"},
    {id: "neovim", label: "Neovim", filename: "init.lua"},
    {id: "helix", label: "Helix", filename: "config.toml"},
    {id: "zsh", label: "Zsh", filename: ".zshrc"},
    {id: "tmux", label: "tmux", filename: ".tmux.conf"}
];

type Mode = "defaults" | "route";

export function DiffPage() {
    const navigate = useNavigate();
    const [platform, setPlatform] = useState<Platform>("ghostty");
    const [mode, setMode] = useState<Mode>("defaults");
    const [routeId, setRouteId] = useState<string>("");
    const [changedOnly, setChangedOnly] = useState(false);

    const routes = useRoutesStore(s => s.routes);
    const save = useRoutesStore(s => s.save);

    const ghosttyConfig = useGhosttyStore(s => s.config);
    const ghosttyPalette = useGhosttyStore(s => s.palette);
    const ghosttyKeybinds = useGhosttyStore(s => s.keybinds);
    const tmuxConfig = useTmuxStore(s => s.config);
    const nvimConfig = useNeovimStore(s => s.config);
    const zshConfig = useZshStore(s => s.config);
    const helixConfig = useHelixStore(s => s.config);
    const itermProfile = useIterm2Store(s => s.profile);
    const warpConfig = useWarpStore(s => s.config);

    const platformRoutes = useMemo(
        () => routes.filter(r => r.platform === platform),
        [routes, platform]
    );

    const currentText = useMemo(() => {
        switch (platform) {
            case "ghostty":
                return serializeGhosttyConfig(
                    ghosttyConfig,
                    ghosttyDefaults(),
                    ghosttyPalette,
                    PALETTE_DEFAULT.slice(),
                    ghosttyKeybinds,
                    []
                );
            case "tmux":
                return serializeTmuxConf(tmuxConfig);
            case "neovim":
                return serializeNvimConfig(nvimConfig);
            case "zsh":
                return serializeZshConfig(zshConfig);
            case "helix":
                return serializeHelixConfig(helixConfig);
            case "iterm2":
                return serializeIterm2Colors(itermProfile);
            case "warp":
                return serializeWarpTheme(warpConfig);
        }
    }, [
        platform,
        ghosttyConfig,
        ghosttyPalette,
        ghosttyKeybinds,
        tmuxConfig,
        nvimConfig,
        zshConfig,
        helixConfig,
        itermProfile,
        warpConfig
    ]);

    const defaultsText = useMemo(() => {
        switch (platform) {
            case "ghostty":
                return serializeGhosttyConfig(
                    ghosttyDefaults(),
                    ghosttyDefaults(),
                    PALETTE_DEFAULT.slice(),
                    PALETTE_DEFAULT.slice(),
                    [],
                    []
                );
            case "tmux":
                return serializeTmuxConf(tmuxStatusDefault);
            case "neovim":
                return serializeNvimConfig(nvimDefault);
            case "zsh":
                return serializeZshConfig(zshDefault);
            case "helix":
                return serializeHelixConfig(helixDefault);
            case "iterm2":
                return serializeIterm2Colors(iterm2Default);
            case "warp":
                return serializeWarpTheme(warpDefault);
        }
    }, [platform]);

    const baseText = useMemo(() => {
        if (mode === "defaults") return defaultsText;
        const r = platformRoutes.find(x => x.id === routeId);
        return r?.text ?? "";
    }, [mode, defaultsText, platformRoutes, routeId]);

    const platformMeta = PLATFORMS.find(p => p.id === platform)!;
    const rawDiff = useMemo(
        () => diffLines(baseText, currentText),
        [baseText, currentText]
    );
    const diff = useMemo(
        () => (changedOnly ? collapseContext(rawDiff, 1) : rawDiff),
        [rawDiff, changedOnly]
    );

    const baseLabel =
        mode === "defaults"
            ? "Base · 출고 기본값"
            : `Base · ${platformRoutes.find(x => x.id === routeId)?.name ?? "노선 미선택"}`;

    function saveMerged() {
        save({
            name: `${platformMeta.label} diff ${new Date().toLocaleTimeString()}`,
            platform,
            text: currentText
        });
        toast(`현재 ${platformMeta.label} 설정을 새 노선으로 보관했어요.`, "success");
    }

    return (
        <div className="max-w-7xl mx-auto">
            <StationHeader
                title="설정 비교"
                eyebrow="Diff Analysis Active"
                subtitle={
                    <span className="inline-flex items-center gap-3 flex-wrap">
                        <Badge tone="info">{diff.added} 추가</Badge>
                        <Badge tone="danger">{diff.removed} 제거</Badge>
                        <Badge tone="muted">{diff.same} 동일</Badge>
                    </span>
                }
                actions={
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setChangedOnly(v => !v)}
                        >
                            <Icon name="tune" className="text-[14px]" />
                            {changedOnly ? "Show Context" : "Changes Only"}
                        </Button>
                        <Button size="sm" onClick={() => navigate("/export")}>
                            <Icon name="rocket_launch" className="text-[14px]" /> 출발 완료
                        </Button>
                    </>
                }
            />

            {/* 제어 바 */}
            <div className="mb-5 grid grid-cols-1 lg:grid-cols-[1fr_1fr_2fr] gap-3 rounded-xl border border-white/[0.06] bg-surface-container-lowest/80 p-3">
                <label className="flex items-center gap-2">
                    <span className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant w-16 shrink-0">
                        승강장
                    </span>
                    <Select
                        value={platform}
                        onChange={e => {
                            setPlatform(e.target.value as Platform);
                            setRouteId("");
                        }}
                    >
                        {PLATFORMS.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.label}
                            </option>
                        ))}
                    </Select>
                </label>

                <label className="flex items-center gap-2">
                    <span className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant w-16 shrink-0">
                        비교 모드
                    </span>
                    <Select
                        value={mode}
                        onChange={e => setMode(e.target.value as Mode)}
                    >
                        <option value="defaults">vs 출고 기본값</option>
                        <option value="route">vs 차고 노선</option>
                    </Select>
                </label>

                {mode === "route" && (
                    <label className="flex items-center gap-2">
                        <span className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant w-16 shrink-0">
                            노선
                        </span>
                        <Select
                            value={routeId}
                            onChange={e => setRouteId(e.target.value)}
                        >
                            <option value="">선택...</option>
                            {platformRoutes.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.name} · {new Date(r.createdAt).toLocaleString()}
                                </option>
                            ))}
                        </Select>
                    </label>
                )}
            </div>

            {mode === "route" && !routeId && (
                <div className="mb-5 rounded-lg border border-tertiary-fixed-dim/20 bg-tertiary-fixed-dim/[0.06] px-4 py-3 text-code-sm text-tertiary-fixed-dim">
                    차고에 보관된 {platformMeta.label} 노선을 선택해 주세요.
                    {platformRoutes.length === 0 && " (현재 보관된 노선 없음)"}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <DiffViewer
                    title={baseLabel}
                    filename={platformMeta.filename}
                    lines={diff.left}
                />
                <DiffViewer
                    title="Target · 현재 설정"
                    filename={platformMeta.filename}
                    lines={diff.right}
                />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 rounded-xl border border-white/[0.06] bg-surface-container-lowest/80 px-5 py-4">
                <p className="text-body-md text-on-surface-variant">
                    현재 {platformMeta.label} 설정을 차고에 보관하거나 출발권으로 바로 보냅니다.
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/${platform === "iterm2" ? "iterm2" : platform}`)}
                    >
                        <Icon name="arrow_back" className="text-[14px]" />
                        {platformMeta.label} 승강장
                    </Button>
                    <Button size="sm" onClick={saveMerged}>
                        <Icon name="bookmark_add" className="text-[14px]" />
                        차고 보관
                    </Button>
                </div>
            </div>
        </div>
    );
}
