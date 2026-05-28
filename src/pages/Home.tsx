import {Link} from "react-router-dom";
import {motion} from "framer-motion";
import {Button} from "@/components/ui/Button";
import {PlatformCard} from "@/components/platform/PlatformCard";
import {Icon} from "@/components/ui/Icon";
import {useRoutesStore} from "@/stores/routesStore";

const gridParent = {
    show: {transition: {staggerChildren: 0.05, delayChildren: 0.05}}
};
const gridItem = {
    hidden: {opacity: 0, y: 12},
    show: {
        opacity: 1,
        y: 0,
        transition: {type: "spring" as const, stiffness: 200, damping: 24}
    }
};

const PLATFORMS = [
    {
        platformNo: "01",
        title: "Ghostty",
        description: "GPU 가속 모던 터미널. 폰트·색·창 패딩을 슬라이더로, 결과는 단일 ghostty config로.",
        to: "/ghostty",
        icon: "terminal",
        snippet: "~/.config/ghostty/config",
        status: "active" as const
    },
    {
        platformNo: "02",
        title: "Warp",
        description: "AI 내장 차세대 터미널. 테마·워크플로우·AI 설정을 YAML 한 묶음으로.",
        to: "/warp",
        icon: "bolt",
        snippet: "~/.warp/themes/",
        status: "ready" as const
    },
    {
        platformNo: "03",
        title: "iTerm2",
        description: "macOS 대표 터미널. 색상 프리셋·폰트·핫키까지 .itermcolors / Dynamic Profile로.",
        to: "/iterm2",
        icon: "terminal",
        snippet: "*.itermcolors",
        status: "ready" as const
    },
    {
        platformNo: "04",
        title: "Neovim",
        description: "lazy.nvim 기반 init.lua. 옵션·플러그인·키매핑을 폼으로 조립.",
        to: "/neovim",
        icon: "edit_note",
        snippet: "~/.config/nvim/init.lua",
        status: "ready" as const
    },
    {
        platformNo: "05",
        title: "Helix",
        description: "Rust 모달 에디터. 트리시터 + LSP가 기본. config.toml 한 벌로.",
        to: "/helix",
        icon: "edit_square",
        snippet: "~/.config/helix/config.toml",
        status: "ready" as const
    },
    {
        platformNo: "06",
        title: "Zsh",
        description: "프롬프트·히스토리·플러그인·alias를 단일 .zshrc로.",
        to: "/zsh",
        icon: "code_blocks",
        snippet: "~/.zshrc",
        status: "ready" as const
    },
    {
        platformNo: "07",
        title: "tmux",
        description: "prefix·상태바·플러그인을 체크박스로 조립. 라이브 미리보기.",
        to: "/tmux",
        icon: "grid_view",
        snippet: "~/.tmux.conf",
        status: "ready" as const
    }
];

