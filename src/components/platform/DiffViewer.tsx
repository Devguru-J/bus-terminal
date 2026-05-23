import {cn} from "@/lib/utils";

export interface DiffLine {
    n: number;
    type: "context" | "remove" | "add";
    text: string;
}

interface Props {
    title: string;
    filename: string;
    lines: DiffLine[];
}

const TONE = {
    context: "",
    remove: "bg-error/10 border-l-2 border-error/60",
    add: "bg-primary-fixed-dim/10 border-l-2 border-primary-fixed-dim/60"
};

const SIGN = {
    context: " ",
    remove: "-",
    add: "+"
};

const TEXT = {
    context: "text-on-surface-variant",
    remove: "text-error",
    add: "text-primary-fixed-dim"
};

export function DiffViewer({title, filename, lines}: Props) {
    return (
        <div className="rounded-xl border border-white/[0.06] bg-surface-container-low/60 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-surface-container">
                <span className="font-mono text-label-xs uppercase tracking-[0.14em] text-primary-fixed-dim">
                    ● {title}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-on-surface-variant/60">
                    {filename}
                </span>
            </div>
            <div className="font-mono text-[12.5px] leading-[1.6]">
                {lines.map((l, i) => (
                    <div
                        key={i}
                        className={cn(
                            "grid grid-cols-[40px_16px_1fr] items-center pr-3",
                            TONE[l.type]
                        )}
                    >
                        <span className="text-right pr-3 text-on-surface-variant/50 select-none">
                            {l.n}
                        </span>
                        <span className={cn("select-none", TEXT[l.type])}>{SIGN[l.type]}</span>
                        <span className={TEXT[l.type]}>{l.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
