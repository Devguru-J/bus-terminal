import {useMemo} from "react";
import {Link, useSearchParams} from "react-router-dom";
import {StationHeader} from "@/components/shell/StationHeader";
import {Icon} from "@/components/ui/Icon";
import {Button} from "@/components/ui/Button";
import {Badge} from "@/components/ui/Badge";
import {Select} from "@/components/ui/Field";
import {themes as builtinThemes, type RouteTheme} from "@/data/themes";
import {useUserThemesStore} from "@/stores/userThemesStore";

const ANSI_LABELS = [
    "black", "red", "green", "yellow", "blue", "magenta", "cyan", "white",
    "br-black", "br-red", "br-green", "br-yellow", "br-blue", "br-magenta", "br-cyan", "br-white"
];

/** 두 hex 색의 RGB 거리(0~441 범위). */
function colorDistance(a: string, b: string): number {
    const p = (h: string) => [
        parseInt(h.slice(1, 3), 16),
        parseInt(h.slice(3, 5), 16),
        parseInt(h.slice(5, 7), 16)
    ];
    const [r1, g1, b1] = p(a);
    const [r2, g2, b2] = p(b);
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

export function ThemeComparePage() {
    const [params, setParams] = useSearchParams();
    const userThemes = useUserThemesStore(s => s.items);
    const allThemes = useMemo<RouteTheme[]>(
        () => [...userThemes, ...builtinThemes],
        [userThemes]
    );

    const aId = params.get("a") ?? allThemes[0]?.id ?? "";
    const bId = params.get("b") ?? allThemes[1]?.id ?? allThemes[0]?.id ?? "";

    const a = allThemes.find(t => t.id === aId) ?? allThemes[0];
    const b = allThemes.find(t => t.id === bId) ?? allThemes[1] ?? allThemes[0];

    function setA(id: string) {
        params.set("a", id);
        setParams(params);
    }
    function setB(id: string) {
        params.set("b", id);
        setParams(params);
    }
    function swap() {
        setParams(new URLSearchParams({a: bId, b: aId}));
    }

    if (!a || !b) {
        return <div className="max-w-2xl mx-auto py-12 text-center">테마를 선택해주세요.</div>;
    }

    // 16개 색별 차이 계산
    const diffs = a.palette16.map((c, i) => ({
        index: i,
        label: ANSI_LABELS[i],
        a: c,
        b: b.palette16[i],
        d: colorDistance(c, b.palette16[i])
    }));
    const totalDiff = diffs.reduce((sum, d) => sum + d.d, 0);
    const maxDiff = Math.max(...diffs.map(d => d.d));

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <StationHeader
                title="테마 비교"
                eyebrow="Side-by-side Compare"
                subtitle={
                    <span className="inline-flex items-center gap-2 flex-wrap">
                        <Badge tone="info">총 색차 {totalDiff.toFixed(0)}</Badge>
                        <Badge tone={maxDiff > 200 ? "warn" : "muted"}>
                            최대 색차 {maxDiff.toFixed(0)}
                        </Badge>
                    </span>
                }
                actions={
                    <>
                        <Button variant="outline" size="sm" onClick={swap}>
                            <Icon name="swap_horiz" className="text-[14px]" />
                            좌우 교체
                        </Button>
                        <Link to="/themes">
                            <Button variant="outline" size="sm">
                                <Icon name="arrow_back" className="text-[14px]" />
                                환승센터
                            </Button>
                        </Link>
                    </>
                }
            />

            {/* 셀렉터 */}
            <div className="mb-5 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center rounded-xl border border-white/[0.06] bg-surface-container-lowest/80 p-3">
                <Select value={aId} onChange={e => setA(e.target.value)}>
                    {allThemes.map(t => (
                        <option key={t.id} value={t.id}>
                            {t.ko}
                        </option>
                    ))}
                </Select>
                <Icon
                    name="compare_arrows"
                    className="text-[20px] text-on-surface-variant hidden md:block justify-self-center"
                />
                <Select value={bId} onChange={e => setB(e.target.value)}>
                    {allThemes.map(t => (
                        <option key={t.id} value={t.id}>
                            {t.ko}
                        </option>
                    ))}
                </Select>
            </div>

            {/* 큰 미리보기 좌/우 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <ThemePreviewBlock theme={a} side="A" />
                <ThemePreviewBlock theme={b} side="B" />
            </div>

            {/* 16색 차이 그리드 */}
            <div className="rounded-xl border border-white/[0.06] bg-surface-container-lowest/80 p-4">
                <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant mb-3">
                    ANSI 색별 차이
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {diffs.map(d => {
                        const isLarge = d.d > 150;
                        return (
                            <div
                                key={d.index}
                                className={`rounded-lg border overflow-hidden ${
                                    isLarge
                                        ? "border-tertiary-fixed-dim/30 bg-tertiary-fixed-dim/[0.04]"
                                        : "border-white/[0.06]"
                                }`}
                            >
                                <div className="flex h-8">
                                    <div className="flex-1" style={{background: d.a}} />
                                    <div className="flex-1" style={{background: d.b}} />
                                </div>
                                <div className="px-2 py-1.5">
                                    <div className="font-mono text-[10px] text-on-surface-variant flex justify-between">
                                        <span>
                                            {d.index}. {d.label}
                                        </span>
                                        <span className={isLarge ? "text-tertiary-fixed-dim" : ""}>
                                            Δ {d.d.toFixed(0)}
                                        </span>
                                    </div>
                                    <div className="font-mono text-[10px] text-on-surface uppercase flex justify-between">
                                        <span>{d.a}</span>
                                        <span>{d.b}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <p className="mt-3 text-[11px] text-on-surface-variant">
                    Δ = RGB 유클리드 거리. 150 이상이면 눈에 띄게 다른 색입니다.
                </p>
            </div>
        </div>
    );
}

function ThemePreviewBlock({theme, side}: {theme: RouteTheme; side: "A" | "B"}) {
    return (
        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
            <div className="px-4 py-2 border-b border-white/[0.05] bg-surface-container flex items-center justify-between">
                <div className="min-w-0">
                    <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-primary-fixed-dim">
                        {side} · {theme.ko}
                    </div>
                    <div className="font-mono text-[10px] text-on-surface-variant/70 truncate">
                        {theme.id}
                    </div>
                </div>
                <Link
                    to={`/themes/${theme.id}`}
                    className="text-on-surface-variant hover:text-primary-fixed-dim p-1"
                    aria-label="자세히"
                >
                    <Icon name="open_in_new" className="text-[16px]" />
                </Link>
            </div>
            <pre
                className="p-4 font-mono text-[12px] leading-relaxed whitespace-pre-wrap"
                style={{background: theme.background, color: theme.foreground}}
            >
                <span style={{color: theme.accent}}>❯</span> git status{"\n"}
                On branch <span style={{color: theme.palette16[12]}}>main</span>{"\n"}
                {"\n"}Changes to be committed:{"\n"}
                {"  "}
                <span style={{color: theme.palette16[2]}}>modified:</span> themes.ts{"\n"}
                {"\n"}<span style={{color: theme.palette16[12]}}>function</span>{" "}
                <span style={{color: theme.palette16[4]}}>compare</span>(a, b) {"{"}{"\n"}
                {"  "}<span style={{color: theme.palette16[5]}}>return</span>{" "}
                <span style={{color: theme.palette16[3]}}>diff</span>(a, b);{"\n"}
                {"}"}{"\n"}
            </pre>
            <div className="flex">
                {theme.palette16.map((c, i) => (
                    <span
                        key={i}
                        className="h-4 flex-1"
                        style={{background: c}}
                        title={`${i}: ${c}`}
                    />
                ))}
            </div>
        </div>
    );
}
