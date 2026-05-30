import {useMemo} from "react";
import {StationHeader} from "@/components/shell/StationHeader";
import {ConfigPanel} from "@/components/platform/ConfigPanel";
import {Button} from "@/components/ui/Button";
import {Badge} from "@/components/ui/Badge";
import {Icon} from "@/components/ui/Icon";

const ISSUE_BASE = "https://github.com/Devguru-J/bus-terminal/issues/new";

type FeedbackKind = "bug" | "improvement" | "tool";

const FEEDBACK_OPTIONS: Array<{
    kind: FeedbackKind;
    title: string;
    badge: string;
    icon: string;
    desc: string;
    cta: string;
}> = [
    {
        kind: "bug",
        title: "오류 신고",
        badge: "bug",
        icon: "bug_report",
        desc: "설정이 깨지거나, 다운로드 결과가 이상하거나, 화면이 멈추는 문제를 알려주세요.",
        cta: "오류 신고하기"
    },
    {
        kind: "improvement",
        title: "개선 요청",
        badge: "request",
        icon: "construction",
        desc: "헷갈리는 문구, 부족한 옵션, 더 편했으면 하는 흐름을 제안할 수 있어요.",
        cta: "개선 요청하기"
    },
    {
        kind: "tool",
        title: "도구 추가 요청",
        badge: "tool",
        icon: "add_circle",
        desc: "Kitty, Alacritty, WezTerm처럼 새로 지원했으면 하는 터미널·에디터를 남겨주세요.",
        cta: "도구 요청하기"
    }
];

function issueUrl(kind: FeedbackKind, currentPath: string): string {
    const titlePrefix: Record<FeedbackKind, string> = {
        bug: "[Bug]",
        improvement: "[Improvement]",
        tool: "[Tool Request]"
    };
    const body: Record<FeedbackKind, string> = {
        bug: [
            "## 무엇이 잘못됐나요?",
            "",
            "## 어떤 설정/페이지에서 발생했나요?",
            `- 페이지: ${currentPath}`,
            "",
            "## 기대한 동작",
            "",
            "## 실제 동작",
            "",
            "## 재현 방법",
            "1.",
            "2.",
            "3."
        ].join("\n"),
        improvement: [
            "## 어떤 점이 불편했나요?",
            "",
            `- 페이지: ${currentPath}`,
            "",
            "## 어떻게 바뀌면 좋을까요?",
            "",
            "## 왜 필요하다고 느꼈나요?"
        ].join("\n"),
        tool: [
            "## 추가했으면 하는 도구",
            "",
            "## 공식 홈페이지 / 문서",
            "",
            "## 만들고 싶은 설정 파일 경로",
            "",
            "## 꼭 필요하다고 생각하는 옵션"
        ].join("\n")
    };
    const params = new URLSearchParams({
        title: `${titlePrefix[kind]} `,
        body: body[kind],
        labels: kind === "bug" ? "bug" : "enhancement"
    });
    return `${ISSUE_BASE}?${params.toString()}`;
}

export function FeedbackPage() {
    const currentPath = useMemo(() => {
        if (typeof window === "undefined") return "/";
        return `${window.location.pathname}${window.location.search}`;
    }, []);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <StationHeader
                title="의견 보내기"
                eyebrow="Feedback · 민원 창구"
                subtitle="버그, 개선 요청, 새 도구 요청을 남겨주세요."
                actions={<Badge tone="info">GitHub Issues</Badge>}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {FEEDBACK_OPTIONS.map(option => (
                    <article
                        key={option.kind}
                        className="flex min-h-[220px] flex-col rounded-xl border border-white/[0.06] bg-surface-container-lowest/80 p-5"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <span className="grid h-10 w-10 place-items-center rounded-lg border border-primary-fixed-dim/30 bg-primary-fixed-dim/10 text-primary-fixed-dim">
                                <Icon name={option.icon} className="text-[20px]" />
                            </span>
                            <Badge tone={option.kind === "bug" ? "warn" : "info"}>{option.badge}</Badge>
                        </div>
                        <h2 className="mt-4 font-display text-title-lg text-on-surface">
                            {option.title}
                        </h2>
                        <p className="mt-2 text-body-sm leading-relaxed text-on-surface-variant">
                            {option.desc}
                        </p>
                        <a
                            href={issueUrl(option.kind, currentPath)}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-auto inline-flex h-9 items-center justify-center gap-2 rounded border border-white/10 bg-white/[0.02] px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-on-surface transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                            {option.cta}
                            <Icon name="open_in_new" className="text-[15px]" />
                        </a>
                    </article>
                ))}
            </div>

            <ConfigPanel title="남겨주면 좋은 정보">
                <ul className="space-y-2 text-body-sm text-on-surface-variant">
                    <li className="flex gap-2">
                        <Icon name="check" className="mt-0.5 text-[15px] text-primary-fixed-dim" />
                        어떤 도구 화면에서 발생했는지
                    </li>
                    <li className="flex gap-2">
                        <Icon name="check" className="mt-0.5 text-[15px] text-primary-fixed-dim" />
                        기대한 설정 파일과 실제 다운로드된 내용이 어떻게 다른지
                    </li>
                    <li className="flex gap-2">
                        <Icon name="check" className="mt-0.5 text-[15px] text-primary-fixed-dim" />
                        가져오기 실패라면 미인식 줄이나 원본 설정 일부
                    </li>
                </ul>
            </ConfigPanel>
        </div>
    );
}
