import {motion} from "framer-motion";
import {ArrowRight, Sparkles} from "lucide-react";
import {Card} from "@/components/ui/Card";
import {Badge} from "@/components/ui/Badge";
import {Button} from "@/components/ui/Button";
import {PaletteStrip} from "@/components/platform/PaletteStrip";
import {themes, themeToConfigSnippet} from "@/data/themes";
import {useGhosttyStore} from "@/stores/ghosttyStore";
import {copyText} from "@/lib/download";
import {toast} from "@/stores/toastStore";
import {useNavigate} from "react-router-dom";

export function ThemesPage() {
    const applyTheme = useGhosttyStore(s => s.applyTheme);
    const navigate = useNavigate();

    return (
        <div className="mx-auto max-w-7xl px-5 pt-10 pb-16">
            <div className="flex items-end justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <span className="led-text text-3xl text-route-theme">3번</span>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">테마 환승센터</h1>
                        <p className="text-sm text-white/45 mt-1">
                            노선 스타일을 한 번에 환승하세요. 클릭하면 Ghostty 노선에 즉시 적용됩니다.
                        </p>
                    </div>
                </div>
                <Badge tone="amber">
                    <Sparkles size={10} /> {themes.length}개 노선 운행
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {themes.map((t, i) => (
                    <motion.div
                        key={t.id}
                        initial={{opacity: 0, y: 12}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: i * 0.05}}
                    >
                        <Card className="overflow-hidden">
                            {/* preview surface */}
                            <div
                                className="p-5 border-b border-line"
                                style={{background: t.background, color: t.foreground}}
                            >
                                <div className="flex items-center justify-between text-[11px] font-mono">
                                    <span style={{color: t.accent}}>● {t.ko}</span>
                                    <span style={{opacity: 0.5}}>{t.id}</span>
                                </div>
                                <div className="mt-3 font-mono text-sm leading-relaxed">
                                    <div>
                                        <span style={{color: t.accent}}>❯</span> echo "탑승 환영합니다"
                                    </div>
                                    <div style={{opacity: 0.7}}>탑승 환영합니다</div>
                                    <div className="mt-1">
                                        <span style={{color: t.accent}}>❯</span>{" "}
                                        <span
                                            className="rounded px-1"
                                            style={{background: t.selectionBg, color: t.selectionFg}}
                                        >
                                            git push
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                <h3 className="text-base font-semibold">{t.ko}</h3>
                                <p className="text-xs text-white/55 leading-relaxed">{t.description}</p>
                                <PaletteStrip colors={t.palette16} />
                                <div className="flex items-center gap-2 pt-1">
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            applyTheme(t);
                                            toast(`"${t.ko}"으로 환승했어요.`, "success");
                                            setTimeout(() => navigate("/ghostty"), 350);
                                        }}
                                    >
                                        탑승 완료 <ArrowRight size={14} />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                            copyText(themeToConfigSnippet(t)).then(() =>
                                                toast("스니펫을 복사했어요.", "success")
                                            )
                                        }
                                    >
                                        스니펫 복사
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
