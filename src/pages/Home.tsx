import {Link} from "react-router-dom";
import {motion} from "framer-motion";
import {Button} from "@/components/ui/Button";
import {MagneticButton} from "@/components/ui/MagneticButton";
import {DepartureStatus} from "@/components/platform/DepartureStatus";
import {PlatformCard} from "@/components/platform/PlatformCard";
import {Icon} from "@/components/ui/Icon";
import {useRoutesStore} from "@/stores/routesStore";

const gridParent = {
    show: {transition: {staggerChildren: 0.08, delayChildren: 0.1}}
};
const gridItem = {
    hidden: {opacity: 0, y: 16},
    show: {
        opacity: 1,
        y: 0,
        transition: {type: "spring" as const, stiffness: 180, damping: 22}
    }
};

export function HomePage() {
    const routes = useRoutesStore(s => s.routes);
    return (
        <div className="max-w-6xl mx-auto space-y-12">
            <section>
                <div className="flex flex-col items-start gap-5">
                    <DepartureStatus label="System Online" />
                    <motion.div
                        initial={{opacity: 0, y: 10, rotate: -4}}
                        animate={{opacity: 1, y: 0, rotate: -4}}
                        transition={{duration: 0.4}}
                        className="neon-sign-board"
                        aria-label="버스터미널"
                    >
                        <span className="neon-sign-cable neon-sign-cable-left" aria-hidden />
                        <span className="neon-sign-cable neon-sign-cable-right" aria-hidden />
                        <h1
                            className="neon-sign-title font-display text-display-lg text-on-surface"
                            data-text="버스터미널"
                        >
                            <span className="neon-sign-letter">버</span>
                            <span className="neon-sign-letter">스</span>
                            <span className="neon-sign-letter">터</span>
                            <span className="neon-sign-letter neon-sign-letter-faulty">미</span>
                            <span className="neon-sign-letter">널</span>
                        </h1>
                    </motion.div>
                    <p className="text-body-md text-on-surface-variant max-w-xl">
                        내 개발환경으로 출발. 복잡한 설정 없이 터미널을 선택하고,
                        탑승하고, 출발하세요.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        <MagneticButton>
                            <Link to="/ghostty">
                                <Button size="lg">
                                    <Icon name="login" className="text-[16px]" /> 탑승 시작
                                </Button>
                            </Link>
                        </MagneticButton>
                        <MagneticButton strength={0.18}>
                            <Link to="/themes">
                                <Button size="lg" variant="outline">
                                    <Icon name="palette" className="text-[16px]" />
                                    노선 둘러보기
                                </Button>
                            </Link>
                        </MagneticButton>
                    </div>
                </div>
            </section>

            <section>
                <div className="flex items-end justify-between mb-5">
                    <div>
                        <div className="font-mono text-label-xs uppercase tracking-[0.16em] text-on-surface-variant/70">
                            Departure Board
                        </div>
                        <h2 className="font-display text-headline-sm text-on-surface mt-1">
                            출발 안내 · 7개 승강장 운행중
                        </h2>
                    </div>
                    <Link
                        to="/my-routes"
                        className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant hover:text-primary-fixed-dim transition inline-flex items-center gap-1"
                    >
                        Saved Routes ({routes.length})
                        <Icon name="arrow_forward" className="text-[14px]" />
                    </Link>
                </div>
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={gridParent}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                    {([
                        {
                            platformNo: "01",
                            title: "Ghostty 승강장",
                            description:
                                "폰트·색·창 패딩을 슬라이더로 맞추고 미리보기에서 바로 확인. 완성하면 ghostty config 한 줄로 출발.",
                            to: "/ghostty",
                            icon: "terminal",
                            departure: "14:00 DEPART",
                            snippet: "> ghostty --config",
                            status: "active" as const
                        },
                        {
                            platformNo: "02",
                            title: "Warp 승강장",
                            description:
                                "AI 내장 차세대 터미널. 테마 / 워크플로우 / AI 설정을 YAML 한 묶음으로 출발.",
                            to: "/warp",
                            icon: "bolt",
                            departure: "14:15 DEPART",
                            snippet: "> warp",
                            status: "ready" as const
                        },
                        {
                            platformNo: "03",
                            title: "iTerm2 승강장",
                            description:
                                "macOS 대표 터미널. 색상 프리셋과 폰트·핫키까지 .itermcolors / Dynamic Profile로 한 번에.",
                            to: "/iterm2",
                            icon: "terminal",
                            departure: "14:30 DEPART",
                            snippet: "> open -a iTerm",
                            status: "ready" as const
                        },
                        {
                            platformNo: "04",
                            title: "Neovim 승강장",
                            description:
                                "lazy.nvim 기반. 옵션 토글·플러그인 선택·키 매핑 추가만으로 init.lua 한 벌이 완성됩니다.",
                            to: "/neovim",
                            icon: "edit_note",
                            departure: "14:45 DEPART",
                            snippet: "> nvim .",
                            status: "ready" as const
                        },
                        {
                            platformNo: "05",
                            title: "Helix 승강장",
                            description:
                                "Rust로 만든 모달 에디터. 트리시터 + LSP가 기본. config.toml 한 벌로 출발 완료.",
                            to: "/helix",
                            icon: "edit_square",
                            departure: "15:00 DEPART",
                            snippet: "> hx .",
                            status: "ready" as const
                        },
                        {
                            platformNo: "06",
                            title: "Zsh 승강장",
                            description:
                                "프롬프트 · 히스토리 · oh-my-zsh 플러그인 · alias를 하나의 ~/.zshrc 출발권으로 묶어냅니다.",
                            to: "/zsh",
                            icon: "code_blocks",
                            departure: "15:15 DEPART",
                            snippet: "> zsh",
                            status: "ready" as const
                        },
                        {
                            platformNo: "07",
                            title: "tmux 승강장",
                            description:
                                "prefix · 상태바 · 플러그인을 체크박스로 조립. 결과는 라이브 상태바로 미리 보고 ~/.tmux.conf 로 도착.",
                            to: "/tmux",
                            icon: "grid_view",
                            departure: "15:30 DEPART",
                            snippet: "> tmux attach -t dev",
                            status: "ready" as const
                        }
                    ]).map(card => (
                        <motion.div key={card.platformNo} variants={gridItem}>
                            <PlatformCard {...card} />
                        </motion.div>
                    ))}
                </motion.div>
            </section>
        </div>
    );
}
