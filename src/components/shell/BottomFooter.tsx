export function BottomFooter() {
    return (
        <footer className="h-10 flex items-center justify-between px-6 border-t border-white/[0.06] bg-surface-container-lowest">
            <span className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant">
                © 2026 BusTerminal · READY TO DEPART
            </span>
            <div className="hidden md:flex items-center gap-5">
                <a
                    className="font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant hover:text-primary-fixed-dim transition"
                    href="https://github.com/Devguru-J/bus-terminal"
                    target="_blank"
                    rel="noreferrer"
                >
                    Documentation
                </a>
                <span className="font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant">
                    API Status
                </span>
                <span className="font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant">
                    Privacy
                </span>
            </div>
        </footer>
    );
}
