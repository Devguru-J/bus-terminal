import {motion} from "framer-motion";

interface Props {
    background: string;
    foreground: string;
    cursor: string;
    selectionBg: string;
    selectionFg: string;
    fontFamily: string;
    fontSize: number;
    paddingX: number;
    paddingY: number;
    opacity: number;
    title?: string;
}

const NEOFETCH = [
    "             :h@@@@$@y.",
    "         .h$$@$@$@$$@$$y.",
    "      .y$$$@$@$@$$$@$@$$y.",
    "    .y$$$$@@@@$@@@@$@@@$$$y.",
    "   y$$$$@@@$@@$@$@@$@$@$$$$$y",
    "  yyyyy@@$@$@@$@$@$@$@$@yyyyy",
    "  o$$$$$@$@$$@@$$@@$@$@$$$$$o",
    "  d$$$$$$$$@$@@$@$@$@$$$$$$$h",
    "  o$$$$@$ydyyyy@$@$@ydyyyy$$o",
    "   d$$$$$y    yyyo    y$$$$h",
    "    .yyyyy.     ..    yyyyy.",
    "      .yyyy. ... ... .yyyy.",
    "         .yyyy.     .yyyy.",
    "             ..yyyy.."
];

const INFO = [
    "user@busterminal",
    "----------------",
    "OS: Ghostty OS x86_64",
    "Host: FIDS Terminal Pro",
    "Kernel: 6.8.0-1-transit",
    "Uptime: 90 days, 23 hours",
    "Packages: 2048 (dpkg)",
    "Shell: zsh 5.9",
    "Terminal: ghostty",
    "Theme: BusTerminal Dark",
    "Memory: 4096MiB / 32768MiB"
];

/** Realistic neofetch-style preview that responds to theme changes. */
export function TerminalPreview({
    background,
    foreground,
    cursor,
    selectionBg,
    selectionFg,
    fontFamily,
    fontSize,
    paddingX,
    paddingY,
    opacity,
    title = "user@busterminal — ghostty"
}: Props) {
    return (
        <motion.div
            layout
            className="rounded-xl overflow-hidden border border-white/[0.08] shadow-glow-soft"
        >
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-container border-b border-white/[0.06]">
                <span className="h-3 w-3 rounded-full bg-error/80" />
                <span className="h-3 w-3 rounded-full bg-tertiary-fixed-dim/80" />
                <span className="h-3 w-3 rounded-full bg-primary-fixed-dim/80" />
                <span className="ml-3 font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant">
                    {title}
                </span>
            </div>
            <div
                style={{
                    background,
                    color: foreground,
                    fontFamily: `${fontFamily}, ui-monospace, monospace`,
                    fontSize: `${fontSize}px`,
                    padding: `${paddingY}px ${paddingX}px`,
                    opacity
                }}
                className="min-h-[420px] leading-relaxed transition-colors"
            >
                <div className="flex gap-2">
                    <span style={{color: cursor}}>user@busterminal:~$</span>
                    <span style={{color: foreground}}>neofetch</span>
                </div>
                <div className="flex gap-6 mt-3">
                    <pre
                        className="whitespace-pre"
                        style={{color: cursor, opacity: 0.85, lineHeight: 1.15}}
                    >
                        {NEOFETCH.join("\n")}
                    </pre>
                    <pre
                        className="whitespace-pre"
                        style={{color: foreground, lineHeight: 1.5}}
                    >
                        {INFO.join("\n")}
                    </pre>
                </div>
                <div className="flex gap-2 mt-4 items-center">
                    <span style={{color: cursor}}>user@busterminal:~$</span>
                    <span
                        style={{background: selectionBg, color: selectionFg}}
                        className="rounded px-1"
                    >
                        ls
                    </span>
                </div>
                <div className="flex gap-2 mt-2 items-center">
                    <span style={{color: cursor}}>user@busterminal:~$</span>
                    <span
                        className="inline-block w-[0.55em] animate-flicker"
                        style={{background: cursor, height: `${fontSize}px`}}
                    />
                </div>
            </div>
        </motion.div>
    );
}
