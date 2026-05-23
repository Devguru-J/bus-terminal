import {NavLink, useNavigate} from "react-router-dom";
import {Icon} from "@/components/ui/Icon";
import {PlatformNavItem} from "./PlatformNavItem";
import {Button} from "@/components/ui/Button";
import {StatusDot} from "@/components/ui/Badge";

export function Sidebar() {
    const navigate = useNavigate();
    return (
        <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-white/[0.05] bg-surface-container-lowest/60 backdrop-blur-md">
            {/* Station Identity */}
            <div className="px-4 py-5 border-b border-white/[0.05]">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded bg-primary-fixed-dim/15 border border-primary-fixed-dim/30 grid place-items-center text-primary-fixed-dim">
                        <Icon name="hub" className="text-[20px]" fill />
                    </div>
                    <div className="min-w-0">
                        <div className="font-mono text-label-xs uppercase tracking-[0.16em] text-primary-fixed-dim">
                            STATION 01
                        </div>
                        <p className="mt-1 text-[11px] text-on-surface-variant leading-snug">
                            Configuring Local Terminal
                        </p>
                    </div>
                </div>
                <Button
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => navigate("/ghostty")}
                >
                    <Icon name="add" className="text-[16px]" />
                    New Route
                </Button>
            </div>

            {/* Platforms */}
            <nav className="flex-1 py-4 flex flex-col gap-0.5 overflow-y-auto">
                <div className="px-5 mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant/60">
                    Platforms
                </div>
                <PlatformNavItem to="/ghostty" label="Platform 1: Ghostty" icon="terminal" />
                <PlatformNavItem to="/tmux" label="Platform 2: tmux" icon="grid_view" />
                <PlatformNavItem to="/themes" label="Theme Center" icon="palette" />
                <NavDisabled label="Platform 3: Neovim" icon="edit_note" />
                <NavDisabled label="Platform 4: Zsh" icon="code_blocks" />
            </nav>

            {/* Footer rail */}
            <div className="px-2 py-3 border-t border-white/[0.05] flex flex-col gap-0.5">
                <PlatformNavItem to="/my-routes" label="Saved Routes" icon="bookmark" />
                <NavLink
                    to="/diff"
                    className={({isActive}) =>
                        `flex items-center gap-3 h-10 pl-5 pr-3 rounded-r-lg text-on-surface-variant hover:text-on-surface hover:bg-white/[0.03] ${
                            isActive ? "text-primary-fixed-dim bg-primary-fixed-dim/[0.06]" : ""
                        }`
                    }
                >
                    <Icon name="difference" className="text-[18px]" />
                    <span className="font-mono text-label-xs uppercase tracking-[0.12em]">
                        Departure Logs
                    </span>
                </NavLink>
                <div className="mt-3 mx-3 flex items-center gap-2 px-2 py-2 rounded bg-white/[0.02] border border-white/[0.04]">
                    <StatusDot />
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">
                        System Online
                    </span>
                </div>
            </div>
        </aside>
    );
}

function NavDisabled({label, icon}: {label: string; icon: string}) {
    return (
        <div className="flex items-center gap-3 h-10 pl-5 pr-3 text-on-surface-variant/40 cursor-not-allowed">
            <Icon name={icon} className="text-[18px]" />
            <span className="font-mono text-label-xs uppercase tracking-[0.12em] flex-1">
                {label}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-on-surface-variant/40">
                soon
            </span>
        </div>
    );
}
