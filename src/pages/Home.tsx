import {motion} from "framer-motion";
import {Link} from "react-router-dom";
import {Bus, Sparkles, ArrowRight} from "lucide-react";
import {Button} from "@/components/ui/Button";
import {Badge} from "@/components/ui/Badge";
import {DepartureBoard, type BoardRow} from "@/components/platform/DepartureBoard";
import {PlatformCard} from "@/components/platform/PlatformCard";

const ROWS: BoardRow[] = [
    {platform: "1번", route: "Ghostty 노선", destination: "~/.config/ghostty/config", status: "탑승중", accent: "#9b8cff"},
    {platform: "2번", route: "tmux 노선", destination: "~/.tmux.conf", status: "정시", accent: "#00e0a4"},
    {platform: "3번", route: "Neovim 노선", destination: "~/.config/nvim", status: "준비", accent: "#5cb6ff"},
    {platform: "4번", route: "yazi 노선", destination: "~/.config/yazi", status: "준비", accent: "#ffb02e"}
];

export function HomePage() {
    return (
        <div className="mx-auto max-w-7xl px-5 pt-12 pb-16">
            {/* Hero */}
            <section className="relative">
                <motion.div
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                    className="flex flex-col items-start gap-5"
                >
                    <Badge tone="green">
                        <Sparkles size={10} /> NOW BOARDING · 정시 운행
                    </Badge>
                    <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
                        버스터미널
                        <span className="block text-white/45 text-2xl sm:text-3xl font-medium mt-3 tracking-tight">
                            내 개발환경으로 출발
                        </span>
                    </h1>
                    <p className="max-w-xl text-white/55 leading-relaxed">
                        복잡한 설정 없이 터미널을 선택하고, 탑승하고, 출발하세요.<br />
                        Ghostty · tmux · Neovim · yazi — 노선만 고르면 됩니다.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        <Link to="/ghostty">
                            <Button size="lg">
                                <Bus size={18} /> 탑승 시작
                            </Button>
                        </Link>
                        <Link to="/themes">
                            <Button size="lg" variant="outline">
                                노선 둘러보기 <ArrowRight size={16} />
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* 전광판 */}
                <motion.div
                    initial={{opacity: 0, y: 16}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.15}}
                    className="mt-12"
                >
                    <DepartureBoard rows={ROWS} />
                </motion.div>
            </section>

            {/* 승강장 카드 */}
            <section className="mt-16">
                <div className="flex items-end justify-between mb-5">
                    <div>
                        <h2 className="text-xl font-semibold">승강장 안내</h2>
                        <p className="text-sm text-white/45 mt-1">
                            각 승강장으로 이동해 노선을 구성하세요.
                        </p>
                    </div>
                    <Link
                        to="/my-routes"
                        className="text-xs text-white/50 hover:text-white inline-flex items-center gap-1"
                    >
                        내 노선 보기 <ArrowRight size={12} />
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <PlatformCard
                        platform="1번"
                        title="Ghostty"
                        description="모던한 GPU 가속 터미널. 가져오기, GUI 편집, 실시간 미리보기."
                        to="/ghostty"
                        accent="#9b8cff"
                        tag="추천"
                    />
                    <PlatformCard
                        platform="2번"
                        title="tmux"
                        description="상태바, 프리픽스, 플러그인. 조합형 카드로 빠르게 구성."
                        to="/tmux"
                        accent="#00e0a4"
                    />
                    <PlatformCard
                        platform="3번"
                        title="테마 환승센터"
                        description="6개 노선 스타일. 한 번 누르면 색 전체가 환승됩니다."
                        to="/themes"
                        accent="#ffb02e"
                    />
                    <PlatformCard
                        platform="4번"
                        title="내 노선"
                        description="저장한 설정을 차고에서 꺼내 다시 출발하세요."
                        to="/my-routes"
                        accent="#5cb6ff"
                        status="운행중"
                    />
                </div>
            </section>

            {/* 가치 제안 */}
            <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    {title: "초보 친화", body: "옵션 1,600개 대신 핵심만. 모든 라벨은 한국어."},
                    {title: "한국어 우선", body: "UI · 도움말 · 예시까지 한국어. config 키는 영어 유지."},
                    {title: "설정은 결과물", body: "form이 아니라 미리보기와 출발 안내가 주인공."}
                ].map(card => (
                    <div key={card.title} className="glass rounded-xl2 p-5">
                        <div className="text-xs text-led-amber font-mono uppercase tracking-wider">
                            {card.title}
                        </div>
                        <p className="mt-2 text-sm text-white/70 leading-relaxed">{card.body}</p>
                    </div>
                ))}
            </section>
        </div>
    );
}
