import {Link} from "react-router-dom";
import {StationHeader} from "@/components/shell/StationHeader";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {Badge} from "@/components/ui/Badge";
import {fontPairings, type FontPairing} from "@/data/fontPairings";
import {fonts} from "@/data/fonts";
import {cn} from "@/lib/utils";

const VIBE_LABELS: Record<FontPairing["vibe"], string> = {
    classic: "클래식",
    modern: "모던",
    warm: "따뜻함",
    editorial: "에디토리얼",
    korean: "한국어"
};

const VIBE_TONES: Record<FontPairing["vibe"], "active" | "info" | "warn" | "muted"> = {
    classic: "muted",
    modern: "active",
    warm: "warn",
    editorial: "info",
    korean: "warn"
};

export function FontPairingsPage() {
    return (
        <div className="max-w-6xl mx-auto pb-12">
            <StationHeader
                title="폰트 페어링"
                eyebrow="Curated Pairings"
                subtitle="코드용 monospace와 UI용 sans-serif의 검증된 조합. 한 클릭으로 두 폰트를 동시에 가져옵니다."
                actions={
                    <Link to="/fonts">
                        <Button variant="outline" size="sm">
                            <Icon name="arrow_back" className="text-[14px]" /> 폰트 환승센터
                        </Button>
                    </Link>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {fontPairings.map(p => (
                    <PairingCard key={p.id} pairing={p} />
                ))}
            </div>
        </div>
    );
}

function PairingCard({pairing}: {pairing: FontPairing}) {
    const mono = fonts.find(f => f.id === pairing.mono);
    const sans = fonts.find(f => f.id === pairing.sans);
    if (!mono || !sans) return null;

    return (
        <article className="rounded-xl border border-white/[0.06] bg-surface-container-lowest/80 overflow-hidden">
            <header className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
                <div className="min-w-0">
                    <div className="font-display text-title-md text-on-surface truncate">
                        {pairing.name}
                    </div>
                    <div className="text-[11px] text-on-surface-variant mt-0.5">
                        {pairing.description}
                    </div>
                </div>
                <Badge tone={VIBE_TONES[pairing.vibe]}>{VIBE_LABELS[pairing.vibe]}</Badge>
            </header>

            {/* 미리보기 */}
            <div className="p-4 space-y-4 border-b border-white/[0.05]">
                <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-on-surface-variant/60 mb-1">
                        UI · {sans.name}
                    </div>
                    <div
                        className="text-on-surface text-[24px] leading-tight"
                        style={{fontFamily: sans.family}}
                    >
                        내 개발환경으로 출발
                    </div>
                    <div
                        className="text-on-surface-variant text-[14px] mt-1"
                        style={{fontFamily: sans.family}}
                    >
                        The quick brown fox jumps over the lazy dog. 다람쥐 헌 쳇바퀴에 타고파.
                    </div>
                </div>
                <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-on-surface-variant/60 mb-1">
                        Code · {mono.name}
                    </div>
                    <pre
                        className="text-on-surface text-[13px] leading-relaxed whitespace-pre-wrap"
                        style={{fontFamily: mono.family}}
                    >
                        {`function fibonacci(n: number): number {
    if (n < 2) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}`}
                    </pre>
                </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex flex-wrap gap-1">
                    {[...mono.tags, ...sans.tags]
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .slice(0, 5)
                        .map(t => (
                            <span
                                key={t}
                                className="text-[10px] font-mono uppercase tracking-[0.1em] text-on-surface-variant/70"
                            >
                                #{t}
                            </span>
                        ))}
                </div>
                <div className="flex items-center gap-1">
                    <Link
                        to={`/fonts/${mono.id}`}
                        className={cn(
                            "h-8 px-3 grid place-items-center rounded font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant hover:text-on-surface hover:bg-white/[0.04]"
                        )}
                    >
                        Mono
                    </Link>
                    <Link
                        to={`/fonts/${sans.id}`}
                        className={cn(
                            "h-8 px-3 grid place-items-center rounded font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant hover:text-on-surface hover:bg-white/[0.04]"
                        )}
                    >
                        Sans
                    </Link>
                </div>
            </div>
        </article>
    );
}
