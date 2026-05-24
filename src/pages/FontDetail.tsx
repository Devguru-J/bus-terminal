import {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {StationHeader} from "@/components/shell/StationHeader";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {Badge} from "@/components/ui/Badge";
import {RangeInput} from "@/components/ui/Field";
import {fonts, PREVIEW_SAMPLES} from "@/data/fonts";
import {useGhosttyStore} from "@/stores/ghosttyStore";
import {useIterm2Store} from "@/stores/iterm2Store";
import {useWarpStore} from "@/stores/warpStore";
import {useFavoritesStore} from "@/stores/favoritesStore";
import {toast} from "@/stores/toastStore";
import {copyText} from "@/lib/download";
import {cn} from "@/lib/utils";

type FontTarget = "all" | "ghostty" | "iterm2" | "warp";

export function FontDetailPage() {
    const {id} = useParams();
    const font = fonts.find(f => f.id === id);
    const favorite = useFavoritesStore(s => s.fonts.includes(id ?? ""));
    const toggleFavorite = useFavoritesStore(s => s.toggleFont);
    const setGhosttyField = useGhosttyStore(s => s.setField);
    const setIterm2Field = useIterm2Store(s => s.setField);
    const setWarpAppearance = useWarpStore(s => s.setAppearance);

    const [size, setSize] = useState(14);
    const [weight, setWeight] = useState<number>(font?.weights[Math.floor(font.weights.length / 2)] ?? 400);
    const [italic, setItalic] = useState(false);
    const [target, setTarget] = useState<FontTarget>("all");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!font?.googleFontUrl) return;
        if (document.querySelector(`link[href="${font.googleFontUrl}"]`)) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = font.googleFontUrl;
        document.head.appendChild(link);
    }, [font]);

    if (!font) {
        return (
            <div className="max-w-2xl mx-auto py-12 text-center">
                <Icon name="text_fields" className="text-[40px] text-on-surface-variant/40" />
                <p className="mt-3 text-body-md text-on-surface-variant">
                    "{id}" 폰트를 찾을 수 없어요.
                </p>
                <Link
                    to="/fonts"
                    className="inline-flex items-center gap-1 mt-4 text-primary-fixed-dim hover:underline"
                >
                    <Icon name="arrow_back" className="text-[16px]" /> 폰트 환승센터로
                </Link>
            </div>
        );
    }

    function apply() {
        const f = font!;
        if (target === "all" || target === "ghostty") {
            setGhosttyField("font-family", f.name);
            setGhosttyField("font-size", size);
        }
        if (target === "all" || target === "iterm2") {
            setIterm2Field("fontFamily", f.name);
            setIterm2Field("fontSize", size);
        }
        if (target === "all" || target === "warp") {
            setWarpAppearance("fontFamily", f.name);
            setWarpAppearance("fontSize", size);
        }
        toast(
            target === "all"
                ? `3개 승강장에 "${f.name}" ${size}pt 송출 완료.`
                : `${target}에 "${f.name}" ${size}pt 환승 완료.`,
            "success"
        );
    }

    async function copyShare() {
        const url = `${window.location.origin}/fonts/${font!.id}`;
        const ok = await copyText(url);
        if (ok) {
            setCopied(true);
            toast("공유 링크를 복사했어요.", "success");
            setTimeout(() => setCopied(false), 1500);
        }
    }

    const style: React.CSSProperties = {
        fontFamily: font.family,
        fontSize: `${size}px`,
        fontWeight: weight,
        fontStyle: italic ? "italic" : "normal",
        lineHeight: 1.55
    };

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <StationHeader
                title={font.name}
                eyebrow={`폰트 노선 · ${font.author}`}
                subtitle={
                    <span className="inline-flex items-center gap-2 flex-wrap">
                        {font.tags.map(t => (
                            <Badge
                                key={t}
                                tone={
                                    t === "paid" ? "warn" : t === "ligatures" || t === "popular" ? "active" : "muted"
                                }
                            >
                                {t}
                            </Badge>
                        ))}
                    </span>
                }
                actions={
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleFavorite(font.id)}
                        >
                            <Icon
                                name="favorite"
                                className={cn("text-[16px]", favorite && "text-error")}
                                fill={favorite}
                            />
                            {favorite ? "해제" : "즐겨찾기"}
                        </Button>
                        <Button size="sm" onClick={apply}>
                            <Icon name="cell_tower" className="text-[16px]" />
                            {target === "all" ? "전체 송출" : "환승 적용"}
                        </Button>
                    </>
                }
            />

            <div className="mb-4">
                <Link
                    to="/fonts"
                    className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary-fixed-dim text-code-sm"
                >
                    <Icon name="arrow_back" className="text-[14px]" /> 폰트 환승센터
                </Link>
            </div>

            <p className="text-body-md text-on-surface-variant mb-6">{font.description}</p>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
                {/* 좌측: 미리보기 4종 */}
                <div className="space-y-5 min-w-0">
                    <Section title="ABCDEFG · 0123456789" hint="Hero">
                        <div style={{...style, fontSize: `${size * 3}px`, lineHeight: 1}}>
                            Aa Bb Cc 가나다
                        </div>
                    </Section>
                    <Section title="English Pangram" hint="english">
                        <div style={style}>{PREVIEW_SAMPLES.english}</div>
                    </Section>
                    <Section title="한글 표본" hint="korean">
                        <div style={style}>{PREVIEW_SAMPLES.korean}</div>
                    </Section>
                    <Section title="Code" hint="code">
                        <pre style={{...style, whiteSpace: "pre-wrap"}}>
                            {PREVIEW_SAMPLES.code}
                        </pre>
                    </Section>
                    <Section title="Terminal" hint="terminal">
                        <pre style={{...style, whiteSpace: "pre-wrap"}}>
                            {PREVIEW_SAMPLES.terminal}
                        </pre>
                    </Section>
                    <Section title="Weights" hint="weight ladder">
                        <div className="space-y-1">
                            {font.weights.map(w => (
                                <div
                                    key={w}
                                    style={{...style, fontWeight: w}}
                                    className="border-b border-white/[0.04] py-1"
                                >
                                    <span className="text-on-surface-variant text-[11px] font-mono mr-3">
                                        {w}
                                    </span>
                                    The quick brown fox jumps · 0123456789
                                </div>
                            ))}
                        </div>
                    </Section>
                </div>

                {/* 우측: 컨트롤 */}
                <div className="space-y-3 xl:sticky xl:top-[80px] h-fit">
                    <div className="rounded-xl border border-white/[0.06] bg-surface-container-lowest/80 p-4 space-y-3">
                        <div>
                            <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant mb-1">
                                Font Size {size}pt
                            </div>
                            <RangeInput
                                value={size}
                                min={8}
                                max={48}
                                step={1}
                                onChange={v => setSize(v)}
                            />
                        </div>
                        <div>
                            <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant mb-1">
                                Weight {weight}
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {font.weights.map(w => (
                                    <button
                                        key={w}
                                        type="button"
                                        onClick={() => setWeight(w)}
                                        className={cn(
                                            "h-7 px-2 rounded font-mono text-[11px]",
                                            w === weight
                                                ? "bg-primary-fixed-dim text-on-primary"
                                                : "bg-white/[0.04] text-on-surface-variant hover:text-on-surface"
                                        )}
                                    >
                                        {w}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={italic}
                                onChange={e => setItalic(e.target.checked)}
                            />
                            <span className="text-code-sm text-on-surface">Italic</span>
                        </label>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-surface-container-lowest/80 p-4 space-y-3">
                        <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant">
                            적용 대상
                        </div>
                        <div className="inline-flex flex-wrap rounded border border-white/[0.06] bg-surface-container-lowest p-0.5">
                            {(["all", "ghostty", "iterm2", "warp"] as FontTarget[]).map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setTarget(t)}
                                    className={cn(
                                        "h-8 px-3 rounded-[2px] font-mono text-label-xs uppercase tracking-[0.12em] transition",
                                        target === t
                                            ? "bg-primary-fixed-dim text-on-primary"
                                            : "text-on-surface-variant hover:text-on-surface"
                                    )}
                                >
                                    {t === "all" ? "전체" : t}
                                </button>
                            ))}
                        </div>
                        <Button onClick={apply} className="w-full">
                            <Icon name="cell_tower" className="text-[16px]" />
                            {target === "all" ? "3개 터미널에 적용" : "이 터미널에 적용"}
                        </Button>
                    </div>

                    {font.installNote && (
                        <div className="rounded-xl border border-tertiary-fixed-dim/20 bg-tertiary-fixed-dim/[0.06] p-4">
                            <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-tertiary-fixed-dim mb-2">
                                설치 안내
                            </div>
                            <p className="text-[12px] text-on-surface">{font.installNote}</p>
                        </div>
                    )}

                    {font.homepage && (
                        <a
                            href={font.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-xl border border-white/[0.06] bg-surface-container-lowest/80 p-3 hover:border-white/15 transition"
                        >
                            <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant mb-1">
                                공식 페이지
                            </div>
                            <div className="text-code-sm text-on-surface inline-flex items-center gap-1 truncate">
                                <Icon name="open_in_new" className="text-[14px]" />
                                {font.homepage.replace(/^https?:\/\//, "")}
                            </div>
                        </a>
                    )}

                    <Button variant="outline" size="sm" className="w-full" onClick={copyShare}>
                        <Icon name="link" className="text-[14px]" />
                        {copied ? "복사됨" : "공유 링크 복사"}
                    </Button>
                </div>
            </div>
        </div>
    );

}

function Section({
    title,
    hint,
    children
}: {
    title: string;
    hint: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-white/[0.06] bg-surface-container-lowest/80 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.05]">
                <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface">
                    {title}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/70">
                    {hint}
                </div>
            </div>
            <div className="p-5 text-on-surface break-words">{children}</div>
        </div>
    );
}
