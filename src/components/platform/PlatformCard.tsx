import {useRef, type MouseEvent} from "react";
import {Link} from "react-router-dom";
import {motion} from "framer-motion";
import {Icon} from "@/components/ui/Icon";
import {Badge} from "@/components/ui/Badge";

interface Props {
    platformNo: string; // "01"
    title: string;
    description: string;
    to: string;
    icon: string;
    departure: string; // "14:00 DEPART"
    snippet: string; // "> ghostty --config"
    status?: "active" | "ready" | "soon";
}

const STATUS_META = {
    active: {tone: "active" as const, label: "Active"},
    ready: {tone: "info" as const, label: "Ready"},
    soon: {tone: "muted" as const, label: "Soon"}
};

/** Departure platform card for the home FIDS grid. */
export function PlatformCard({
    platformNo,
    title,
    description,
    to,
    icon,
    departure,
    snippet,
    status = "ready"
}: Props) {
    const meta = STATUS_META[status];
    const ref = useRef<HTMLDivElement>(null);

    // Spotlight: 마우스 위치를 CSS 변수로 직접 기록 (React state 없음 → 리렌더 없음)
    function handleMove(e: MouseEvent<HTMLAnchorElement>) {
        const r = ref.current;
        if (!r) return;
        const rect = r.getBoundingClientRect();
        r.style.setProperty("--sx", `${e.clientX - rect.left}px`);
        r.style.setProperty("--sy", `${e.clientY - rect.top}px`);
    }

    return (
        <Link
            to={to}
            className="group"
            onMouseMove={handleMove as never}
        >
            <motion.article
                ref={ref}
                whileHover={{y: -3}}
                transition={{type: "spring", stiffness: 220, damping: 22}}
                className="relative rounded-xl border border-white/[0.06] bg-surface-container-low/60 backdrop-blur-md p-5 h-full overflow-hidden flex flex-col gap-4"
            >
                {/* Spotlight refraction — 커서 위치 기반 라디얼 그래디언트 */}
                <div
                    aria-hidden
                    className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                        background:
                            "radial-gradient(380px circle at var(--sx, 50%) var(--sy, 0%), rgba(0,229,91,0.10), transparent 55%)"
                    }}
                />
                {/* Top edge accent line */}
                <div
                    aria-hidden
                    className="absolute -top-px left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                        background:
                            "linear-gradient(to right, transparent, rgba(0,229,91,0.5), transparent)"
                    }}
                />
                {/* Inner edge refraction (glassmorphism polish) */}
                <div
                    aria-hidden
                    className="absolute inset-0 rounded-xl pointer-events-none border border-white/[0.04]"
                    style={{boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)"}}
                />
                <header className="flex items-start justify-between">
                    <span className="font-mono text-label-xs uppercase tracking-[0.18em] text-on-surface-variant">
                        Platform {platformNo}
                    </span>
                    <span className="font-mono text-label-xs uppercase tracking-[0.18em] text-primary-fixed-dim">
                        {departure}
                    </span>
                </header>

                <div className="flex items-center gap-2">
                    <Icon
                        name={icon}
                        fill
                        className="text-[26px] text-primary-fixed-dim"
                    />
                    <h3 className="font-display text-headline-sm text-on-surface tracking-tight">
                        {title}
                    </h3>
                </div>
                <p className="text-body-md text-on-surface-variant leading-relaxed line-clamp-2">
                    {description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.05]">
                    <span className="font-mono text-code-sm text-primary-fixed-dim/90 truncate">
                        {snippet}
                    </span>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                </div>
            </motion.article>
        </Link>
    );
}
