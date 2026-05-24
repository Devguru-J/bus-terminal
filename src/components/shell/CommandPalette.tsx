import {useEffect, useMemo, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Icon} from "@/components/ui/Icon";
import {toast} from "@/stores/toastStore";
import {cn} from "@/lib/utils";

interface CommandItem {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    keywords: string;
    run: () => void;
}

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const navigate = useNavigate();

    const commands = useMemo<CommandItem[]>(
        () => [
            {id: "home", title: "Main Station", subtitle: "메인으로 이동", icon: "home", keywords: "home main station 메인", run: () => navigate("/")},
            {id: "ghostty", title: "Ghostty 승강장", subtitle: "터미널 에뮬레이터 설정", icon: "terminal", keywords: "ghostty terminal font theme keybind 고스티", run: () => navigate("/ghostty")},
            {id: "warp", title: "Warp 승강장", subtitle: "AI 터미널, 테마, 워크플로우", icon: "bolt", keywords: "warp ai terminal theme workflow", run: () => navigate("/warp")},
            {id: "iterm2", title: "iTerm2 승강장", subtitle: "macOS 터미널, .itermcolors, 핫키", icon: "terminal", keywords: "iterm iterm2 macos colors profile hotkey", run: () => navigate("/iterm2")},
            {id: "neovim", title: "Neovim 승강장", subtitle: "에디터, LSP, 플러그인 설정", icon: "edit_note", keywords: "neovim nvim editor lsp plugin", run: () => navigate("/neovim")},
            {id: "helix", title: "Helix 승강장", subtitle: "모달 에디터, LSP, 키매핑", icon: "edit_square", keywords: "helix editor modal lsp toml", run: () => navigate("/helix")},
            {id: "zsh", title: "Zsh 승강장", subtitle: "셸, prompt, alias, PATH 설정", icon: "code_blocks", keywords: "zsh shell prompt alias path env", run: () => navigate("/zsh")},
            {id: "tmux", title: "tmux 승강장", subtitle: "세션, pane, key binding 설정", icon: "grid_view", keywords: "tmux multiplexer pane session key binding 키바인딩", run: () => navigate("/tmux")},
            {id: "themes", title: "테마 환승센터", subtitle: "26개 테마 검색·즐겨찾기·전체 송출", icon: "palette", keywords: "theme color palette tokyonight catppuccin gruvbox nord dracula", run: () => navigate("/themes")},
            {id: "fonts", title: "폰트 환승센터", subtitle: "26개 폰트 미리보기·환승", icon: "text_fields", keywords: "font typography jetbrains fira geist berkeley iosevka", run: () => navigate("/fonts")},
            {id: "routes", title: "Saved Routes", subtitle: "내 노선 관리", icon: "bookmark", keywords: "saved routes garage 저장 차고", run: () => navigate("/my-routes")},
            {id: "diff", title: "Departure Logs", subtitle: "설정 변경 비교", icon: "difference", keywords: "diff compare logs 변경 비교", run: () => navigate("/diff")},
            {id: "export", title: "Export / 출발 전 점검", subtitle: "설정 다운로드와 진단", icon: "rocket_launch", keywords: "export download diagnostics 출발 점검", run: () => navigate("/export")},
            {id: "settings", title: "Settings", subtitle: "저장소와 초기화 관리", icon: "settings", keywords: "settings reset storage 설정 초기화", run: () => navigate("/settings")},
            {
                id: "copy-url",
                title: "Copy current URL",
                subtitle: "현재 페이지 주소 복사",
                icon: "link",
                keywords: "copy url link share",
                run: async () => {
                    await navigator.clipboard.writeText(window.location.href);
                    toast("현재 URL을 복사했어요.", "success");
                }
            }
        ],
        [navigate]
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return commands;
        return commands.filter(command =>
            `${command.title} ${command.subtitle} ${command.keywords}`.toLowerCase().includes(q)
        );
    }, [commands, query]);

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            const target = event.target as HTMLElement | null;
            const typing =
                target?.tagName === "INPUT" ||
                target?.tagName === "TEXTAREA" ||
                target?.isContentEditable;
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setOpen(true);
                return;
            }
            if (event.key === "Escape") setOpen(false);
            if (!typing && event.key === "/" && !open) {
                event.preventDefault();
                setOpen(true);
            }
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        setQuery("");
        setActiveIndex(0);
        window.setTimeout(() => inputRef.current?.focus(), 0);
    }, [open]);

    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    useEffect(() => {
        if (activeIndex > filtered.length - 1) {
            setActiveIndex(Math.max(filtered.length - 1, 0));
        }
    }, [activeIndex, filtered.length]);

    // 키보드 ↑↓ 이동 시 활성 항목을 스크롤 영역에 자동으로 보이게.
    useEffect(() => {
        const el = itemRefs.current[activeIndex];
        if (el) el.scrollIntoView({block: "nearest"});
    }, [activeIndex]);

    if (!open) return null;

    function run(command: CommandItem) {
        setOpen(false);
        command.run();
    }

    return (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
            <div
                className="mx-auto mt-[10vh] w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-surface-container-low/95 shadow-glow-soft"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
                    <Icon name="search" className="text-[20px] text-primary-fixed-dim" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "ArrowDown") {
                                e.preventDefault();
                                setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
                            }
                            if (e.key === "ArrowUp") {
                                e.preventDefault();
                                setActiveIndex(i => Math.max(i - 1, 0));
                            }
                            if (e.key === "Enter" && filtered[activeIndex]) {
                                e.preventDefault();
                                run(filtered[activeIndex]);
                            }
                        }}
                        placeholder="명령, 승강장, 설정 검색..."
                        className="h-10 flex-1 bg-transparent font-mono text-code-sm text-on-surface outline-none placeholder:text-on-surface-variant/50"
                    />
                    <span className="hidden rounded border border-white/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant sm:inline">
                        ↑↓ Enter Esc
                    </span>
                </div>
                <div className="max-h-[420px] overflow-y-auto p-2">
                    {filtered.map((command, index) => (
                        <button
                            key={command.id}
                            ref={el => {
                                itemRefs.current[index] = el;
                            }}
                            type="button"
                            onClick={() => run(command)}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={cn(
                                "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition",
                                index === activeIndex ? "bg-primary-fixed-dim/[0.08]" : "hover:bg-white/[0.04]"
                            )}
                        >
                            <span className="grid h-9 w-9 place-items-center rounded bg-white/[0.04] text-primary-fixed-dim">
                                <Icon name={command.icon} className="text-[18px]" />
                            </span>
                            <span className="min-w-0">
                                <span className="block font-mono text-code-sm text-on-surface">
                                    {command.title}
                                </span>
                                <span className="block truncate text-[12px] text-on-surface-variant">
                                    {command.subtitle}
                                </span>
                            </span>
                        </button>
                    ))}
                    {filtered.length === 0 && (
                        <div className="px-4 py-10 text-center text-body-md text-on-surface-variant">
                            검색 결과가 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
