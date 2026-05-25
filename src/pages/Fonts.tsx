import {useEffect, useMemo, useState, type KeyboardEvent} from "react";
import {Link, useNavigate} from "react-router-dom";
import {StationHeader} from "@/components/shell/StationHeader";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {Select, TextInput, RangeInput} from "@/components/ui/Field";
import {Badge} from "@/components/ui/Badge";
import {
    fonts,
    fontCategories,
    PREVIEW_SAMPLES,
    type FontEntry,
    type FontCategory,
    type FontTag
} from "@/data/fonts";
import {useGhosttyStore} from "@/stores/ghosttyStore";
import {useIterm2Store} from "@/stores/iterm2Store";
import {useWarpStore} from "@/stores/warpStore";
import {useFavoritesStore} from "@/stores/favoritesStore";
import {toast, toastWithUndo} from "@/stores/toastStore";
import {cn} from "@/lib/utils";

type FontTarget = "all" | "ghostty" | "iterm2" | "warp";
const TARGETS: Array<{id: FontTarget; label: string; route?: string}> = [
    {id: "all", label: "전체"},
    {id: "ghostty", label: "Ghostty", route: "/ghostty"},
    {id: "iterm2", label: "iTerm2", route: "/iterm2"},
    {id: "warp", label: "Warp", route: "/warp"}
];

type PreviewTab = "english" | "korean" | "code" | "terminal";

