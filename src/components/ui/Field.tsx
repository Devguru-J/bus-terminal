import type {
    InputHTMLAttributes,
    SelectHTMLAttributes,
    TextareaHTMLAttributes,
    ReactNode
} from "react";
import {cn} from "@/lib/utils";

const FIELD =
    "w-full h-10 rounded bg-surface-container-lowest border border-white/[0.06] px-3 text-code-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none transition focus:border-primary-fixed-dim/60 focus:bg-surface-container-low";

export function Label({
    children,
    hint,
    help
}: {
    children: ReactNode;
    hint?: ReactNode;
    help?: string;
}) {
    return (
        <div className="mb-2 flex items-baseline justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant">
                <span>{children}</span>
                {help && <HelpTip text={help} />}
            </span>
            {hint && (
                <span className="font-mono text-[10px] text-on-surface-variant/50">
                    {hint}
                </span>
            )}
        </div>
    );
}

export function HelpTip({text}: {text: string}) {
    return (
        <span className="relative inline-flex group align-middle">
            <button
                type="button"
                aria-label={text}
                className="grid h-4 w-4 place-items-center rounded-full border border-white/15 bg-white/[0.03] text-[10px] leading-none text-on-surface-variant/70 transition hover:border-primary-fixed-dim/50 hover:text-primary-fixed-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim"
            >
                ?
            </button>
            <span className="pointer-events-none absolute left-1/2 top-6 z-50 w-64 -translate-x-1/2 rounded-lg border border-white/10 bg-surface-container-highest px-3 py-2 text-left font-body text-[12px] normal-case leading-relaxed tracking-normal text-on-surface opacity-0 shadow-glow-soft transition group-hover:opacity-100 group-focus-within:opacity-100">
                {text}
            </span>
        </span>
    );
}

export function TextInput({className, ...rest}: InputHTMLAttributes<HTMLInputElement>) {
    return <input className={cn(FIELD, "font-mono", className)} {...rest} />;
}

export function NumberInput({className, ...rest}: InputHTMLAttributes<HTMLInputElement>) {
    return <input type="number" className={cn(FIELD, "font-mono", className)} {...rest} />;
}

export function Select({className, children, ...rest}: SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            className={cn(FIELD, "pr-8 appearance-none font-mono", className)}
            {...rest}
        >
            {children}
        </select>
    );
}

export function Textarea({
    className,
    ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            className={cn(
                FIELD,
                "h-auto min-h-[160px] py-3 font-mono text-[12.5px] leading-relaxed",
                className
            )}
            {...rest}
        />
    );
}

export function Toggle({
    checked,
    onChange,
    label
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label?: string;
}) {
    return (
        <label className="inline-flex items-center gap-3 cursor-pointer select-none">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative h-6 w-11 rounded-full transition",
                    checked ? "bg-primary-fixed-dim" : "bg-white/10"
                )}
            >
                <span
                    className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-on-primary shadow transition-all",
                        checked ? "left-[22px]" : "left-0.5"
                    )}
                />
            </button>
            {label && (
                <span className="font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant">
                    {label}
                </span>
            )}
        </label>
    );
}

export function ColorInput({
    value,
    onChange
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <input
                type="color"
                value={value || "#000000"}
                onChange={e => onChange(e.target.value)}
                className="h-10 w-12 rounded border border-white/[0.06] bg-surface-container-lowest cursor-pointer"
            />
            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                className={cn(FIELD, "font-mono text-[12.5px]")}
            />
        </div>
    );
}

export function RangeInput({
    value,
    min,
    max,
    step,
    onChange,
    suffix
}: {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (v: number) => void;
    suffix?: string;
}) {
    return (
        <div className="flex items-center gap-3 min-w-0">
            <input
                type="range"
                min={min}
                max={max}
                step={step ?? 1}
                value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="flex-1 min-w-0 h-1 rounded-full bg-white/10 appearance-none accent-primary-fixed-dim cursor-pointer"
            />
            <span className="font-mono text-code-sm text-on-surface w-12 text-right shrink-0 tabular-nums">
                {value}
                {suffix}
            </span>
        </div>
    );
}

/** Segmented control (e.g. Top / Bottom) */
export function Segmented<T extends string>({
    value,
    onChange,
    options
}: {
    value: T;
    onChange: (v: T) => void;
    options: Array<{value: T; label: string}>;
}) {
    return (
        <div className="inline-flex items-center rounded border border-white/[0.06] bg-surface-container-lowest p-0.5">
            {options.map(o => {
                const active = o.value === value;
                return (
                    <button
                        key={o.value}
                        type="button"
                        onClick={() => onChange(o.value)}
                        className={cn(
                            "h-8 px-3 rounded-[2px] font-mono text-label-xs uppercase tracking-[0.12em] transition",
                            active
                                ? "bg-primary-fixed-dim text-on-primary"
                                : "text-on-surface-variant hover:text-on-surface"
                        )}
                    >
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
}
