import {useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {motion} from "framer-motion";
import {StationHeader} from "@/components/shell/StationHeader";
import {ThemeCard} from "@/components/platform/ThemeCard";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {Select, TextInput} from "@/components/ui/Field";
import {themes as builtinThemes, themeCategories, type RouteTheme, type ThemeTag} from "@/data/themes";
import {useUserThemesStore} from "@/stores/userThemesStore";
import {ImportThemeModal} from "@/components/platform/ImportThemeModal";
import {useGhosttyStore} from "@/stores/ghosttyStore";
import {useTmuxStore} from "@/stores/tmuxStore";
import {useNeovimStore} from "@/stores/neovimStore";
import {useHelixStore} from "@/stores/helixStore";
import {useIterm2Store} from "@/stores/iterm2Store";
import {useWarpStore} from "@/stores/warpStore";
import {useFavoritesStore} from "@/stores/favoritesStore";
import {NVIM_COLORSCHEMES, type NvimColorscheme} from "@/data/neovim";
import {HELIX_THEMES, type HelixTheme} from "@/data/helix";
import {toast, toastWithUndo} from "@/stores/toastStore";
import {cn} from "@/lib/utils";

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

const SORTS = [
    {id: "default", label: "추천순"},
    {id: "alpha", label: "이름순"},
    {id: "dark-first", label: "다크 우선"},
    {id: "light-first", label: "라이트 우선"},
    {id: "favorites-first", label: "즐겨찾기 우선"}
] as const;
type SortId = (typeof SORTS)[number]["id"];

/** RouteTheme.id → Neovim colorscheme name */
function themeToNvimColorscheme(id: string): NvimColorscheme {
    const map: Record<string, NvimColorscheme> = {
        "tokyo-night": "tokyonight",
        "tokyo-night-storm": "tokyonight",
        "tokyo-night-moon": "tokyonight",
        "gruvbox-dark": "gruvbox",
        "gruvbox-light": "gruvbox",
        "catppuccin-mocha": "catppuccin",
        "catppuccin-macchiato": "catppuccin",
        "catppuccin-frappe": "catppuccin",
        "catppuccin-latte": "catppuccin",
        "nord": "nord",
        "rose-pine": "rose-pine",
        "rose-pine-moon": "rose-pine",
        "kanagawa": "kanagawa"
    };
    const candidate = map[id];
    return NVIM_COLORSCHEMES.includes(candidate as NvimColorscheme)
        ? (candidate as NvimColorscheme)
        : "default";
}

/** RouteTheme.id → Helix theme name */
function themeToHelixTheme(id: string): HelixTheme {
    const map: Record<string, HelixTheme> = {
        "tokyo-night": "tokyonight",
        "tokyo-night-storm": "tokyonight_storm",
        "tokyo-night-moon": "tokyonight",
        "catppuccin-mocha": "catppuccin_mocha",
        "catppuccin-macchiato": "catppuccin_macchiato",
        "catppuccin-frappe": "catppuccin_mocha",
        "gruvbox-dark": "gruvbox_dark_hard",
        "gruvbox-light": "gruvbox",
        "nord": "nord",
        "dracula": "dracula",
        "rose-pine": "rose_pine",
        "rose-pine-moon": "rose_pine_moon",
        "monokai-pro": "monokai_pro",
        "ayu-dark": "ayu_dark",
        "one-dark": "onedark"
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
    const favorites = useFavoritesStore(s => s.themes);
    const toggleFavorite = useFavoritesStore(s => s.toggleTheme);
    const userThemes = useUserThemesStore(s => s.items);
    const removeUserTheme = useUserThemesStore(s => s.remove);
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [tagFilter, setTagFilter] = useState<ThemeTag | "all" | "favorites" | "imported">("all");
    const [sort, setSort] = useState<SortId>("default");
    const [active, setActive] = useState(builtinThemes[0].id);
    const [target, setTarget] = useState<Target>("all");
    const [importOpen, setImportOpen] = useState(false);

    // 빌트인 + 사용자 추가 테마. 사용자 테마가 앞에 와서 새로 가져온 게 바로 보임.
    const themes = useMemo<RouteTheme[]>(
        () => [...userThemes, ...builtinThemes],
        [userThemes]
    );
    const userIds = useMemo(() => new Set(userThemes.map(t => t.id)), [userThemes]);

    const activeTheme = themes.find(t => t.id === active) ?? themes[0];

    const visible = useMemo(() => {
        let list = themes.slice();
        const q = query.trim().toLowerCase();
        if (q) {
            list = list.filter(t =>
                `${t.ko} ${t.id} ${t.description} ${t.author ?? ""}`
                    .toLowerCase()
                    .includes(q)
            );
        }
        if (tagFilter === "favorites") {
            list = list.filter(t => favorites.includes(t.id));
        }
        else if (tagFilter === "imported") {
            list = list.filter(t => userIds.has(t.id));
        }
        else if (tagFilter !== "all") {
            list = list.filter(t => t.tags.includes(tagFilter));
        }
        switch (sort) {
            case "alpha":
                list.sort((a, b) => a.ko.localeCompare(b.ko));
                break;
            case "dark-first":
                list.sort(
                    (a, b) =>
                        Number(b.tags.includes("dark")) - Number(a.tags.includes("dark"))
                );
                break;
            case "light-first":
                list.sort(
                    (a, b) =>
                        Number(b.tags.includes("light")) - Number(a.tags.includes("light"))
                );
                break;
            case "favorites-first":
                list.sort(
                    (a, b) =>
                        Number(favorites.includes(b.id)) - Number(favorites.includes(a.id))
                );
                break;
        }
        return list;
    }, [query, tagFilter, sort, favorites, themes, userIds]);

    function applyToAll(t: RouteTheme) {
        applyGhostty(t);
        applyIterm2(t);
        applyWarp(t);
        setTmuxField("statusStyle", `fg=${t.foreground},bg=${t.background}`);
        setTmuxField("leftSegments", [
            `#[fg=${t.accent}] #S `,
            `#[fg=${t.foreground}] | `
        ]);
        setTmuxField("rightSegments", [
            `#[fg=${t.foreground}] %Y-%m-%d `,
            `#[fg=${t.accent}] %H:%M `
        ]);
        setNvimField("colorscheme", themeToNvimColorscheme(t.id));
        setHelixField("theme", themeToHelixTheme(t.id));
    }

    function broadcast() {
        const t = activeTheme;
        switch (target) {
            case "all": {
                // 적용 전 스냅샷 — 되돌리기에 사용
                const snapshot = {
                    ghostty: {
                        config: {...useGhosttyStore.getState().config},
                        palette: useGhosttyStore.getState().palette.slice()
                    },
                    iterm2: {...useIterm2Store.getState().profile, ansi: useIterm2Store.getState().profile.ansi.slice()},
                    warp: JSON.parse(JSON.stringify(useWarpStore.getState().config)),
                    tmux: {...useTmuxStore.getState().config},
                    nvim: useNeovimStore.getState().config.colorscheme,
                    helix: useHelixStore.getState().config.theme
                };
                applyToAll(t);
                toastWithUndo(
                    `6개 승강장에 "${t.ko}" 노선을 환승 송출했어요.`,
                    () => {
                        // 전체 복원
                        useGhosttyStore.setState(s => ({
                            ...s,
                            config: snapshot.ghostty.config,
                            palette: snapshot.ghostty.palette
                        }));
                        useIterm2Store.setState(s => ({...s, profile: snapshot.iterm2}));
                        useWarpStore.setState(s => ({...s, config: snapshot.warp}));
                        useTmuxStore.setState(s => ({...s, config: snapshot.tmux}));
                        setNvimField("colorscheme", snapshot.nvim);
                        setHelixField("theme", snapshot.helix);
                        toast("전체 송출을 되돌렸어요.", "info");
                    }
                );
                return;
            }
            case "ghostty":
                applyGhostty(t);
                break;
            case "iterm2":
                applyIterm2(t);
                break;
            case "warp":
                applyWarp(t);
                break;
            case "tmux":
                setTmuxField("statusStyle", `fg=${t.foreground},bg=${t.background}`);
                setTmuxField("leftSegments", [`#[fg=${t.accent}] #S `, `#[fg=${t.foreground}] | `]);
                setTmuxField("rightSegments", [`#[fg=${t.foreground}] %Y-%m-%d `, `#[fg=${t.accent}] %H:%M `]);
                break;
            case "neovim":
                setNvimField("colorscheme", themeToNvimColorscheme(t.id));
                break;
            case "helix":
                setHelixField("theme", themeToHelixTheme(t.id));
                break;
        }
        const targetMeta = TARGETS.find(x => x.id === target);
        toast(`${targetMeta?.label} 노선이 "${t.ko}"으로 환승했어요.`, "success");
        if (targetMeta?.route) {
            setTimeout(() => navigate(targetMeta.route!), 350);
        }
    }

    return (
        <div className="max-w-7xl mx-auto pb-32">
            <StationHeader
                title="테마 환승센터"
                eyebrow="노선 스타일 (THEME)"
                subtitle={`${themes.length}개 노선 운행중. 6개 승강장(Ghostty · Warp · iTerm2 · Neovim · Helix · tmux)에 한 번에 환승 송출.`}
                actions={
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/themes/compare")}
                        >
                            <Icon name="compare_arrows" className="text-[14px]" />
                            테마 비교
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setImportOpen(true)}
                        >
                            <Icon name="file_upload" className="text-[14px]" />
                            테마 가져오기
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/fonts")}
                        >
                            <Icon name="text_fields" className="text-[14px]" />
                            폰트 환승센터
                        </Button>
                    </>
                }
            />

            {/* 검색 + 카테고리 + 정렬 */}
            <div className="mb-5 rounded-xl border border-white/[0.06] bg-surface-container-lowest/80 p-3 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Icon
                            name="search"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant"
                        />
                        <TextInput
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="테마 이름, 설명, 제작자 검색..."
                            className="pl-9"
                        />
                    </div>
                    <Select
                        value={sort}
                        onChange={e => setSort(e.target.value as SortId)}
                        className="sm:w-44"
                    >
                        {SORTS.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.label}
                            </option>
                        ))}
                    </Select>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    <TagChip
                        active={tagFilter === "all"}
                        onClick={() => setTagFilter("all")}
                        icon="apps"
                        label={`전체 ${themes.length}`}
                    />
                    <TagChip
                        active={tagFilter === "favorites"}
                        onClick={() => setTagFilter("favorites")}
                        icon="favorite"
                        label={`즐겨찾기 ${favorites.length}`}
                    />
                    {userThemes.length > 0 && (
                        <TagChip
                            active={tagFilter === "imported"}
                            onClick={() => setTagFilter("imported")}
                            icon="file_upload"
                            label={`가져온 ${userThemes.length}`}
                        />
                    )}
                    {themeCategories.map(c => {
                        const count = themes.filter(t => t.tags.includes(c.id)).length;
                        return (
                            <TagChip
                                key={c.id}
                                active={tagFilter === c.id}
                                onClick={() => setTagFilter(c.id)}
                                icon={c.icon}
                                label={`${c.ko} ${count}`}
                            />
                        );
                    })}
                </div>
            </div>

            {visible.length === 0 ? (
                <div className="rounded-lg border border-white/[0.06] bg-surface-container-lowest/60 p-12 text-center">
                    <Icon name="search_off" className="text-[40px] text-on-surface-variant/40" />
                    <p className="mt-3 text-body-md text-on-surface-variant">
                        조건에 맞는 테마가 없어요. 검색어 또는 필터를 바꿔보세요.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {visible.map(t => (
                        <ThemeCard
                            key={t.id}
                            theme={t}
                            active={t.id === active}
                            favorite={favorites.includes(t.id)}
                            detailTo={`/themes/${t.id}`}
                            imported={userIds.has(t.id)}
                            onClick={() => setActive(t.id)}
                            onFavorite={() => toggleFavorite(t.id)}
                            onDelete={
                                userIds.has(t.id)
                                    ? () => {
                                          if (
                                              window.confirm(
                                                  `"${t.ko}" 사용자 테마를 삭제할까요?`
                                              )
                                          ) {
                                              removeUserTheme(t.id);
                                              toast("삭제했어요.", "success");
                                          }
                                      }
                                    : undefined
                            }
                        />
                    ))}
                </div>
            )}

            {/* Bottom action dock */}
            <motion.div
                layout
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[min(960px,calc(100vw-2rem))] rounded-xl border border-white/[0.08] bg-surface-container/95 shadow-glow-soft p-4 flex flex-col lg:flex-row lg:items-center gap-3"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className="h-10 w-10 rounded border border-white/10 shrink-0"
                        style={{background: activeTheme.background}}
                    />
                    <div className="min-w-0">
                        <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant">
                            Selected
                        </div>
                        <div className="text-code-sm text-on-surface truncate">
                            {activeTheme.ko}
                        </div>
                    </div>
                </div>
                <div className="lg:ml-auto flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant hidden md:inline">
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

            <ImportThemeModal
                open={importOpen}
                onClose={() => setImportOpen(false)}
                onImported={id => setActive(id)}
            />
        </div>
    );
}

function TagChip({
    active,
    onClick,
    icon,
    label
}: {
    active: boolean;
    onClick: () => void;
    icon: string;
    label: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition",
                active
                    ? "border-primary-fixed-dim bg-primary-fixed-dim/15 text-primary-fixed-dim"
                    : "border-white/10 bg-white/[0.02] text-on-surface-variant hover:border-white/25 hover:text-on-surface"
            )}
        >
            <Icon name={icon} className="text-[14px]" />
            {label}
        </button>
    );
}
