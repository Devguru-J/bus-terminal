import {useEffect} from "react";
import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {AnimatePresence, motion} from "framer-motion";
import {Icon} from "@/components/ui/Icon";
import {PlatformNavItem} from "./PlatformNavItem";
import {Button} from "@/components/ui/Button";
import {StatusDot} from "@/components/ui/Badge";
import {useUIStore} from "@/stores/uiStore";

function SidebarContents({onNavigate}: {onNavigate?: () => void}) {
    const navigate = useNavigate();
    function go(path: string) {
        navigate(path);
        onNavigate?.();
    }
    return (
        <>
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
                <Button size="sm" className="w-full mt-4" onClick={() => go("/ghostty")}>
                    <Icon name="add" className="text-[16px]" />
                    새 설정 만들기
                </Button>
            </div>

            {/* Platforms */}
            <nav className="flex-1 py-4 flex flex-col gap-0.5 overflow-y-auto">
                <div className="px-5 mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant/60">
                    Terminal
                </div>
                <PlatformNavItem to="/" label="홈" icon="home" end />
                <div className="mt-4 px-5 mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant/60">
                    Platforms
                </div>
                <PlatformNavItem to="/ghostty" label="Platform 1: Ghostty" icon="terminal" />
                <PlatformNavItem to="/warp" label="Platform 2: Warp" icon="bolt" />
                <PlatformNavItem to="/iterm2" label="Platform 3: iTerm2" icon="terminal" />
                <PlatformNavItem to="/neovim" label="Platform 4: Neovim" icon="edit_note" />
                <PlatformNavItem to="/helix" label="Platform 5: Helix" icon="edit_square" />
                <PlatformNavItem to="/zsh" label="Platform 6: Zsh" icon="code_blocks" />
                <PlatformNavItem to="/tmux" label="Platform 7: tmux" icon="grid_view" />
                <PlatformNavItem to="/themes" label="테마 센터" icon="palette" />
                <PlatformNavItem to="/fonts" label="폰트 센터" icon="text_fields" />
            </nav>

            {/* Footer rail */}
            <div className="px-2 py-3 border-t border-white/[0.05] flex flex-col gap-0.5">
                <PlatformNavItem to="/guide" label="처음이라면" icon="help" />
                <PlatformNavItem to="/my-routes" label="내 노선" icon="bookmark" />
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
                        설정 비교
                    </span>
                </NavLink>
                <div className="mt-3 mx-3 flex items-center gap-2 px-2 py-2 rounded bg-white/[0.02] border border-white/[0.04]">
                    <StatusDot />
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">
                        System Online
                    </span>
                </div>
            </div>
        </>
    );
}

export function Sidebar() {
    const drawerOpen = useUIStore(s => s.drawerOpen);
    const setDrawerOpen = useUIStore(s => s.setDrawerOpen);
    const location = useLocation();

    // 라우트 변경 시 모바일 drawer 자동 닫기
    useEffect(() => {
        setDrawerOpen(false);
    }, [location.pathname, setDrawerOpen]);

    // Esc로도 닫기
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setDrawerOpen(false);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [setDrawerOpen]);

    return (
        <>
            {/* Desktop static */}
            <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-white/[0.05] bg-surface-container-lowest/80">
                <SidebarContents />
            </aside>

            {/* Mobile drawer */}
            <AnimatePresence>
                {drawerOpen && (
                    <>
                        <motion.div
                            key="overlay"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            onClick={() => setDrawerOpen(false)}
                            className="lg:hidden fixed inset-0 z-40 bg-black/60"
                            aria-hidden
                        />
                        <motion.aside
                            key="drawer"
                            initial={{x: "-100%"}}
                            animate={{x: 0}}
                            exit={{x: "-100%"}}
                            transition={{type: "spring", stiffness: 380, damping: 38}}
                            className="lg:hidden fixed top-0 left-0 z-50 h-[100dvh] w-[280px] flex flex-col border-r border-white/[0.06] bg-surface-container-lowest"
                            role="dialog"
                            aria-modal="true"
                            aria-label="네비게이션"
                        >
                            <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.05]">
                                <span className="font-mono text-label-xs uppercase tracking-[0.16em] text-primary-fixed-dim px-2">
                                    BusTerminal
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setDrawerOpen(false)}
                                    className="p-2 rounded hover:bg-white/[0.04] text-on-surface-variant"
                                    aria-label="닫기"
                                >
                                    <Icon name="close" className="text-[18px]" />
                                </button>
                            </div>
                            <SidebarContents />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
