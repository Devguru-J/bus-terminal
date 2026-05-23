import {NavLink, useLocation} from "react-router-dom";
import {motion} from "framer-motion";
import {Bus, ScrollText, Layers, Palette, Settings as SettingsIcon} from "lucide-react";
import {cn, formatHhmm} from "@/lib/utils";
import {useEffect, useState} from "react";

const NAV = [
    {to: "/", ko: "출발 안내", icon: Bus, end: true},
    {to: "/ghostty", ko: "Ghostty 승강장", icon: ScrollText},
    {to: "/tmux", ko: "tmux 승강장", icon: Layers},
    {to: "/themes", ko: "테마 환승센터", icon: Palette},
    {to: "/my-routes", ko: "내 노선", icon: Bus},
    {to: "/settings", ko: "관리실", icon: SettingsIcon}
];

export function Header() {
    const loc = useLocation();
    const [time, setTime] = useState(formatHhmm());
    useEffect(() => {
        const i = setInterval(() => setTime(formatHhmm()), 30_000);
        return () => clearInterval(i);
    }, []);

    return (
        <header className="sticky top-0 z-40 border-b border-line bg-ink-900/70 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-5 h-14 flex items-center gap-6">
                <NavLink to="/" className="flex items-center gap-2 group">
                    <span className="h-7 w-7 rounded-lg bg-led-green text-ink-900 grid place-items-center font-bold shadow-[0_8px_22px_-6px_rgba(0,224,164,0.6)]">
                        ▶
                    </span>
                    <span className="font-semibold tracking-tight">
                        버스터미널
                        <span className="ml-2 text-[10px] font-mono text-white/40">
                            BUS·TERMINAL
                        </span>
                    </span>
                </NavLink>

                <nav className="hidden md:flex items-center gap-1 ml-2">
                    {NAV.map(n => (
                        <NavLink
                            key={n.to}
                            to={n.to}
                            end={n.end}
                            className={({isActive}) =>
                                cn(
                                    "relative px-3 h-9 inline-flex items-center gap-2 rounded-lg text-sm transition",
                                    isActive
                                        ? "text-white"
                                        : "text-white/55 hover:text-white hover:bg-white/5"
                                )
                            }
                        >
                            <n.icon size={14} />
                            <span>{n.ko}</span>
                            {loc.pathname === n.to && (
                                <motion.span
                                    layoutId="nav-pill"
                                    className="absolute inset-0 -z-10 rounded-lg bg-white/8 border border-white/10"
                                    transition={{type: "spring", stiffness: 380, damping: 32}}
                                />
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="ml-auto flex items-center gap-3 text-[11px] font-mono text-white/50">
                    <span className="hidden sm:inline">현재시각</span>
                    <span className="led-text text-led-amber">{time}</span>
                    <span className="hidden sm:inline-flex h-2 w-2 rounded-full bg-led-green animate-blink" />
                </div>
            </div>
        </header>
    );
}
