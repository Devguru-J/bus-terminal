import {motion} from "framer-motion";
import type {TmuxStatusConfig} from "@/data/tmux";

interface Props {
    config: TmuxStatusConfig;
}

/** 사용자 status-style "bg=#XXX,fg=#XXX" 파싱 */
function parseStyle(style: string): {bg: string; fg: string} {
    const pairs = style.split(",").map(s => s.trim());
    const out: Record<string, string> = {};
    for (const p of pairs) {
        const eq = p.indexOf("=");
        if (eq < 0) continue;
        out[p.slice(0, eq).trim()] = p.slice(eq + 1).trim();
    }
    return {
        bg: out.bg || "#1e1e2e",
        fg: out.fg || "#cdd6f4"
    };
}

/**
 * tmux 상태바 라이브 미리보기.
 * statusPosition / statusStyle / segments / prefix / mouse 모두 반영.
 */
export function TmuxPreview({config}: Props) {
    const {bg, fg} = parseStyle(config.statusStyle);
    const statusBar = (
        <motion.div
            layout
            className="flex items-center justify-between gap-3 px-3 py-1.5 font-mono text-[12px]"
            style={{background: bg, color: fg}}
        >
            <span dangerouslySetInnerHTML={{__html: renderSegments(config.leftSegments)}} />
            <span className="text-on-surface-variant/50 text-[11px]">
                win-1 · win-2 · win-3
            </span>
            <span dangerouslySetInnerHTML={{__html: renderSegments(config.rightSegments)}} />
        </motion.div>
    );

    return (
        <div className="rounded-lg bg-[#0e0e0e] border border-white/10 overflow-hidden font-mono text-[12px]">
            {config.statusPosition === "top" && statusBar}
            <div className="p-4 text-on-surface/80 min-h-[260px]">
                <div className="opacity-60"># 활성 세션: dev</div>
                <div>
                    <span className="text-primary-fixed-dim">$</span> prefix ={" "}
                    <span className="text-tertiary-fixed-dim">{config.prefix}</span>
                </div>
                <div>
                    <span className="text-primary-fixed-dim">$</span> mouse ={" "}
                    <span className="text-tertiary-fixed-dim">
                        {config.mouse ? "on" : "off"}
                    </span>
                </div>
                <div>
                    <span className="text-primary-fixed-dim">$</span> base-index ={" "}
                    <span className="text-tertiary-fixed-dim">{config.baseIndex}</span>
                </div>
                <div className="opacity-30 mt-3">
                    ──── plugins ({config.plugins.length}) ────
                </div>
                <ul className="text-[11px] opacity-70 mt-1">
                    {config.plugins.map(p => (
                        <li key={p}>· {p}</li>
                    ))}
                </ul>
            </div>
            {config.statusPosition === "bottom" && statusBar}
        </div>
    );
}

/**
 * tmux 포맷 문자열을 아주 가볍게 HTML로 변환.
 * 지원: #[fg=#XXX] / #[bg=#XXX] / #S / %Y-%m-%d / %H:%M / 일반 텍스트
 * 안전: 사용자 입력은 escapeHTML 처리.
 */
function renderSegments(segments: string[]): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    return segments
        .map(seg => {
            // tag tokens of form #[fg=#xxx,bg=#xxx]
            const html = seg.replace(/#\[([^\]]*)\]/g, (_match, attrs: string) => {
                const a = parseStyle(attrs);
                return `</span><span style="color:${escapeAttr(a.fg)};background:${escapeAttr(
                    a.bg === "#1e1e2e" ? "transparent" : a.bg
                )};padding:0 .25em">`;
            });
            const replaced = html
                .replace(/#S/g, "dev")
                .replace(/%Y-%m-%d/g, date)
                .replace(/%H:%M/g, time);
            return `<span>${replaced}</span>`;
        })
        .join("");
}

function escapeAttr(v: string): string {
    return v.replace(/[<>"&]/g, c =>
        ({"<": "&lt;", ">": "&gt;", '"': "&quot;", "&": "&amp;"}[c] ?? c)
    );
}
