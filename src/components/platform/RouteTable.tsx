import {Link} from "react-router-dom";
import {Icon} from "@/components/ui/Icon";
import {Badge, StatusDot} from "@/components/ui/Badge";
import type {SavedRoute} from "@/stores/routesStore";

interface Props {
    routes: SavedRoute[];
    onPlay: (r: SavedRoute) => void;
    onDelete: (r: SavedRoute) => void;
}

function fmtDate(ts: number): string {
    const d = new Date(ts);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(
        d.getHours()
    )}:${pad(d.getMinutes())} UTC`;
}

function shortId(id: string, idx: number): string {
    return `RT-${String(8000 + idx * 53).padStart(4, "0")}-${id.slice(0, 4).toUpperCase()}`;
}

export function RouteTable({routes, onPlay, onDelete}: Props) {
    if (routes.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-white/10 bg-surface-container-low/40 px-6 py-14 text-center">
                <Icon
                    name="garage"
                    className="text-[40px] text-on-surface-variant/40"
                />
                <p className="mt-3 text-body-md text-on-surface-variant">
                    아직 차고에 보관된 노선이 없어요.
                </p>
                <p className="mt-1 font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant/50">
                    Ghostty 또는 tmux 승강장에서 노선을 저장하세요
                </p>
                <Link
                    to="/ghostty"
                    className="inline-flex items-center gap-2 mt-5 px-4 h-9 rounded bg-primary-fixed-dim text-on-primary font-mono text-label-xs uppercase tracking-[0.14em]"
                >
                    <Icon name="add" className="text-[16px]" /> Ghostty 승강장으로
                </Link>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-white/[0.06] bg-surface-container-low/60 overflow-hidden">
            <div className="grid grid-cols-[60px_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.4fr)_120px] gap-3 px-5 py-3 border-b border-white/[0.06] font-mono text-label-xs uppercase tracking-[0.16em] text-on-surface-variant/60">
                <span>Status</span>
                <span>Route ID / Name</span>
                <span>Last Departed</span>
                <span>Manifest (Components)</span>
                <span className="text-right">Action</span>
            </div>
            <ul>
                {routes.map((r, i) => (
                    <li
                        key={r.id}
                        className="grid grid-cols-[60px_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.4fr)_120px] gap-3 items-center px-5 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition"
                    >
                        <span>
                            <StatusDot tone={i === routes.length - 1 ? "muted" : "active"} />
                        </span>
                        <div className="min-w-0">
                            <div className="font-mono text-code-sm text-on-surface truncate">
                                {shortId(r.id, i)}
                            </div>
                            <div className="text-[11px] text-on-surface-variant truncate">
                                {r.name}
                            </div>
                        </div>
                        <div className="font-mono text-[11px] text-on-surface-variant">
                            {fmtDate(r.createdAt)}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <Badge tone={r.platform === "ghostty" ? "active" : "info"}>
                                {r.platform}
                            </Badge>
                            <Badge>autosave</Badge>
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                            <button
                                type="button"
                                onClick={() => onPlay(r)}
                                className="h-8 w-8 grid place-items-center rounded text-primary-fixed-dim border border-primary-fixed-dim/30 hover:bg-primary-fixed-dim/10 transition"
                                aria-label="다시 탑승"
                                title="다시 탑승"
                            >
                                <Icon name="play_arrow" className="text-[16px]" fill />
                            </button>
                            <button
                                type="button"
                                onClick={() => onDelete(r)}
                                className="h-8 w-8 grid place-items-center rounded text-on-surface-variant hover:text-error hover:bg-error/10 transition"
                                aria-label="폐차"
                                title="폐차"
                            >
                                <Icon name="delete" className="text-[16px]" />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
