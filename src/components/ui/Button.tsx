import {forwardRef, type ButtonHTMLAttributes} from "react";
import {cn} from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
}

const VARIANTS: Record<Variant, string> = {
    primary:
        "bg-primary-fixed-dim text-on-primary hover:bg-primary-fixed shadow-glow-primary",
    outline:
        "border border-white/10 bg-white/[0.02] text-on-surface hover:bg-white/[0.06]",
    ghost: "text-on-surface-variant hover:text-on-surface hover:bg-white/5",
    danger: "bg-error/90 text-on-error hover:bg-error"
};

const SIZES: Record<Size, string> = {
    sm: "h-8 px-3 text-[11px] tracking-[0.08em] uppercase font-semibold",
    md: "h-10 px-4 text-[11px] tracking-[0.08em] uppercase font-semibold",
    lg: "h-12 px-6 text-[11px] tracking-[0.1em] uppercase font-semibold"
};

export const Button = forwardRef<HTMLButtonElement, Props>(
    ({className, variant = "primary", size = "md", ...rest}, ref) => (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded font-mono transition active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                VARIANTS[variant],
                SIZES[size],
                className
            )}
            {...rest}
        />
    )
);
Button.displayName = "Button";
