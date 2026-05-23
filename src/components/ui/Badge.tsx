import type {HTMLAttributes} from "react";
import {cn} from "@/lib/utils";

export function Badge({
    className,
    tone = "default",
    ...rest
}: HTMLAttributes<HTMLSpanElement> & {tone?: "default" | "green" | "amber" | "blue" | "red"}) {
    const tones: Record<string, string> = {
        default: "bg-white/8 text-white/70 border-white/10",
        green: "bg-led-green/10 text-led-green border-led-green/30",
        amber: "bg-led-amber/10 text-led-amber border-led-amber/30",
        blue: "bg-led-blue/10 text-led-blue border-led-blue/30",
        red: "bg-led-red/10 text-led-red border-led-red/30"
    };
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase",
                tones[tone],
                className
            )}
            {...rest}
        />
    );
}
