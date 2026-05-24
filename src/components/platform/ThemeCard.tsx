import {motion} from "framer-motion";
import {Link} from "react-router-dom";
import {cn} from "@/lib/utils";
import type {RouteTheme} from "@/data/themes";
import {Icon} from "@/components/ui/Icon";

interface Props {
    theme: RouteTheme;
    active?: boolean;
    favorite?: boolean;
    /** 사용자가 import한 테마인지 — 뱃지 표시 */
    imported?: boolean;
    /** 디테일 페이지로 가는 경로 (지정 시 카드에 ↗ 버튼 표시) */
    detailTo?: string;
    onClick?: () => void;
    onFavorite?: () => void;
    /** 사용자 테마 삭제 — 지정 시 카드 하단에 작은 삭제 버튼 표시 */
    onDelete?: () => void;
}

/** Mini terminal preview tile used in the Theme Center. */
export function ThemeCard({theme, active, favorite, imported, detailTo, onClick, onFavorite, onDelete}: Props) {
    return (
        <motion.div
            whileHover={{y: -2}}
            transition={{type: "spring", stiffness: 320, damping: 24}}
            className={cn(
                "group relative text-left rounded-xl overflow-hidden border transition",
                active
                    ? "border-primary-fixed-dim/60 shadow-glow-soft"
                    : "border-white/[0.06] hover:border-white/15"
            )}
        >
            {/* Header — 고정 높이 + truncation */}
            <button
                type="button"
                onClick={onClick}
                className={cn(
                    "w-full flex items-center gap-2 px-4 h-10 border-b text-left",
                    active
                        ? "bg-primary-fixed-dim/15 border-primary-fixed-dim/30"
                        : "bg-surface-container border-white/[0.05]"
                )}
            >
                <span
                    className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        active ? "bg-primary-fixed-dim" : "bg-on-surface-variant/40"
                    )}
                />
                <span
                    className={cn(
                        "font-mono text-label-xs uppercase tracking-[0.14em] truncate min-w-0",
                        active ? "text-primary-fixed-dim" : "text-on-surface-variant"
                    )}
                    title={theme.ko}
                >
                    {theme.ko}
                    {active && " (Active)"}
                </span>
                {/* 우상단 액션 영역 placeholder */}
                {(onFavorite || detailTo) && (
                    <span
                        className="shrink-0"
                        style={{width: `${(onFavorite ? 32 : 0) + (detailTo ? 32 : 0)}px`}}
                        aria-hidden
                    />
                )}
            </button>

            {/* 우상단 액션 — 헤더 placeholder에 정확히 들어감 */}
            <div className="absolute top-1 right-1 z-10 flex items-center">
                {detailTo && (
                    <Link
                        to={detailTo}
                        className="h-8 w-8 grid place-items-center rounded-md hover:bg-white/[0.08] transition text-on-surface-variant/50 hover:text-on-surface-variant"
                        aria-label={`${theme.ko} 자세히 보기`}
                        title="자세히"
                        onClick={e => e.stopPropagation()}
                    >
                        <Icon name="open_in_new" className="text-[14px]" />
                    </Link>
                )}
                {onFavorite && (
                    <button
                        type="button"
                        onClick={e => {
                            e.stopPropagation();
                            onFavorite();
                        }}
                        className="h-8 w-8 grid place-items-center rounded-md hover:bg-white/[0.08] transition"
                        aria-label={favorite ? "즐겨찾기 해제" : "즐겨찾기"}
                    >
                        <Icon
                            name="favorite"
                            className={cn(
                                "text-[16px]",
                                favorite
                                    ? "text-error"
                                    : "text-on-surface-variant/50 group-hover:text-on-surface-variant"
                            )}
                            fill={favorite}
                        />
                    </button>
                )}
            </div>

            {/* Preview surface — 고정 높이 */}
            <button
                type="button"
                onClick={onClick}
                className="w-full block text-left px-4 py-4 font-mono text-[12px] leading-relaxed h-[180px]"
                style={{background: theme.background, color: theme.foreground}}
            >
                <div>
                    <span style={{color: theme.accent}}>❯</span> git status
                </div>
                <div style={{opacity: 0.6}}>On branch main</div>
                <div style={{opacity: 0.6}}>Your branch is up to date with</div>
                <div style={{opacity: 0.6}}>&nbsp;'origin/main'</div>
                <div className="mt-2">Changes to be committed:</div>
                <div className="ml-3" style={{opacity: 0.55}}>
                    (use{" "}
                    <span
                        style={{background: theme.selectionBg, color: theme.selectionFg}}
                        className="rounded px-1"
                    >
                        git restore --staged
                    </span>
                    )
                </div>
                <div className="mt-1">
                    <span style={{color: theme.accent}}>modified:</span> alacritty
                </div>
                <div>
                    <span style={{color: theme.accent}}>modified:</span> tmux.conf
                </div>
            </button>

            {/* Palette dots — 고정 높이 */}
            <div className="flex items-center gap-2 px-4 h-11 bg-surface-container-lowest border-t border-white/[0.05]">
                <button
                    type="button"
                    onClick={onClick}
                    className="flex items-center gap-2 flex-1 min-w-0"
                >
                    {theme.palette16.slice(0, 8).map((c, i) => (
                        <span
                            key={i}
                            className="h-3.5 w-3.5 rounded-full border border-white/10 shrink-0"
                            style={{background: c}}
                        />
                    ))}
                </button>
                {imported && (
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-tertiary-fixed-dim px-1.5 py-0.5 rounded border border-tertiary-fixed-dim/30 bg-tertiary-fixed-dim/10">
                        imported
                    </span>
                )}
                {onDelete && (
                    <button
                        type="button"
                        onClick={e => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="h-6 w-6 grid place-items-center rounded text-on-surface-variant/50 hover:text-error hover:bg-error/10"
                        aria-label="사용자 테마 삭제"
                        title="삭제"
                    >
                        <Icon name="delete" className="text-[14px]" />
                    </button>
                )}
            </div>
        </motion.div>
    );
}