export function FontsPage() {
    const setGhosttyField = useGhosttyStore(s => s.setField);
    const setIterm2Field = useIterm2Store(s => s.setField);
    const setWarpAppearance = useWarpStore(s => s.setAppearance);
    const favorites = useFavoritesStore(s => s.fonts);
    const toggleFavorite = useFavoritesStore(s => s.toggleFont);
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<FontCategory | "all" | "favorites">("all");
    const [tag, setTag] = useState<FontTag | "all">("all");
    const [size, setSize] = useState(14);
    const [previewTab, setPreviewTab] = useState<PreviewTab>("code");
    const [selectedId, setSelectedId] = useState(fonts[0].id);
    const [target, setTarget] = useState<FontTarget>("all");

    // Google Fonts auto-load via <link>
    useEffect(() => {
        const head = document.head;
        const links: HTMLLinkElement[] = [];
        for (const f of fonts) {
            if (!f.googleFontUrl) continue;
            if (document.querySelector(`link[href="${f.googleFontUrl}"]`)) continue;
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = f.googleFontUrl;
            link.dataset.busFont = f.id;
            head.appendChild(link);
            links.push(link);
        }
        return () => {
            // 페이지 떠나도 폰트는 유지 — preview 시 깜빡임 방지
        };
    }, []);

    const visible = useMemo(() => {
        let list = fonts.slice();
        const q = query.trim().toLowerCase();
        if (q) {
            list = list.filter(f =>
                `${f.name} ${f.author} ${f.description}`.toLowerCase().includes(q)
            );
        }
        if (category === "favorites") {
            list = list.filter(f => favorites.includes(f.id));
        }
        else if (category !== "all") {
            list = list.filter(f => f.category === category);
        }
        if (tag !== "all") {
            list = list.filter(f => f.tags.includes(tag));
        }
        return list;
    }, [query, category, tag, favorites]);

    const selected = fonts.find(f => f.id === selectedId) ?? fonts[0];

    function apply(font: FontEntry) {
        // 변경 전 스냅샷 (Undo용)
        const snap = {
            ghosttyFamily: useGhosttyStore.getState().config["font-family"],
            ghosttySize: useGhosttyStore.getState().config["font-size"],
            itermFamily: useIterm2Store.getState().profile.fontFamily,
            itermSize: useIterm2Store.getState().profile.fontSize,
            warpFamily: useWarpStore.getState().config.appearance.fontFamily,
            warpSize: useWarpStore.getState().config.appearance.fontSize
        };
        const restore = () => {
            setGhosttyField("font-family", snap.ghosttyFamily as string);
            setGhosttyField("font-size", snap.ghosttySize as number);
            setIterm2Field("fontFamily", snap.itermFamily);
            setIterm2Field("fontSize", snap.itermSize);
            setWarpAppearance("fontFamily", snap.warpFamily);
            setWarpAppearance("fontSize", snap.warpSize);
        };

        switch (target) {
            case "all":
                setGhosttyField("font-family", font.name);
                setGhosttyField("font-size", size);
                setIterm2Field("fontFamily", font.name);
                setIterm2Field("fontSize", size);
                setWarpAppearance("fontFamily", font.name);
                setWarpAppearance("fontSize", size);
                toastWithUndo(
                    `3개 터미널에 "${font.name}" ${size}pt를 적용했어요.`,
                    restore
                );
                return;
            case "ghostty":
                setGhosttyField("font-family", font.name);
                setGhosttyField("font-size", size);
                break;
            case "iterm2":
                setIterm2Field("fontFamily", font.name);
                setIterm2Field("fontSize", size);
                break;
            case "warp":
                setWarpAppearance("fontFamily", font.name);
                setWarpAppearance("fontSize", size);
                break;
        }
        const targetMeta = TARGETS.find(x => x.id === target);
        toastWithUndo(
            `${targetMeta?.label} 폰트를 "${font.name}" ${size}pt로 환승했어요.`,
            restore
        );
        if (targetMeta?.route) {
            setTimeout(() => navigate(targetMeta.route!), 350);
        }
    }

    return (
        <div className="max-w-7xl mx-auto pb-32">
            <StationHeader
                title="폰트 환승센터"
                eyebrow="노선 타이포그래피 (FONT)"
                subtitle={`${fonts.length}개 폰트 운행중. Ghostty · iTerm2 · Warp에 한 번에 적용돼요. 자체 설치가 필요한 폰트는 카드에 안내됩니다.`}
                actions={
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/fonts/pairings")}
                        >
                            <Icon name="auto_awesome" className="text-[14px]" />
                            폰트 페어링
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/themes")}
                        >
                            <Icon name="palette" className="text-[14px]" />
                            테마 환승센터
                        </Button>
                    </>
                }
            />

            {/* 검색 + 카테고리 */}
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
                            placeholder="폰트 이름, 제작자, 설명 검색..."
                            className="pl-9"
                        />
                    </div>
                    <Select
                        value={tag}
                        onChange={e => setTag(e.target.value as FontTag | "all")}
                        className="sm:w-44"
                    >
                        <option value="all">모든 태그</option>
                        <option value="ligatures">ligatures</option>
                        <option value="nerd">Nerd Font</option>
                        <option value="variable">variable</option>
                        <option value="popular">popular</option>
                        <option value="new">new</option>
                        <option value="free">free</option>
                        <option value="paid">paid</option>
                    </Select>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    <CategoryChip
                        active={category === "all"}
                        onClick={() => setCategory("all")}
                        icon="apps"
                        label={`전체 ${fonts.length}`}
                    />
                    <CategoryChip
                        active={category === "favorites"}
                        onClick={() => setCategory("favorites")}
                        icon="favorite"
                        label={`즐겨찾기 ${favorites.length}`}
                    />
                    {fontCategories.map(c => {
                        const count = fonts.filter(f => f.category === c.id).length;
                        if (count === 0) return null;
                        return (
                            <CategoryChip
                                key={c.id}
                                active={category === c.id}
                                onClick={() => setCategory(c.id)}
                                icon={c.icon}
                                label={`${c.ko} ${count}`}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
                {/* 폰트 그리드 */}
                <div className="space-y-3 min-w-0">
                    {visible.length === 0 ? (
                        <div className="rounded-lg border border-white/[0.06] bg-surface-container-lowest/60 p-12 text-center">
                            <Icon name="search_off" className="text-[40px] text-on-surface-variant/40" />
                            <p className="mt-3 text-body-md text-on-surface-variant">
                                조건에 맞는 폰트가 없어요.
                            </p>
                        </div>
                    ) : (
                        visible.map(f => (
                            <FontRow
                                key={f.id}
                                font={f}
                                selected={f.id === selectedId}
                                favorite={favorites.includes(f.id)}
                                size={size}
                                onSelect={() => setSelectedId(f.id)}
                                onFavorite={() => toggleFavorite(f.id)}
                            />
                        ))
                    )}
                </div>

                {/* 상세 미리보기 */}
                <div className="space-y-3 xl:sticky xl:top-[80px] h-fit">
                    <div className="rounded-xl border border-white/[0.06] bg-surface-container-lowest/80 p-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="min-w-0">
                                <div className="font-display text-headline-sm text-on-surface truncate">
                                    {selected.name}
                                </div>
                                <div className="text-[11px] font-mono text-on-surface-variant mt-1">
                                    {selected.author}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => toggleFavorite(selected.id)}
                                className="h-9 w-9 grid place-items-center rounded-full bg-white/[0.04] hover:bg-white/[0.08] transition"
                                aria-label="즐겨찾기"
                            >
                                <Icon
                                    name="favorite"
                                    className={cn(
                                        "text-[20px]",
                                        favorites.includes(selected.id)
                                            ? "text-error"
                                            : "text-white/40"
                                    )}
                                    fill={favorites.includes(selected.id)}
                                />
                            </button>
                        </div>
                        <p className="text-[12px] text-on-surface-variant mb-3">
                            {selected.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-3">
                            {selected.tags.map(t => (
                                <Badge
                                    key={t}
                                    tone={
                                        t === "paid"
                                            ? "warn"
                                            : t === "popular" || t === "ligatures"
                                              ? "active"
                                              : "muted"
                                    }
                                >
                                    {t}
                                </Badge>
                            ))}
                        </div>

                        {/* Preview tabs */}
                        <div className="inline-flex rounded border border-white/[0.06] bg-surface-container-lowest p-0.5 mb-3">
                            {(["english", "korean", "code", "terminal"] as PreviewTab[]).map(
                                p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPreviewTab(p)}
                                        className={`h-7 px-2.5 rounded-[2px] font-mono text-[10px] uppercase tracking-[0.12em] transition ${
                                            previewTab === p
                                                ? "bg-primary-fixed-dim text-on-primary"
                                                : "text-on-surface-variant hover:text-on-surface"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}
                        </div>

                        <div
                            className="rounded-lg border border-white/[0.06] bg-surface-container-lowest p-4 min-h-[160px] whitespace-pre-wrap break-words"
                            style={{
                                fontFamily: selected.family,
                                fontSize: `${size}px`,
                                lineHeight: 1.6
                            }}
                        >
                            {PREVIEW_SAMPLES[previewTab]}
                        </div>

                        {selected.installNote && (
                            <div className="mt-3 rounded-lg border border-tertiary-fixed-dim/20 bg-tertiary-fixed-dim/[0.06] px-3 py-2 text-[11px] text-tertiary-fixed-dim">
                                <Icon name="info" className="text-[14px] mr-1" />
                                {selected.installNote}
                            </div>
                        )}
                        {selected.homepage && (
                            <a
                                href={selected.homepage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-2 text-[11px] font-mono text-on-surface-variant hover:text-primary-fixed-dim"
                            >
                                <Icon name="open_in_new" className="text-[12px]" />
                                공식 페이지
                            </a>
                        )}
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-surface-container-lowest/80 p-4">
                        <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant mb-2">
                            Font Size {size}pt
                        </div>
                        <RangeInput
                            value={size}
                            min={8}
                            max={28}
                            step={1}
                            onChange={v => setSize(v)}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom action dock */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[min(960px,calc(100vw-2rem))] rounded-xl border border-white/[0.08] bg-surface-container/95 shadow-glow-soft p-4 flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className="h-10 w-10 rounded border border-white/10 grid place-items-center shrink-0"
                        style={{fontFamily: selected.family}}
                    >
                        Aa
                    </div>
                    <div className="min-w-0">
                        <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant">
                            Selected · {size}pt
                        </div>
                        <div className="text-code-sm text-on-surface truncate">
                            {selected.name}
                        </div>
                    </div>
                </div>
                <div className="lg:ml-auto flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant hidden md:inline">
                        적용 대상
                    </span>
                    <div className="inline-flex rounded border border-white/[0.06] bg-surface-container-lowest p-0.5">
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
                    <Button onClick={() => apply(selected)} title={target === "all" ? "선택한 폰트를 3개 터미널 모두에 한 번에 적용" : "선택한 터미널 하나에 이 폰트 적용"}>
                        <Icon name="cell_tower" className="text-[16px]" />
                        {target === "all" ? "모든 터미널에 적용" : "이 터미널에 적용"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function CategoryChip({
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

function FontRow({
    font,
    selected,
    favorite,
    size,
    onSelect,
    onFavorite
}: {
    font: FontEntry;
    selected: boolean;
    favorite: boolean;
    size: number;
    onSelect: () => void;
    onFavorite: () => void;
}) {
    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.target !== event.currentTarget) return;
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onSelect();
    }

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={handleKeyDown}
            className={cn(
                "w-full cursor-pointer text-left rounded-xl border p-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim/60",
                selected
                    ? "border-primary-fixed-dim/50 bg-primary-fixed-dim/[0.05]"
                    : "border-white/[0.06] bg-surface-container-lowest/60 hover:border-white/15"
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display text-title-md text-on-surface">
                            {font.name}
                        </span>
                        <span className="text-[11px] font-mono text-on-surface-variant">
                            · {font.author}
                        </span>
                    </div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                        {font.tags.slice(0, 4).map(t => (
                            <span
                                key={t}
                                className="text-[10px] font-mono uppercase tracking-[0.1em] text-on-surface-variant/70"
                            >
                                #{t}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="shrink-0 flex items-center gap-1">
                    <Link
                        to={`/fonts/${font.id}`}
                        onClick={e => e.stopPropagation()}
                        className="h-8 w-8 grid place-items-center rounded-md hover:bg-white/[0.08] text-on-surface-variant/50 hover:text-on-surface-variant"
                        aria-label={`${font.name} 자세히`}
                        title="자세히"
                    >
                        <Icon name="open_in_new" className="text-[14px]" />
                    </Link>
                    <button
                        type="button"
                        onClick={e => {
                            e.stopPropagation();
                            onFavorite();
                        }}
                        className="h-8 w-8 grid place-items-center rounded-md hover:bg-white/[0.08]"
                        aria-label="즐겨찾기"
                    >
                        <Icon
                            name="favorite"
                            className={cn(
                                "text-[18px]",
                                favorite ? "text-error" : "text-white/30 hover:text-white/60"
                            )}
                            fill={favorite}
                        />
                    </button>
                </div>
            </div>
            <div
                className="mt-3 text-on-surface truncate"
                style={{
                    fontFamily: font.family,
                    fontSize: `${size}px`,
                    lineHeight: 1.4
                }}
            >
                {PREVIEW_SAMPLES.english}
            </div>
        </div>
    );
}
