import {Link, useParams} from "react-router-dom";
import {StationHeader} from "@/components/shell/StationHeader";
import {Button} from "@/components/ui/Button";
import {Badge} from "@/components/ui/Badge";
import {Icon} from "@/components/ui/Icon";
import {NotFoundPage} from "@/pages/NotFound";
import {APPLY_GUIDE_ORDER, APPLY_GUIDES, getApplyGuideBySlug} from "@/lib/applyGuide";

export function ApplyGuideDetailPage() {
    const {slug = ""} = useParams();
    const guide = getApplyGuideBySlug(slug);

    if (!guide) return <NotFoundPage />;

    return (
        <article className="max-w-5xl mx-auto pb-12 space-y-8">
            <StationHeader
                title={guide.seoTitle.replace(" | 버스터미널", "")}
                eyebrow="Apply Guide"
                subtitle={guide.seoDescription}
                actions={
                    <>
                        <Link to={`/${guide.id}`}>
                            <Button variant="outline" size="sm">
                                <Icon name="tune" className="text-[14px]" />
                                설정 만들기
                            </Button>
                        </Link>
                        <Link to="/export">
                            <Button size="sm">
                                <Icon name="rocket_launch" className="text-[14px]" />
                                출발권 만들기
                            </Button>
                        </Link>
                    </>
                }
            />

            <section className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-5">
                <div className="rounded-xl border border-primary-fixed-dim/25 bg-primary-fixed-dim/[0.04] p-5">
                    <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-primary-fixed-dim">
                        먼저 알아둘 것
                    </div>
                    <h2 className="mt-2 font-display text-headline-sm text-on-surface">
                        다운로드 파일은 자동 적용되지 않습니다
                    </h2>
                    <p className="mt-3 text-body-md text-on-surface-variant leading-relaxed">
                        버스터미널은 안전하게 설정 파일을 만들어 다운로드합니다. 실제 적용은 기존 설정을 백업한 뒤,
                        각 도구가 읽는 정해진 위치에 파일을 넣고 다시 읽는 방식으로 진행합니다.
                    </p>
                    {guide.caution && (
                        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3">
                            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-300/80">
                                <Icon name="warning" className="text-[14px]" />
                                주의
                            </div>
                            <p className="mt-2 text-[12px] leading-relaxed text-on-surface-variant">
                                {guide.caution}
                            </p>
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-surface-container-lowest/80 p-5">
                    <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant">
                        파일 이름과 위치
                    </div>
                    <div className="mt-3 divide-y divide-white/[0.06]">
                        {guide.files.map(file => (
                            <div key={`${file.downloaded}-${file.destination}`} className="py-3">
                                <code className="font-mono text-[13px] text-primary-fixed-dim break-all">
                                    {file.downloaded}
                                </code>
                                <div className="mt-1 flex items-start gap-2">
                                    <Icon name="arrow_forward" className="mt-0.5 text-[14px] text-on-surface-variant" />
                                    <code className="font-mono text-[12px] text-on-surface break-all">
                                        {file.destination}
                                    </code>
                                </div>
                                {file.note && (
                                    <p className="mt-1 text-[12px] text-on-surface-variant">
                                        {file.note}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="rounded-xl border border-white/[0.06] bg-surface-container-low/60 p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-primary-fixed-dim">
                            적용 순서
                        </div>
                        <h2 className="mt-1 font-display text-headline-sm text-on-surface">
                            {guide.label} 설정 적용하기
                        </h2>
                    </div>
                    <Badge tone="active">{guide.files.length} file</Badge>
                </div>
                <ol className="mt-5 space-y-3">
                    {guide.steps.map((step, index) => (
                        <li key={step} className="flex gap-3 rounded-lg border border-white/[0.06] bg-surface-container-lowest/80 p-3">
                            <span className="h-7 w-7 shrink-0 rounded-full border border-primary-fixed-dim/40 bg-primary-fixed-dim/10 grid place-items-center font-mono text-[11px] text-primary-fixed-dim">
                                {index + 1}
                            </span>
                            <span className="text-body-md text-on-surface-variant leading-relaxed">
                                {step}
                            </span>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="rounded-xl border border-white/[0.06] bg-[#0f1110] overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
                    <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant">
                        복사해서 쓸 명령
                    </div>
                    <Link
                        to="/export"
                        className="font-mono text-label-xs uppercase tracking-[0.14em] text-primary-fixed-dim hover:underline"
                    >
                        체크리스트로 보기
                    </Link>
                </div>
                <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-on-surface">
                    <code>{guide.commands.join("\n")}</code>
                </pre>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-[1fr_0.85fr] gap-5">
                <div className="rounded-xl border border-primary-fixed-dim/20 bg-primary-fixed-dim/[0.05] p-5">
                    <div className="flex items-center gap-2 font-mono text-label-xs uppercase tracking-[0.14em] text-primary-fixed-dim">
                        <Icon name="fact_check" className="text-[16px]" />
                        적용 확인
                    </div>
                    <p className="mt-3 text-body-md text-on-surface-variant leading-relaxed">
                        {guide.verify}
                    </p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-surface-container-lowest/80 p-5">
                    <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant">
                        다른 적용 가이드
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {APPLY_GUIDE_ORDER.filter(id => id !== guide.id).map(id => (
                            <Link
                                key={id}
                                to={`/guides/${APPLY_GUIDES[id].slug}`}
                                className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant hover:border-white/25 hover:text-on-surface transition"
                            >
                                {APPLY_GUIDES[id].label}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </article>
    );
}
