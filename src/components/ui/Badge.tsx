import type {HTMLAttributes} from "react";
import {cn} from "@/lib/utils";

type Tone = "default" | "active" | "info" | "warn" | "danger" | "muted";

const TONES: Record<Tone, string> = {
    default: "bg-white/[0.04] text-on-surface border-white/10",
    active:
        "bg-primary-fixed-dim/15 text-primary-fixed-dim border-primary-fixed-dim/30",
    info: "bg-secondary-fixed-dim/15 text-secondary-fixed-dim border-secondary-fixed-dim/30",
    warn: "bg-tertiary-fixed-dim/15 text-tertiary-fixed-dim border-tertiary-fixed-dim/30",
    danger: "bg-error/15 text-error border-error/30",
    muted: "bg-surface-container-low text-on-surface-variant border-white/[0.05]"
};

export function Badge({
    className,
    tone = "default",
    ...rest
}: HTMLAttributes<HTMLSpanElement> & {tone?: Tone}) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]",
                TONES[tone],
                className
            )}
            {...rest}
        />
    );
}

/** small live status dot */
export function StatusDot({tone = "active"}: {tone?: "active" | "warn" | "danger" | "muted"}) {
    const color = {
        active: "bg-primary-fixed-dim",
        warn: "bg-tertiary-fixed-dim",
        danger: "bg-error",
        muted: "bg-outline"
    }[tone];
    return (
        <span
            className={cn(
                "inline-block h-1.5 w-1.5 rounded-full",
                color,
                tone === "active" && "animate-pulse-dot shadow-[0_0_8px_rgba(0,229,91,0.6)]"
            )}
        />
    );
}
