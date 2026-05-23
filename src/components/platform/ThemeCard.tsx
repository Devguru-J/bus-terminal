import {motion} from "framer-motion";
import {cn} from "@/lib/utils";
import type {RouteTheme} from "@/data/themes";

interface Props {
    theme: RouteTheme;
    active?: boolean;
    onClick?: () => void;
}

/** Mini terminal preview tile used in the Theme Center. */
export function ThemeCard({theme, active, onClick}: Props) {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            whileHover={{y: -2}}
            transition={{type: "spring", stiffness: 320, damping: 24}}
            className={cn(
                "group text-left rounded-xl overflow-hidden border transition",
                active
                    ? "border-primary-fixed-dim/60 shadow-glow-soft"
                    : "border-white/[0.06] hover:border-white/15"
            )}
        >
            {/* Header */}
            <div
                className={cn(
                    "flex items-center justify-between px-4 py-2 border-b",
                    active
                        ? "bg-primary-fixed-dim/15 border-primary-fixed-dim/30"
                        : "bg-surface-container border-white/[0.05]"
                )}
            >
                <span
                    className={cn(
                        "font-mono text-label-xs uppercase tracking-[0.16em]",
                        active ? "text-primary-fixed-dim" : "text-on-surface-variant"
                    )}
                >
                    ● {theme.ko} {active && "(Active)"}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-on-surface-variant/60">
                    {theme.id}
                </span>
            </div>

            {/* Preview surface */}
            <div
                className="px-4 py-4 font-mono text-[12px] leading-relaxed h-[180px]"
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
            </div>

            {/* Palette dots */}
            <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-lowest border-t border-white/[0.05]">
                {theme.palette16.slice(0, 8).map((c, i) => (
                    <span
                        key={i}
                        className="h-3.5 w-3.5 rounded-full border border-white/10"
                        style={{background: c}}
                    />
                ))}
            </div>
        </motion.button>
    );
}
