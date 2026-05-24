import {motion} from "framer-motion";
import {cn} from "@/lib/utils";
import type {RouteTheme} from "@/data/themes";
import {Icon} from "@/components/ui/Icon";

interface Props {
    theme: RouteTheme;
    active?: boolean;
    favorite?: boolean;
    onClick?: () => void;
    onFavorite?: () => void;
}

/** Mini terminal preview tile used in the Theme Center. */
export function ThemeCard({theme, active, favorite, onClick, onFavorite}: Props) {
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
                {/* favorite 버튼 자리 (있으면 차지, 없으면 0) */}
                {onFavorite && <span className="shrink-0 w-8" aria-hidden />}
            </button>

            {/* Favorite — 헤더 오버레이가 아닌 절대 위치하지만, w-8 자리를 헤더에 미리 비워둠 */}
            {onFavorite && (
                <button
                    type="button"
                    onClick={e => {
                        e.stopPropagation();
                        onFavorite();
                    }}
                    className="absolute top-1 right-1 h-8 w-8 grid place-items-center rounded-md hover:bg-white/[0.08] transition z-10"
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
                    <span style={{color: theme.accent}}>modified:</span> dlacrity
                </div>
                <div>
                    <span style={{color: theme.accent}}>modified:</span> tmux.conf
                </div>
            </button>

            {/* Palette dots — 고정 높이 */}
            <button
                type="button"
                onClick={onClick}
                className="w-full flex items-center gap-2 px-4 h-11 bg-surface-container-lowest border-t border-white/[0.05]"
            >
                {theme.palette16.slice(0, 8).map((c, i) => (
                    <span
                        key={i}
                        className="h-3.5 w-3.5 rounded-full border border-white/10 shrink-0"
                        style={{background: c}}
                    />
                ))}
            </button>
        </motion.div>
    );
}
