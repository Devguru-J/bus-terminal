import {motion} from "framer-motion";
import {cn} from "@/lib/utils";

export interface BoardRow {
    platform: string; // "1번"
    route: string; // "Ghostty"
    destination: string; // "내 .config/ghostty"
    status: "탑승중" | "정시" | "지연" | "준비";
    accent?: string;
}

const STATUS_TONE: Record<BoardRow["status"], string> = {
    탑승중: "text-led-green",
    정시: "text-led-amber",
    지연: "text-led-red",
    준비: "text-led-blue"
};

export function DepartureBoard({rows}: {rows: BoardRow[]}) {
    return (
        <div className="rounded-xl2 overflow-hidden border border-line-strong bg-ink-900">
            <div className="flex items-center gap-2 px-5 py-2.5 bg-black/60 border-b border-line text-[10px] font-mono tracking-[0.2em] text-led-amber uppercase">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-led-amber animate-blink" />
                출발 안내 · DEPARTURE BOARD
                <span className="ml-auto text-white/30">정시 운행중</span>
            </div>
            <div className="dot-matrix">
                <div className="grid grid-cols-[60px_1fr_1.4fr_70px] gap-3 px-5 py-2 text-[10px] font-mono text-led-amber/60 uppercase tracking-wider border-b border-line">
                    <span>승강장</span>
                    <span>노선</span>
                    <span>행선지</span>
                    <span className="text-right">상태</span>
                </div>
                <ul>
                    {rows.map((r, i) => (
                        <motion.li
                            key={r.platform + r.route}
                            initial={{opacity: 0, y: 6}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: i * 0.05}}
                            className="grid grid-cols-[60px_1fr_1.4fr_70px] gap-3 items-center px-5 py-3 border-b border-line last:border-0 hover:bg-white/[0.02] transition"
                        >
                            <span
                                className="led-text text-led-amber text-base"
                                style={{color: r.accent ?? undefined}}
                            >
                                {r.platform}
                            </span>
                            <span className="text-sm text-white/90">{r.route}</span>
                            <span className="text-xs text-white/55 truncate font-mono">
                                {r.destination}
                            </span>
                            <span
                                className={cn(
                                    "text-right text-xs font-mono",
                                    STATUS_TONE[r.status]
                                )}
                            >
                                {r.status}
                            </span>
                        </motion.li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
