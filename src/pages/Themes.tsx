import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {motion} from "framer-motion";
import {StationHeader} from "@/components/shell/StationHeader";
import {ThemeCard} from "@/components/platform/ThemeCard";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {themes, type RouteTheme} from "@/data/themes";
import {useGhosttyStore} from "@/stores/ghosttyStore";
import {useTmuxStore} from "@/stores/tmuxStore";
import {useNeovimStore} from "@/stores/neovimStore";
import {useHelixStore} from "@/stores/helixStore";
import {useIterm2Store} from "@/stores/iterm2Store";
import {useWarpStore} from "@/stores/warpStore";
import {NVIM_COLORSCHEMES, type NvimColorscheme} from "@/data/neovim";
import {HELIX_THEMES, type HelixTheme} from "@/data/helix";
import {toast} from "@/stores/toastStore";

type Target = "all" | "ghostty" | "warp" | "iterm2" | "neovim" | "helix" | "tmux";

const TARGETS: Array<{id: Target; label: string; route?: string}> = [
    {id: "all", label: "전체"},
    {id: "ghostty", label: "Ghostty", route: "/ghostty"},
    {id: "warp", label: "Warp", route: "/warp"},
    {id: "iterm2", label: "iTerm2", route: "/iterm2"},
    {id: "neovim", label: "Neovim", route: "/neovim"},
    {id: "helix", label: "Helix", route: "/helix"},
    {id: "tmux", label: "tmux", route: "/tmux"}
];

/** RouteTheme.id → Neovim colorscheme name (가장 가까운 것) */
function themeToNvimColorscheme(id: string): NvimColorscheme {
    const map: Record<string, NvimColorscheme> = {
        "tokyo-night": "tokyonight",
        "gruvbox-dark": "gruvbox",
        "catppuccin-mocha": "catppuccin",
        "nord": "nord",
        "rose-pine": "rose-pine",
        "solarized-light": "default"
    };
    const candidate = map[id];
    return NVIM_COLORSCHEMES.includes(candidate as NvimColorscheme)
        ? (candidate as NvimColorscheme)
        : "default";
}

/** RouteTheme.id → Helix theme name (가장 가까운 것). */
function themeToHelixTheme(id: string): HelixTheme {
    const map: Record<string, HelixTheme> = {
        "tokyo-night": "tokyonight",
        "gruvbox-dark": "gruvbox_dark_hard",
        "catppuccin-mocha": "catppuccin_mocha",
        "nord": "nord",
        "rose-pine": "rose_pine_moon",
        "solarized-light": "default"
    };
    const candidate = map[id];
    return HELIX_THEMES.includes(candidate as HelixTheme)
        ? (candidate as HelixTheme)
        : "default";
}

export function ThemesPage() {
    const applyGhostty = useGhosttyStore(s => s.applyTheme);
    const applyIterm2 = useIterm2Store(s => s.applyTheme);
    const applyWarp = useWarpStore(s => s.applyTheme);
    const setTmuxField = useTmuxStore(s => s.setField);
    const setNvimField = useNeovimStore(s => s.setField);
    const setHelixField = useHelixStore(s => s.setField);
    const navigate = useNavigate();
    const [active, setActive] = useState(themes[1]?.id ?? themes[0].id);
    const [target, setTarget] = useState<Target>("all");

    const activeTheme = themes.find(t => t.id === active) ?? themes[0];

    function applyToGhostty(t: RouteTheme) {
        applyGhostty(t);
    }
    function applyToIterm2(t: RouteTheme) {
        applyIterm2(t);
    }
    function applyToWarp(t: RouteTheme) {
        applyWarp(t);
    }
    function applyToTmux(t: RouteTheme) {
        setTmuxField("statusStyle", `fg=${t.foreground},bg=${t.background}`);
        setTmuxField("leftSegments", [
            `#[fg=${t.accent}] #S `,
            `#[fg=${t.foreground}] | `
        ]);
        setTmuxField("rightSegments", [
            `#[fg=${t.foreground}] %Y-%m-%d `,
            `#[fg=${t.accent}] %H:%M `
        ]);
    }
    function applyToNvim(t: RouteTheme) {
        setNvimField("colorscheme", themeToNvimColorscheme(t.id));
    }
    function applyToHelix(t: RouteTheme) {
        setHelixField("theme", themeToHelixTheme(t.id));
    }

    function broadcast() {
        const t = activeTheme;
        switch (target) {
            case "all":
                applyToGhostty(t);
                applyToIterm2(t);
                applyToWarp(t);
                applyToTmux(t);
                applyToNvim(t);
                applyToHelix(t);
                toast(
                    `6개 승강장에 "${t.ko}" 노선을 환승 송출했어요.`,
                    "success"
                );
                return;
            case "ghostty":
                applyToGhostty(t);
                break;
            case "iterm2":
                applyToIterm2(t);
                break;
            case "warp":
                applyToWarp(t);
                break;
            case "tmux":
                applyToTmux(t);
                break;
            case "neovim":
                applyToNvim(t);
                break;
            case "helix":
                applyToHelix(t);
                break;
        }
        const targetMeta = TARGETS.find(x => x.id === target);
        toast(
            `${targetMeta?.label} 노선이 "${t.ko}"으로 환승했어요.`,
            "success"
        );
        if (targetMeta?.route) {
            setTimeout(() => navigate(targetMeta.route!), 350);
        }
    }

    return (
        <div className="max-w-7xl mx-auto">
            <StationHeader
                title="테마 환승센터"
                eyebrow="노선 스타일 (THEME)"
                subtitle="6개 승강장(Ghostty · Warp · iTerm2 · Neovim · Helix · tmux)에 색 노선 한 번에 환승. Zsh는 색 대신 프롬프트 테마(/zsh)로 운영됩니다."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {themes.map(t => (
                    <ThemeCard
                        key={t.id}
                        theme={t}
                        active={t.id === active}
                        onClick={() => setActive(t.id)}
                    />
                ))}
            </div>

            {/* Bottom action dock */}
            <motion.div
                layout
                className="sticky bottom-12 mt-8 rounded-xl border border-white/[0.08] bg-surface-container/95 p-4 flex flex-col lg:flex-row lg:items-center gap-3"
            >
                <div className="flex items-center gap-3">
                    <div
                        className="h-8 w-8 rounded border border-white/10"
                        style={{background: activeTheme.background}}
                    />
                    <div>
                        <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant">
                            Selected
                        </div>
                        <div className="text-code-sm text-on-surface">{activeTheme.ko}</div>
                    </div>
                </div>
                <div className="lg:ml-auto flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant">
                        적용 대상
                    </span>
                    <div className="inline-flex flex-wrap rounded border border-white/[0.06] bg-surface-container-lowest p-0.5">
                        {TARGETS.map(t => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setTarget(t.id)}
                                className={`h-8 px-3 rounded-[2px] font-mono text-label-xs uppercase tracking-[0.12em] transition ${
                                    target === t.id
                                        ? "bg-primary-fixed-dim text-on-primary"
                                        : "text-on-surface-variant hover:text-on-surface"
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <Button onClick={broadcast}>
                        <Icon name="cell_tower" className="text-[16px]" />
                        {target === "all" ? "전체 송출" : "환승 적용"}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
