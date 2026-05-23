import {motion} from "framer-motion";
import {cn} from "@/lib/utils";

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
    /** "block" | "bar" | "underline" — 커서 모양을 시각적으로 반영 */
    cursorStyle?: "block" | "bar" | "underline";
    /** true면 커서가 깜빡임 */
    cursorBlink?: boolean;
    /** true면 backdrop-filter 적용 */
    blur?: boolean;
    /** true면 macOS 신호등(타이틀바) 자체를 숨김 */
    hideTitlebar?: boolean;
    /** "top" | "bottom" | "none" — 탭 스트립 표시 위치 */
    tabPosition?: "top" | "bottom" | "none";
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
    title = "user@busterminal — ghostty",
    cursorStyle = "block",
    cursorBlink = true,
    blur = false,
    hideTitlebar = false,
    tabPosition = "none"
}: Props) {
    // 커서 모양별 dimensions
    const cursorWidth = cursorStyle === "bar" ? "2px" : `${fontSize * 0.5}px`;
    const cursorHeight = cursorStyle === "underline" ? "2px" : `${fontSize}px`;
    const cursorAlign = cursorStyle === "underline" ? "self-end mt-1" : "self-center";

    const tabs = (
        <div
            className="flex items-center gap-2 px-3 py-1.5 border-white/10"
            style={{
                background: "rgba(0,0,0,0.4)",
                borderTopWidth: tabPosition === "bottom" ? 1 : 0,
                borderBottomWidth: tabPosition === "top" ? 1 : 0
            }}
        >
            <span
                style={{color: cursor, opacity: 0.9}}
                className="font-mono text-[11px] px-2 py-0.5 rounded"
            >
                ● user@busterminal
            </span>
            <span className="font-mono text-[11px] text-on-surface-variant/50">+</span>
        </div>
    );

    return (
        <motion.div
            layout
            className="rounded-xl overflow-hidden border border-white/[0.08] shadow-glow-soft"
        >
            {/* macOS chrome */}
            {!hideTitlebar && (
                <div className="flex items-center gap-2 px-4 py-2 bg-surface-container border-b border-white/[0.06]">
                    <span className="h-3 w-3 rounded-full bg-error/80" />
                    <span className="h-3 w-3 rounded-full bg-tertiary-fixed-dim/80" />
                    <span className="h-3 w-3 rounded-full bg-primary-fixed-dim/80" />
                    <span className="ml-3 font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant">
                        {title}
                    </span>
                </div>
            )}

            {tabPosition === "top" && tabs}

            {/* terminal canvas */}
            <div
                style={{
                    // blur는 backdrop-filter라 배경이 비쳐야 하는데 우리 미리보기는 단색이라
                    // 시각적 효과로 약간 saturated 처리 + 보더 글로우 추가.
                    background,
                    color: foreground,
                    fontFamily: `${fontFamily}, ui-monospace, monospace`,
                    fontSize: `${fontSize}px`,
                    padding: `${paddingY}px ${paddingX}px`,
                    opacity,
                    filter: blur ? "saturate(1.1)" : "none",
                    boxShadow: blur
                        ? "inset 0 0 0 1px rgba(255,255,255,0.04), inset 0 0 60px rgba(255,255,255,0.02)"
                        : "none"
                }}
                className="min-h-[420px] leading-relaxed transition-colors"
            >
                <div className="flex gap-2 items-center">
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
                <div className="flex gap-2 mt-2 items-end">
                    <span style={{color: cursor}}>user@busterminal:~$</span>
                    <span
                        className={cn("inline-block", cursorAlign, cursorBlink && "animate-flicker")}
                        style={{
                            background: cursor,
                            width: cursorWidth,
                            height: cursorHeight,
                            opacity: cursorStyle === "block" ? 0.85 : 1
                        }}
                    />
                </div>
            </div>

            {tabPosition === "bottom" && tabs}
        </motion.div>
    );
}
