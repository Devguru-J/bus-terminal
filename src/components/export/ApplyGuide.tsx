import {useEffect, useMemo, useState} from "react";
import {Button} from "@/components/ui/Button";
import {Badge} from "@/components/ui/Badge";
import {Icon} from "@/components/ui/Icon";
import {copyText} from "@/lib/download";
import {APPLY_GUIDES, APPLY_GUIDE_ORDER, type ApplyGuide as ApplyGuideData} from "@/lib/applyGuide";
import type {ExportPlatform} from "@/lib/exportSelection";
import {toast} from "@/stores/toastStore";
import {cn} from "@/lib/utils";

interface Props {
    selected: Record<ExportPlatform, boolean>;
}

export function ApplyGuide({selected}: Props) {
    const activePlatforms = useMemo(
        () => APPLY_GUIDE_ORDER.filter(id => selected[id]),
        [selected]
    );
    const visiblePlatforms = activePlatforms.length > 0 ? activePlatforms : APPLY_GUIDE_ORDER;
    const [current, setCurrent] = useState<ExportPlatform>(visiblePlatforms[0] ?? "ghostty");

    useEffect(() => {
        if (!visiblePlatforms.includes(current)) {
            setCurrent(visiblePlatforms[0] ?? "ghostty");
        }
    }, [current, visiblePlatforms]);

    const guide = APPLY_GUIDES[current];

    async function copyCommands() {
        const ok = await copyText(guide.commands.join("\n"));
        toast(ok ? `${guide.label} 적용 명령을 복사했어요.` : "복사 권한을 확인해 주세요.", ok ? "success" : "warn");
    }

    return (
        <section className="rounded-xl border border-primary-fixed-dim/25 bg-primary-fixed-dim/[0.035] p-5">
            <div className="grid grid-cols-1 lg:grid-cols-[0.82fr_1.18fr] gap-5">
                <div className="min-w-0">
                    <div className="font-mono text-label-xs uppercase tracking-[0.16em] text-primary-fixed-dim">
                        다운로드 후 적용
                    </div>
                    <h2 className="mt-1 font-display text-headline-sm text-on-surface">
                        파일을 어디에 넣어야 하는지까지 안내합니다
                    </h2>
                    <p className="mt-3 text-body-md text-on-surface-variant leading-relaxed">
                        다운로드는 끝이 아니라 출발 전 단계예요. 아래에서 도구를 고르면 받은 파일 이름,
                        실제로 옮길 위치, 복사해서 쓸 명령, 마지막 확인 방법을 한 번에 볼 수 있습니다.
                    </p>

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                        <MiniStep n={1} icon="inventory_2" title="받은 파일 확인" text="Downloads 폴더에 저장된 파일 이름을 봅니다." />
                        <MiniStep n={2} icon="backup" title="기존 설정 백업" text="바로 덮어쓰기 전에 .bak 파일을 남깁니다." />
                        <MiniStep n={3} icon="restart_alt" title="앱 다시 읽기" text="도구를 다시 열거나 reload 명령을 실행합니다." />
                    </div>
                </div>

                <div className="rounded-lg border border-white/[0.07] bg-surface-container-lowest/80 overflow-hidden">
                    <div className="border-b border-white/[0.06] p-3">
                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                            {visiblePlatforms.map(id => (
                                <button
                                    type="button"
                                    key={id}
                                    onClick={() => setCurrent(id)}
                                    className={cn(
                                        "shrink-0 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition active:scale-[0.98]",
                                        current === id
                                            ? "border-primary-fixed-dim/60 bg-primary-fixed-dim/15 text-primary-fixed-dim"
                                            : "border-white/10 bg-white/[0.02] text-on-surface-variant hover:text-on-surface hover:border-white/20"
                                    )}
                                >
                                    {APPLY_GUIDES[id].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <GuideDetail guide={guide} onCopy={copyCommands} />
                </div>
            </div>
        </section>
    );
}

function MiniStep({n, icon, title, text}: {n: number; icon: string; title: string; text: string}) {
    return (
        <div className="rounded-lg border border-white/[0.06] bg-surface-container-lowest/70 p-3">
            <div className="flex items-center gap-2">
                <span className="h-6 w-6 shrink-0 rounded-full border border-primary-fixed-dim/40 bg-primary-fixed-dim/10 grid place-items-center font-mono text-[11px] text-primary-fixed-dim">
                    {n}
                </span>
                <Icon name={icon} className="text-[16px] text-primary-fixed-dim" />
                <div className="font-display text-title-sm text-on-surface">{title}</div>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-on-surface-variant">{text}</p>
        </div>
    );
}

function GuideDetail({guide, onCopy}: {guide: ApplyGuideData; onCopy: () => void}) {
    return (
        <div className="p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-title-lg text-on-surface">{guide.label}</h3>
                        <Badge tone="active">초보 모드</Badge>
                    </div>
                    <p className="mt-1 text-body-sm text-on-surface-variant leading-relaxed">
                        {guide.summary}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={onCopy}>
                    <Icon name="content_copy" className="text-[14px]" />
                    명령 복사
                </Button>
            </div>

            <div className="rounded-lg border border-white/[0.06] bg-background/35">
                <div className="grid grid-cols-[0.9fr_1.1fr] gap-3 border-b border-white/[0.06] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant">
                    <span>받은 파일</span>
                    <span>실제 위치</span>
                </div>
                <div className="divide-y divide-white/[0.05]">
                    {guide.files.map(file => (
                        <div key={`${file.downloaded}-${file.destination}`} className="grid grid-cols-1 sm:grid-cols-[0.9fr_1.1fr] gap-1 sm:gap-3 px-3 py-2">
                            <code className="font-mono text-[12px] text-primary-fixed-dim break-all">
                                {file.downloaded}
                            </code>
                            <div className="min-w-0">
                                <code className="font-mono text-[12px] text-on-surface break-all">
                                    {file.destination}
                                </code>
                                {file.note && (
                                    <p className="mt-0.5 text-[11px] text-on-surface-variant">
                                        {file.note}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ol className="space-y-2">
                {guide.steps.map((step, index) => (
                    <li key={step} className="flex gap-2 text-body-sm text-on-surface-variant">
                        <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-white/[0.04] border border-white/[0.08] grid place-items-center font-mono text-[10px] text-on-surface">
                            {index + 1}
                        </span>
                        <span>{step}</span>
                    </li>
                ))}
            </ol>

            <div className="rounded-lg border border-white/[0.06] bg-[#0f1110] overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-3 py-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">
                        터미널에 붙여넣기
                    </span>
                    <button
                        type="button"
                        onClick={onCopy}
                        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-primary-fixed-dim hover:underline"
                    >
                        <Icon name="content_copy" className="text-[13px]" />
                        copy
                    </button>
                </div>
                <pre className="overflow-x-auto p-3 text-[12px] leading-relaxed text-on-surface">
                    <code>{guide.commands.join("\n")}</code>
                </pre>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-primary-fixed-dim/20 bg-primary-fixed-dim/[0.05] p-3">
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-primary-fixed-dim">
                        <Icon name="fact_check" className="text-[14px]" />
                        확인하기
                    </div>
                    <p className="mt-2 text-[12px] leading-relaxed text-on-surface-variant">
                        {guide.verify}
                    </p>
                </div>
                {guide.caution && (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3">
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
        </div>
    );
}
