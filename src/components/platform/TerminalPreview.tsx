import {useRef, useState, type KeyboardEvent} from "react";
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
    /** 1.0 = 기본 줄간격, 1.5 = 50% 더 띄움 */
    lineHeight?: number;
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

const BUS_FETCH = [
    "        ________________________________",
    "   ____/ BUS TERMINAL     001      ____\\",
    "  /  _   _   _   _   _   _   _    / ___|",
    " |  |_| |_| |_| |_| |_| |_| |_|  | |___ ",
    " |  ____________________________  |  ___|",
    " | |                            | | |    ",
    " | |  GHOSTTY EXPRESS           | | |    ",
    " | |  next stop: ~/.config      | | |    ",
    " | |____________________________| | |___ ",
    " |_________________________________|____|",
    "     ( O )                  ( O )       ",
    "      '-'                    '-'        "
];

/** 미리보기용 fake shell — 몇 가지 명령에 응답한다. */
function runFakeShell(cmd: string): string {
    const c = cmd.trim();
    if (!c) return "";
    if (c === "ls") return "Documents  Downloads  ghostty-config  init.lua  .zshrc";
    if (c === "pwd") return "/Users/buster";
    if (c === "whoami") return "buster";
    if (c === "date") return new Date().toString();
    if (c === "echo") return "";
    if (c.startsWith("echo ")) return c.slice(5);
    if (c === "help")
        return "available: ls, pwd, whoami, date, echo <text>, clear, neofetch";
    if (c === "neofetch") return "user@busterminal · ghostty · zsh 5.9";
    return `zsh: command not found: ${c}`;
}

const INFO = [
    "user@busterminal",
    "----------------",
    "OS: Bus Terminal x86_64",
    "Host: Gate 01 Neon Stand",
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
    lineHeight = 1.5,
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
    const inputRef = useRef<HTMLInputElement>(null);
    const [typed, setTyped] = useState("");
    const [history, setHistory] = useState<string[]>([]);

    // 커서 모양별 dimensions
    const cursorWidth = cursorStyle === "bar" ? "2px" : `${fontSize * 0.5}px`;
    const cursorHeight = cursorStyle === "underline" ? "2px" : `${fontSize}px`;
    const cursorAlign = cursorStyle === "underline" ? "self-end mb-0.5" : "self-center";

    function handleKey(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            const cmd = typed.trim();
            if (cmd === "clear") {
                setHistory([]);
            }
            else {
                setHistory(h => [...h, `$ ${typed}`, runFakeShell(cmd)]);
            }
            setTyped("");
        }
    }

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
                onClick={() => inputRef.current?.focus()}
                style={{
                    // blur는 backdrop-filter라 배경이 비쳐야 하는데 우리 미리보기는 단색이라
                    // 시각적 효과로 약간 saturated 처리 + 보더 글로우 추가.
                    background,
                    color: foreground,
                    fontFamily: `'${fontFamily}', ui-monospace, monospace`,
                    fontSize: `${fontSize}px`,
                    lineHeight,
                    padding: `${paddingY}px ${paddingX}px`,
                    opacity,
                    filter: blur ? "saturate(1.1)" : "none",
                    boxShadow: blur
                        ? "inset 0 0 0 1px rgba(255,255,255,0.04), inset 0 0 60px rgba(255,255,255,0.02)"
                        : "none"
                }}
                className="min-h-[420px] transition-colors cursor-text"
            >
                <div className="flex gap-2 items-center">
                    <span style={{color: cursor}}>user@busterminal:~$</span>
                    <span style={{color: foreground}}>neofetch</span>
                </div>
                <div className="flex gap-6 mt-3">
                    <pre
                        className="whitespace-pre"
                        style={{color: cursor, opacity: 0.85}}
                    >
                        {BUS_FETCH.join("\n")}
                    </pre>
                    <pre className="whitespace-pre" style={{color: foreground}}>
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

                {/* History (Enter로 입력한 라인들) */}
                {history.map((line, i) => (
                    <div
                        key={i}
                        className="whitespace-pre-wrap"
                        style={{color: line.startsWith("$") ? cursor : foreground, opacity: 0.85}}
                    >
                        {line}
                    </div>
                ))}

                {/* 실제 입력 가능한 프롬프트 */}
                <div className="flex gap-2 mt-2 items-end">
                    <span style={{color: cursor}}>user@busterminal:~$</span>
                    <input
                        ref={inputRef}
                        value={typed}
                        onChange={e => setTyped(e.target.value)}
                        onKeyDown={handleKey}
                        spellCheck={false}
                        autoComplete="off"
                        className="bg-transparent outline-none border-none p-0 m-0"
                        style={{
                            color: foreground,
                            fontFamily: "inherit",
                            fontSize: "inherit",
                            lineHeight: "inherit",
                            caretColor: "transparent",
                            width: `${Math.max(typed.length, 1)}ch`,
                            minWidth: "1ch"
                        }}
                        aria-label="terminal-input"
                    />
                    <span
                        className={cn(
                            "inline-block shrink-0",
                            cursorAlign,
                            cursorBlink && "animate-cursor-blink"
                        )}
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
