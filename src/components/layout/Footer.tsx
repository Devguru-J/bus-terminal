export function Footer() {
    return (
        <footer className="border-t border-line mt-20">
            <div className="mx-auto max-w-7xl px-5 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white/40">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-led-amber">▶</span>
                    <span>
                        버스터미널 · 개발 환경 환승센터 ·{" "}
                        <span className="text-white/30">서버 없음, 모두 로컬에 저장</span>
                    </span>
                </div>
                <div className="flex items-center gap-4 font-mono">
                    <a
                        href="https://github.com/Devguru-J/bus-terminal"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-white/70 transition"
                    >
                        github
                    </a>
                    <span>v0.1.0</span>
                </div>
            </div>
        </footer>
    );
}
