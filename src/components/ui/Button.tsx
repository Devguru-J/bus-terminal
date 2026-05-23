import {forwardRef, type ButtonHTMLAttributes} from "react";
import {cn} from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
}

const variants: Record<Variant, string> = {
    primary:
        "bg-led-green text-ink-900 hover:bg-led-green/90 shadow-[0_8px_24px_-8px_rgba(0,224,164,0.6)]",
    ghost: "bg-white/5 text-white hover:bg-white/10",
    outline:
        "border border-line-strong bg-transparent text-white hover:bg-white/5",
    danger: "bg-led-red/90 text-white hover:bg-led-red"
};

const sizes: Record<Size, string> = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base"
};

export const Button = forwardRef<HTMLButtonElement, Props>(
    ({className, variant = "primary", size = "md", ...rest}, ref) => (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed",
                variants[variant],
                sizes[size],
                className
            )}
            {...rest}
        />
    )
);
Button.displayName = "Button";
