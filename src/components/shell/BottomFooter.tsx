import {Link} from "react-router-dom";

export function BottomFooter() {
    return (
        <footer className="h-10 flex items-center justify-between px-6 border-t border-white/[0.06] bg-surface-container-lowest">
            <span className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant">
                © 2026 BusTerminal · 내 개발환경으로 출발
            </span>
            <div className="hidden md:flex items-center gap-5">
                <a
                    className="font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant hover:text-primary-fixed-dim transition"
                    href="https://github.com/Devguru-J/bus-terminal/issues/new"
                    target="_blank"
                    rel="noreferrer"
                    title="GitHub Issues에 의견·버그·요청을 남겨주세요"
                >
                    의견 보내기
                </a>
                <a
                    className="font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant hover:text-primary-fixed-dim transition"
                    href="https://github.com/Devguru-J/bus-terminal"
                    target="_blank"
                    rel="noreferrer"
                >
                    GitHub
                </a>
                <Link
                    to="/privacy"
                    className="font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant hover:text-primary-fixed-dim transition"
                >
                    Privacy
                </Link>
                <Link
                    to="/terms"
                    className="font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant hover:text-primary-fixed-dim transition"
                >
                    Terms
                </Link>
            </div>
        </footer>
    );
}
