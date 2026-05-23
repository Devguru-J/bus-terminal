/**
 * 승차 미리보기 — Ghostty/터미널 창을 흉내낸 라이브 미리보기.
 * 색상/폰트/패딩 변경이 실시간 반영.
 */
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
    title = "ghostty — zsh"
}: Props) {
    const lines = [
        {prefix: "❯", text: "neofetch | head"},
        {prefix: " ", text: "OS: macOS 15 · Shell: zsh", muted: true},
        {prefix: "❯", text: "bun dev"},
        {prefix: " ", text: "VITE v5  ready in 312 ms"},
        {prefix: " ", text: "▸ Local:   http://localhost:5173/", muted: true},
        {prefix: "❯", text: "git status", selected: true},
        {prefix: " ", text: "On branch main · nothing to commit", muted: true},
        {prefix: "❯", text: ""}
    ];

    return (
        <div className="rounded-xl2 overflow-hidden border border-line-strong shadow-glass">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-ink-700/80 border-b border-line">
                <span className="h-3 w-3 rounded-full bg-led-red/80" />
                <span className="h-3 w-3 rounded-full bg-led-amber/80" />
                <span className="h-3 w-3 rounded-full bg-led-green/80" />
                <span className="ml-3 text-[11px] text-white/40 font-mono">{title}</span>
            </div>
            <div
                style={{
                    background: background,
                    color: foreground,
                    fontFamily: `${fontFamily}, ui-monospace, monospace`,
                    fontSize: `${fontSize}px`,
                    padding: `${paddingY}px ${paddingX}px`,
                    opacity
                }}
                className="min-h-[260px] leading-relaxed transition-colors"
            >
                {lines.map((l, i) => (
                    <div key={i} className="flex gap-2">
                        <span style={{color: cursor, opacity: 0.9}} className="select-none">
                            {l.prefix}
                        </span>
                        {l.selected ? (
                            <span
                                style={{background: selectionBg, color: selectionFg}}
                                className="rounded px-1"
                            >
                                {l.text}
                            </span>
                        ) : (
                            <span style={{opacity: l.muted ? 0.6 : 1}}>{l.text}</span>
                        )}
                        {i === lines.length - 1 && (
                            <span
                                className="inline-block w-[0.55em] animate-blink"
                                style={{background: cursor, height: `${fontSize}px`}}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
