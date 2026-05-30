import {Link} from "react-router-dom";
import {motion} from "framer-motion";
import {StationHeader} from "@/components/shell/StationHeader";
import {Icon} from "@/components/ui/Icon";
import {cn} from "@/lib/utils";
import {
    TOOL_CATEGORIES,
    TOOL_GUIDE,
    type ToolCategory,
    type ToolGuideEntry
} from "@/data/toolGuide";

const CATEGORY_LABEL = Object.fromEntries(
    TOOL_CATEGORIES.map(c => [c.id, c.label])
) as Record<ToolCategory, string>;

const cardParent = {
    show: {transition: {staggerChildren: 0.05}}
};
const cardItem = {
    hidden: {opacity: 0, y: 12},
    show: {
        opacity: 1,
        y: 0,
        transition: {type: "spring" as const, stiffness: 200, damping: 24}
    }
};

const linkButtonBase =
    "inline-flex h-8 items-center justify-center gap-2 rounded px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const linkButtonPrimary =
    "bg-primary-fixed-dim text-on-primary hover:bg-primary-fixed shadow-glow-primary";
const linkButtonOutline =
    "border border-white/10 bg-white/[0.02] text-on-surface hover:bg-white/[0.06]";

function ToolCard({tool}: {tool: ToolGuideEntry}) {
    return (
        <motion.article
            variants={cardItem}
            className="flex flex-col gap-4 rounded-xl border border-white/[0.06] bg-surface-container-lowest/80 p-5"
        >
            {/* 헤더 — 아이콘 · 이름 · 카테고리 · 지원 OS */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg border border-primary-fixed-dim/30 bg-primary-fixed-dim/10 text-primary-fixed-dim">
                        <Icon name={tool.icon} className="text-[20px]" />
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-display text-title-lg text-on-surface">
                                {tool.name}
                            </h3>
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant">
                                {CATEGORY_LABEL[tool.category]}
                            </span>
                        </div>
                        <p className="text-[13px] text-on-surface-variant mt-0.5">
                            {tool.tagline}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1">
                    {tool.platforms.map(os => (
                        <span
                            key={os}
                            className="rounded border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-on-surface-variant/80"
                        >
                            {os}
                        </span>
                    ))}
                </div>
            </div>

            {/* 이게 뭐예요? */}
            <div>
                <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-primary-fixed-dim mb-1">
                    이게 뭐예요?
                </div>
                <p className="text-body-md text-on-surface-variant leading-relaxed">
                    {tool.what}
                </p>
            </div>

            {/* 장점 · 단점 */}
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-emerald-400/15 bg-emerald-400/[0.04] p-3">
                    <div className="flex items-center gap-1.5 font-mono text-label-xs uppercase tracking-[0.12em] text-emerald-300/90 mb-2">
                        <Icon name="thumb_up" className="text-[14px]" />
                        장점
                    </div>
                    <ul className="space-y-1.5">
                        {tool.pros.map(p => (
                            <li key={p} className="flex gap-1.5 text-[13px] text-on-surface-variant">
                                <Icon name="check" className="mt-0.5 text-[14px] text-emerald-400/80 shrink-0" />
                                <span>{p}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="rounded-lg border border-amber-400/15 bg-amber-400/[0.04] p-3">
                    <div className="flex items-center gap-1.5 font-mono text-label-xs uppercase tracking-[0.12em] text-amber-300/90 mb-2">
                        <Icon name="info" className="text-[14px]" />
                        알아둘 점
                    </div>
                    <ul className="space-y-1.5">
                        {tool.cons.map(c => (
                            <li key={c} className="flex gap-1.5 text-[13px] text-on-surface-variant">
                                <Icon name="remove" className="mt-0.5 text-[14px] text-amber-400/80 shrink-0" />
                                <span>{c}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* 이런 분께 */}
            <div className="flex gap-2 rounded-lg border border-primary-fixed-dim/20 bg-primary-fixed-dim/[0.05] p-3">
                <Icon name="person_pin_circle" className="mt-0.5 text-[16px] text-primary-fixed-dim shrink-0" />
                <p className="text-[13px] text-on-surface">
                    <span className="text-primary-fixed-dim">이런 분께</span> · {tool.bestFor}
                </p>
            </div>

            {/* 액션 — 공식 홈페이지 + 설정하러 가기 */}
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                <Link to={tool.to} className={cn(linkButtonBase, linkButtonPrimary)}>
                    <Icon name="tune" className="text-[15px]" />
                    BusTerminal에서 설정하기
                </Link>
                <a
                    href={tool.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(linkButtonBase, linkButtonOutline)}
                >
                    공식 홈페이지
                    <Icon name="open_in_new" className="text-[15px]" />
                </a>
            </div>
        </motion.article>
    );
}

export function ToolsPage() {
    return (
        <div className="max-w-6xl mx-auto">
            <StationHeader
                title="툴 소개"
                eyebrow="Tools · 7개 도구 한눈에"
                subtitle="각 도구가 무엇이고, 장단점은 무엇이며, 나에게 맞는지 — 그리고 공식 홈페이지까지 한 곳에서 살펴보세요. 마음에 드는 도구는 바로 설정하러 갈 수 있어요."
            />

            <aside
                className="mb-8 rounded-xl border border-primary-fixed-dim/25 bg-primary-fixed-dim/[0.04] p-5"
                aria-label="어떤 걸 골라야 하나요?"
            >
                <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-primary-fixed-dim">
                    어떤 걸 골라야 하나요?
                </div>
                <p className="text-body-md text-on-surface-variant mt-2">
                    터미널·에디터·셸·멀티플렉서는 서로 역할이 달라요. 보통은 <span className="text-on-surface">터미널 하나 + 셸 하나</span>로 시작하고,
                    필요해지면 에디터와 멀티플렉서를 더합니다.
                </p>
                <ul className="space-y-2 pt-3">
                    {TOOL_CATEGORIES.map(c => (
                        <li key={c.id} className="flex gap-2 text-[13px]">
                            <Icon name="arrow_right" className="mt-0.5 text-[16px] text-primary-fixed-dim shrink-0" />
                            <span className="text-on-surface-variant">
                                <span className="text-on-surface font-medium">{c.label}</span> — {c.pickHint}
                            </span>
                        </li>
                    ))}
                </ul>
            </aside>

            <div className="space-y-10">
                {TOOL_CATEGORIES.map(category => {
                    const tools = TOOL_GUIDE.filter(t => t.category === category.id);
                    if (tools.length === 0) return null;
                    return (
                        <section key={category.id}>
                            <div className="mb-4">
                                <h2 className="font-display text-headline-sm text-on-surface">
                                    {category.label}
                                </h2>
                                <p className="text-body-md text-on-surface-variant mt-1 max-w-2xl">
                                    {category.blurb}
                                </p>
                            </div>
                            <motion.div
                                initial="hidden"
                                whileInView="show"
                                viewport={{once: true, margin: "-80px"}}
                                variants={cardParent}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-5"
                            >
                                {tools.map(tool => (
                                    <ToolCard key={tool.id} tool={tool} />
                                ))}
                            </motion.div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
