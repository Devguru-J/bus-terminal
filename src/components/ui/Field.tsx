import type {InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode} from "react";
import {cn} from "@/lib/utils";

const fieldBase =
    "w-full h-10 rounded-xl bg-ink-700/80 border border-line px-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-led-green/70 focus:bg-ink-700";

export function Label({children, hint}: {children: ReactNode; hint?: string}) {
    return (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <span className="text-xs font-medium text-white/70">{children}</span>
            {hint && <span className="text-[10px] text-white/35">{hint}</span>}
        </div>
    );
}

export function TextInput({className, ...rest}: InputHTMLAttributes<HTMLInputElement>) {
    return <input className={cn(fieldBase, className)} {...rest} />;
}

export function NumberInput({className, ...rest}: InputHTMLAttributes<HTMLInputElement>) {
    return <input type="number" className={cn(fieldBase, className)} {...rest} />;
}

export function Select({className, children, ...rest}: SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select className={cn(fieldBase, "pr-8 appearance-none", className)} {...rest}>
            {children}
        </select>
    );
}

export function Textarea({className, ...rest}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            className={cn(
                fieldBase,
                "h-auto min-h-[160px] py-3 font-mono text-[12.5px] leading-relaxed",
                className
            )}
            {...rest}
        />
    );
}

export function Toggle({checked, onChange, label}: {checked: boolean; onChange: (v: boolean) => void; label?: string}) {
    return (
        <label className="inline-flex items-center gap-3 cursor-pointer select-none">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative h-6 w-11 rounded-full transition",
                    checked ? "bg-led-green" : "bg-white/10"
                )}
            >
                <span
                    className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                        checked ? "left-[22px]" : "left-0.5"
                    )}
                />
            </button>
            {label && <span className="text-sm text-white/80">{label}</span>}
        </label>
    );
}

export function ColorInput({value, onChange}: {value: string; onChange: (v: string) => void}) {
    return (
        <div className="flex items-center gap-2">
            <input
                type="color"
                value={value || "#000000"}
                onChange={e => onChange(e.target.value)}
                className="h-10 w-12 rounded-xl border border-line bg-ink-700 cursor-pointer"
            />
            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                className={cn(fieldBase, "font-mono text-xs")}
            />
        </div>
    );
}
