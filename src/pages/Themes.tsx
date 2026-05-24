import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {motion} from "framer-motion";
import {StationHeader} from "@/components/shell/StationHeader";
import {ThemeCard} from "@/components/platform/ThemeCard";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {themes} from "@/data/themes";
import {useGhosttyStore} from "@/stores/ghosttyStore";
import {useTmuxStore} from "@/stores/tmuxStore";
import {useNeovimStore} from "@/stores/neovimStore";
import {NVIM_COLORSCHEMES, type NvimColorscheme} from "@/data/neovim";
import {toast} from "@/stores/toastStore";

const TARGETS = ["Ghostty", "tmux", "Neovim", "Zsh"] as const;

/** theme.id → Neovim colorscheme name (가장 가까운 것) */
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

export function ThemesPage() {
    const applyGhostty = useGhosttyStore(s => s.applyTheme);
    const setTmuxField = useTmuxStore(s => s.setField);
    const setNvimField = useNeovimStore(s => s.setField);
    const navigate = useNavigate();
    const [active, setActive] = useState(themes[1]?.id ?? themes[0].id);
    const [target, setTarget] = useState<(typeof TARGETS)[number]>("Ghostty");

    const activeTheme = themes.find(t => t.id === active) ?? themes[0];

    function broadcast() {
        switch (target) {
            case "Ghostty":
                applyGhostty(activeTheme);
                toast(`Ghostty 노선이 "${activeTheme.ko}"으로 환승했어요.`, "success");
                setTimeout(() => navigate("/ghostty"), 350);
                break;
            case "tmux":
                setTmuxField(
                    "statusStyle",
                    `fg=${activeTheme.foreground},bg=${activeTheme.background}`
                );
                setTmuxField("leftSegments", [
                    `#[fg=${activeTheme.accent}] #S `,
                    `#[fg=${activeTheme.foreground}] | `
                ]);
                setTmuxField("rightSegments", [
                    `#[fg=${activeTheme.foreground}] %Y-%m-%d `,
                    `#[fg=${activeTheme.accent}] %H:%M `
                ]);
                toast(`tmux 상태바가 "${activeTheme.ko}"으로 환승했어요.`, "success");
                setTimeout(() => navigate("/tmux"), 350);
                break;
            case "Neovim": {
                const cs = themeToNvimColorscheme(activeTheme.id);
                setNvimField("colorscheme", cs);
                toast(`Neovim 컬러스킴이 "${cs}"으로 환승했어요.`, "success");
                setTimeout(() => navigate("/neovim"), 350);
                break;
            }
            case "Zsh":
                toast(
                    "Zsh는 색 테마 대신 프롬프트 테마(/zsh)로 운영됩니다.",
                    "info"
                );
                break;
        }
    }

    return (
        <div className="max-w-7xl mx-auto">
            <StationHeader
                title="테마 환승센터"
                eyebrow="노선 스타일 (THEME)"
                subtitle="A curated gallery of global color schemes designed for extreme legibility and minimal eye strain across all terminal interfaces. Select a theme to broadcast globally to Ghostty, tmux, Neovim, and Zsh."
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
                className="sticky bottom-12 mt-8 rounded-xl border border-white/[0.08] bg-surface-container/90 p-4 flex flex-col sm:flex-row items-center gap-3"
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
                <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant">
                        적용 대상
                    </span>
                    <div className="inline-flex rounded border border-white/[0.06] bg-surface-container-lowest p-0.5">
                        {TARGETS.map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTarget(t)}
                                className={`h-8 px-3 rounded-[2px] font-mono text-label-xs uppercase tracking-[0.12em] transition ${
                                    target === t
                                        ? "bg-primary-fixed-dim text-on-primary"
                                        : "text-on-surface-variant hover:text-on-surface"
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <Button onClick={broadcast}>
                        <Icon name="cell_tower" className="text-[16px]" /> 전체 적용
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
