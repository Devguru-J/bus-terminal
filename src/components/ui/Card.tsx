import {forwardRef, type HTMLAttributes} from "react";
import {cn} from "@/lib/utils";

/**
 * Surface card aligned to Stitch v2 design.
 * Default = surface-container (#201f1f) with thin outline-variant edge.
 */
export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({className, ...rest}, ref) => (
        <div
            ref={ref}
            className={cn(
                "rounded-xl bg-surface-container-low/60 border border-white/[0.06] backdrop-blur-md",
                className
            )}
            {...rest}
        />
    )
);
Card.displayName = "Card";

export function CardHeader({className, ...rest}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex items-center justify-between gap-3 px-5 py-3 border-b border-white/[0.06]",
                className
            )}
            {...rest}
        />
    );
}

export function CardTitle({className, ...rest}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "font-mono text-label-xs uppercase tracking-[0.15em] text-primary-fixed-dim",
                className
            )}
            {...rest}
        />
    );
}

export function CardBody({className, ...rest}: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-5", className)} {...rest} />;
}
