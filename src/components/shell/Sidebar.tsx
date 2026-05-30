import {useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {AnimatePresence, motion} from "framer-motion";
import {Icon} from "@/components/ui/Icon";
import {PlatformNavItem} from "./PlatformNavItem";
import {Button} from "@/components/ui/Button";
import {useUIStore} from "@/stores/uiStore";

function SidebarContents({onNavigate}: {onNavigate?: () => void}) {
    const navigate = useNavigate();
    const beginnerMode = useUIStore(s => s.beginnerMode);
    const toggleBeginnerMode = useUIStore(s => s.toggleBeginnerMode);
    function go(path: string) {
        navigate(path);
        onNavigate?.();
    }
    return (
        <>
            {/* Station Identity */}
            <div className="px-4 py-5 border-b border-white/[0.05]">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded bg-primary-fixed-dim/10 border border-primary-fixed-dim/30 overflow-hidden grid place-items-center">
                        <img
                            src="/logo.png"
                            alt="BusTerminal 로고"
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                            loading="eager"
                            decoding="async"
                        />
                    </div>
                    <div className="min-w-0">
                        <div className="font-mono text-label-xs uppercase tracking-[0.16em] text-primary-fixed-dim">
                            BusTerminal
                        </div>
                        <p className="mt-1 text-[11px] text-on-surface-variant leading-snug">
                            내 개발환경 설정
                        </p>
                    </div>
                </div>
                <Button size="sm" className="w-full mt-4" onClick={() => go("/tools")}>
                    <Icon name="route" className="text-[16px]" />
                    도구 고르기
                </Button>
                <button
                    type="button"
                    onClick={toggleBeginnerMode}
                    className={`mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition active:scale-[0.98] ${
                        beginnerMode
                            ? "border-primary-fixed-dim/45 bg-primary-fixed-dim/[0.12] text-primary-fixed-dim"
                            : "border-white/10 bg-white/[0.02] text-on-surface-variant hover:text-on-surface hover:border-white/20"
                    }`}
                    aria-pressed={beginnerMode}
                >
                    <Icon name="school" className="text-[15px]" />
                    {beginnerMode ? "초보 모드 켜짐" : "초보 모드"}
                </button>
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
                <PlatformNavItem to="/tools" label="툴 소개" icon="lightbulb" />
                <PlatformNavItem to="/guide" label="처음이라면" icon="help" />
                <PlatformNavItem to="/feedback" label="의견 보내기" icon="campaign" />
                <PlatformNavItem to="/my-routes" label="내 노선" icon="bookmark" />
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
            {/* Desktop static — viewport에 sticky 고정해 footer 항상 보이게 */}
            <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-white/[0.05] bg-surface-container-lowest/80 sticky top-0 self-start h-[100dvh]">
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