export function HomePage() {
    const routes = useRoutesStore(s => s.routes);
    return (
        <div className="max-w-6xl mx-auto space-y-12">
            {/* Hero — 절제된 단일 메시지 */}
            <section className="pt-6 pb-2">
                <div className="flex flex-col items-start gap-5 max-w-2xl">
                    <div className="font-mono text-label-xs uppercase tracking-[0.18em] text-primary-fixed-dim">
                        BusTerminal
                    </div>
                    <motion.div
                        initial={{opacity: 0, y: 10, rotate: -4}}
                        animate={{opacity: 1, y: 0, rotate: -4}}
                        transition={{duration: 0.4}}
                        className="neon-sign-board"
                        aria-label="버스터미널"
                    >
                        <span className="neon-sign-cable neon-sign-cable-left" aria-hidden />
                        <span className="neon-sign-cable neon-sign-cable-right" aria-hidden />
                        <h2
                            className="neon-sign-title font-display text-display-lg text-on-surface"
                            data-text="버스터미널"
                        >
                            <span className="neon-sign-letter">버</span>
                            <span className="neon-sign-letter">스</span>
                            <span className="neon-sign-letter">터</span>
                            <span className="neon-sign-letter neon-sign-letter-faulty">미</span>
                            <span className="neon-sign-letter">널</span>
                        </h2>
                    </motion.div>
                    <h1 className="font-display text-display-md text-on-surface leading-[1.05] tracking-tight">
                        내 개발환경,<br />
                        <span className="text-primary-fixed-dim">한 번에</span> 설정하기
                    </h1>
                    <p className="text-body-lg text-on-surface-variant max-w-xl">
                        Ghostty · Warp · iTerm2 · Neovim · Helix · Zsh · tmux —
                        7개 도구의 설정 파일을 시각적으로 만들고, 한 번에 내려받습니다.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        <Link to="/ghostty">
                            <Button size="lg">
                                <Icon name="play_arrow" className="text-[16px]" /> Ghostty로 시작하기
                            </Button>
                        </Link>
                        <Link to="/guide">
                            <Button size="lg" variant="outline">
                                사용 안내
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 3-step 가이드 — 첫 사용자 onboarding */}
            <section className="rounded-xl border border-primary-fixed-dim/20 bg-primary-fixed-dim/[0.04] p-5">
                <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                    <div>
                        <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-primary-fixed-dim">
                            처음이라면
                        </div>
                        <h2 className="font-display text-title-md text-on-surface mt-1">
                            3단계로 시작하세요
                        </h2>
                    </div>
                    <Link
                        to="/guide"
                        className="font-mono text-label-xs uppercase tracking-[0.14em] text-primary-fixed-dim hover:underline inline-flex items-center gap-1"
                    >
                        전체 가이드
                        <Icon name="arrow_forward" className="text-[14px]" />
                    </Link>
                </div>
                <ol className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                        {n: 1, title: "터미널 선택", desc: "쓰는 터미널/에디터의 페이지로 이동.", to: "/ghostty", cta: "Ghostty로"},
                        {n: 2, title: "테마·폰트 적용", desc: "테마/폰트 센터에서 취향을 입혀요.", to: "/themes", cta: "테마 센터"},
                        {n: 3, title: "설정 파일 다운로드", desc: "Export 페이지에서 한 번에.", to: "/export", cta: "Export"}
                    ].map(step => (
                        <li
                            key={step.n}
                            className="rounded-lg border border-white/[0.06] bg-surface-container-lowest/80 p-4"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className="h-6 w-6 rounded-full bg-primary-fixed-dim/15 border border-primary-fixed-dim/40 grid place-items-center font-mono text-[11px] text-primary-fixed-dim">
                                    {step.n}
                                </span>
                                <span className="font-display text-title-md text-on-surface">
                                    {step.title}
                                </span>
                            </div>
                            <p className="text-[12px] text-on-surface-variant mb-2">
                                {step.desc}
                            </p>
                            <Link
                                to={step.to}
                                className="inline-flex items-center gap-1 font-mono text-label-xs uppercase tracking-[0.14em] text-primary-fixed-dim hover:underline"
                            >
                                {step.cta}
                                <Icon name="arrow_forward" className="text-[14px]" />
                            </Link>
                        </li>
                    ))}
                </ol>
            </section>

            {/* Platforms grid */}
            <section>
                <div className="flex items-end justify-between mb-5">
                    <div>
                        <div className="font-mono text-label-xs uppercase tracking-[0.16em] text-on-surface-variant/70">
                            Platforms
                        </div>
                        <h2 className="font-display text-headline-sm text-on-surface mt-1">
                            7개 도구 · 한 곳에서
                        </h2>
                    </div>
                    <Link
                        to="/my-routes"
                        className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant hover:text-primary-fixed-dim transition inline-flex items-center gap-1"
                    >
                        내 노선 ({routes.length})
                        <Icon name="arrow_forward" className="text-[14px]" />
                    </Link>
                </div>
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={gridParent}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                    {PLATFORMS.map(card => (
                        <motion.div key={card.platformNo} variants={gridItem}>
                            <PlatformCard {...card} />
                        </motion.div>
                    ))}
                </motion.div>
            </section>
        </div>
    );
}
