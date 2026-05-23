import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Icon} from "@/components/ui/Icon";

function utcStamp(d = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

export function TopBar() {
    const [t, setT] = useState(utcStamp());
    useEffect(() => {
        const i = setInterval(() => setT(utcStamp()), 30_000);
        return () => clearInterval(i);
    }, []);
    return (
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-6 border-b border-white/[0.06] bg-surface/60 backdrop-blur-md">
            <Link
                to="/"
                className="font-display text-[15px] font-semibold tracking-[0.32em] text-primary-fixed-dim uppercase"
            >
                BusTerminal
            </Link>
            <div className="flex items-center gap-5">
                <span className="font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant hidden sm:inline">
                    {t}
                </span>
                <button
                    type="button"
                    className="p-2 rounded-full text-on-surface-variant hover:text-primary-fixed-dim hover:bg-white/5 transition"
                    aria-label="Sensors"
                >
                    <Icon name="sensors" className="text-[18px]" />
                </button>
                <button
                    type="button"
                    className="p-2 rounded-full text-on-surface-variant hover:text-primary-fixed-dim hover:bg-white/5 transition"
                    aria-label="Account"
                >
                    <Icon name="account_circle" className="text-[18px]" />
                </button>
            </div>
        </header>
    );
}
