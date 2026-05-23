import type {ReactNode} from "react";
import {StatusDot} from "@/components/ui/Badge";

interface Props {
    title: string;
    /** Small uppercase eyebrow (e.g. "PLATFORM 1 ACTIVE"). */
    eyebrow?: string;
    /** Optional description under title. */
    subtitle?: ReactNode;
    /** Right-aligned actions (buttons). */
    actions?: ReactNode;
}

/** Page header shared across station screens. */
export function StationHeader({title, eyebrow, subtitle, actions}: Props) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
            <div className="min-w-0">
                {eyebrow && (
                    <div className="inline-flex items-center gap-2 mb-3">
                        <StatusDot />
                        <span className="font-mono text-label-xs uppercase tracking-[0.16em] text-primary-fixed-dim">
                            {eyebrow}
                        </span>
                    </div>
                )}
                <h1 className="font-display text-display-md text-on-surface tracking-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="mt-2 text-body-md text-on-surface-variant max-w-2xl">
                        {subtitle}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    {actions}
                </div>
            )}
        </div>
    );
}
