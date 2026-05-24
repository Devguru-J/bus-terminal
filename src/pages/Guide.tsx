import {Link, useNavigate} from "react-router-dom";
import {StationHeader} from "@/components/shell/StationHeader";
import {ConfigPanel} from "@/components/platform/ConfigPanel";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {Badge} from "@/components/ui/Badge";

const TERM_GLOSSARY: Array<{term: string; meaning: string; example: string}> = [
    {
        term: "승강장",
        meaning: "설정할 도구의 페이지",
        example: "Ghostty 승강장 → Ghostty 설정 화면"
    },
    {
        term: "노선",
        meaning: "저장해 둔 설정 조합",
        example: "내 Ghostty 노선 = 내가 만든 Ghostty 설정 한 벌"
    },
    {
        term: "차고 보관",
        meaning: "현재 설정을 이름 붙여 저장",
        example: "버튼 클릭 → '내 노선' 페이지에 보관됨"
    },
    {
        term: "환승하기",
        meaning: "기존 설정 파일을 가져와서 적용",
        example: ".tmux.conf 붙여넣기 → 자동으로 옵션이 채워짐"
    },
    {
        term: "출발 / 출발권",
        meaning: "완성된 설정 파일 다운로드",
        example: "ghostty config / .tmux.conf / .zshrc 등을 받아 옴"
    },
    {
        term: "모든 도구에 적용",
        meaning: "여러 도구에 테마·폰트를 한 번에 적용",
        example: "테마 센터에서 한 번 클릭 → Ghostty + iTerm2 + Warp + tmux + Neovim + Helix 모두 환승"
    }
];

export function GuidePage() {
    const navigate = useNavigate();
    return (
        <div className="max-w-4xl mx-auto pb-12 space-y-6">
            <StationHeader
                title="처음 출발하는 사람을 위한 안내"
                eyebrow="User Guide"
                subtitle="버스터미널을 처음 써보는 분을 위한 5분짜리 사용 설명서. 핵심 동선과 용어만 정리했어요."
                actions={
                    <Button size="sm" onClick={() => navigate("/ghostty")}>
                        <Icon name="play_arrow" className="text-[16px]" />
                        바로 시작하기
                    </Button>
                }
            />

            {/* 1. 무엇을 해주는 사이트인가 */}
            <ConfigPanel
                title="① 버스터미널은 무엇인가요?"
                actions={<Badge tone="info">개요</Badge>}
            >
                <p className="text-body-md text-on-surface mb-3 leading-relaxed">
                    버스터미널은 <strong className="text-primary-fixed-dim">터미널·에디터·셸 설정을 브라우저에서 만들고</strong>,
                    실시간으로 미리본 뒤,{" "}
                    <strong className="text-primary-fixed-dim">설정 파일로 다운로드</strong>해서 내 컴퓨터에 적용하는 도구예요.
                </p>
                <p className="text-body-md text-on-surface-variant mb-4 leading-relaxed">
                    터미널 설정 파일은 강력하지만 처음 보면 막막합니다. 버스터미널은 슬라이더·체크박스·색상 선택기로
                    설정을 만지고, 결과를 즉시 확인하고, 완성되면 한 번에 받아 갈 수 있게 도와줍니다.
                </p>
                <div className="rounded-lg border border-white/[0.06] bg-surface-container-lowest p-4">
                    <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant mb-2">
                        지원 도구 (7종)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
                        {[
                            {n: "Ghostty", d: "터미널 앱"},
                            {n: "Warp", d: "AI 터미널"},
                            {n: "iTerm2", d: "macOS 터미널"},
                            {n: "Neovim", d: "에디터"},
                            {n: "Helix", d: "모달 에디터"},
                            {n: "Zsh", d: "셸"},
                            {n: "tmux", d: "터미널 멀티플렉서"}
                        ].map(p => (
                            <div key={p.n} className="rounded border border-white/[0.04] px-3 py-2">
                                <div className="font-mono text-on-surface">{p.n}</div>
                                <div className="text-[11px] text-on-surface-variant">{p.d}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </ConfigPanel>

            {/* 2. 3분 시작 흐름 */}
            <ConfigPanel
                title="② 3분이면 시작할 수 있어요"
                actions={<Badge tone="active">시작 흐름</Badge>}
            >
                <ol className="space-y-3">
                    <Step
                        n={1}
                        title="승강장 선택"
                        desc="설정하고 싶은 도구의 페이지로 이동합니다. 사이드바에서 골라요."
                        cta="Ghostty 승강장으로"
                        to="/ghostty"
                    />
                    <Step
                        n={2}
                        title="기본 설정 조정"
                        desc="폰트·색상·옵션을 슬라이더와 체크박스로 바꾸면 우측 미리보기가 즉시 반응합니다."
                        cta="테마 센터에서 컬러 고르기"
                        to="/themes"
                    />
                    <Step
                        n={3}
                        title="출발권 만들기"
                        desc="완성됐다면 '출발권 만들기' → '출발 전 점검' 페이지에서 설정 파일을 다운로드하세요."
                        cta="출발권 만들기"
                        to="/export"
                    />
                </ol>
            </ConfigPanel>

            {/* 3. 용어 안내 */}
            <ConfigPanel
                title="③ 이 단어들이 자주 나와요"
                actions={<Badge tone="muted">용어집</Badge>}
            >
                <p className="text-[12px] text-on-surface-variant mb-3">
                    버스터미널은 버스 정류장 메타포를 씁니다. 처음엔 익숙하지 않을 수 있어요.
                </p>
                <div className="divide-y divide-white/[0.05]">
                    {TERM_GLOSSARY.map(g => (
                        <div key={g.term} className="py-3 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4">
                            <div>
                                <span className="font-mono text-code-sm text-primary-fixed-dim">
                                    {g.term}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <div className="text-body-md text-on-surface">{g.meaning}</div>
                                <div className="text-[11px] text-on-surface-variant mt-0.5">
                                    예) {g.example}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ConfigPanel>

            {/* 4. 추천 시작 경로 */}
            <ConfigPanel
                title="④ 어떻게 시작하는 게 좋을까요?"
                actions={<Badge tone="info">추천 경로</Badge>}
            >
                <div className="space-y-3">
                    <Recommend
                        title="처음이라 막막하다"
                        steps="Ghostty 승강장 → 테마 센터 → 폰트 센터 → 출발 전 점검"
                        detail="가장 기본인 터미널 외관부터 정리한 뒤 색·폰트 취향을 입히고, 마지막에 파일을 받는 흐름이에요."
                        primaryTo="/ghostty"
                        primaryLabel="Ghostty부터 시작"
                    />
                    <Recommend
                        title="이미 쓰던 설정이 있다"
                        steps="해당 승강장 → '환승하기' → 기존 파일 붙여넣기"
                        detail="기존 .zshrc / .tmux.conf / init.lua / .itermcolors / 테마 YAML을 통째로 가져와요. 인식 못한 줄은 그대로 보존됩니다."
                        primaryTo="/ghostty"
                        primaryLabel="환승부터 시도"
                    />
                    <Recommend
                        title="여러 테마를 비교하고 싶다"
                        steps="테마 센터 → '테마 비교' → 두 테마 선택"
                        detail="ANSI 16색별 색차까지 자동 계산되어 표시됩니다."
                        primaryTo="/themes/compare"
                        primaryLabel="설정 비교 열기"
                    />
                </div>
            </ConfigPanel>

            {/* 5. 데이터 저장 안내 */}
            <ConfigPanel
                title="⑤ 내 설정은 어디에 저장되나요?"
                actions={<Badge tone="warn">중요</Badge>}
            >
                <ul className="space-y-2 text-body-md text-on-surface-variant">
                    <li className="flex gap-2">
                        <Icon name="storage" className="text-[16px] text-on-surface-variant mt-0.5 shrink-0" />
                        <span>
                            모든 설정은 <strong className="text-on-surface">브라우저 localStorage</strong>에만 저장됩니다.
                            서버에 올라가지 않아요.
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <Icon name="warning" className="text-[16px] text-tertiary-fixed-dim mt-0.5 shrink-0" />
                        <span>
                            <strong className="text-on-surface">브라우저가 바뀌면 데이터가 이어지지 않아요.</strong>{" "}
                            크롬에서 만든 설정은 사파리에서 보이지 않습니다. 시크릿 모드도 마찬가지.
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <Icon name="file_download" className="text-[16px] text-primary-fixed-dim mt-0.5 shrink-0" />
                        <span>
                            여러 기기에서 쓰려면{" "}
                            <Link
                                to="/settings"
                                className="text-primary-fixed-dim underline underline-offset-2 hover:no-underline"
                            >
                                관리실(설정)
                            </Link>
                            에서 백업 JSON을 다운로드해 두세요. 다른 브라우저에서 같은 JSON으로 복원할 수 있어요.
                        </span>
                    </li>
                </ul>
            </ConfigPanel>

            {/* CTA */}
            <div className="rounded-xl border border-primary-fixed-dim/30 bg-primary-fixed-dim/[0.05] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <div className="font-display text-title-md text-on-surface">
                        준비됐다면 출발해 볼까요?
                    </div>
                    <div className="text-[12px] text-on-surface-variant mt-1">
                        Ghostty 승강장에서 첫 설정을 시작하는 게 가장 무난한 경로예요.
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                        <Icon name="home" className="text-[14px]" />홈으로
                    </Button>
                    <Button size="sm" onClick={() => navigate("/ghostty")}>
                        <Icon name="play_arrow" className="text-[14px]" />
                        Ghostty 승강장
                    </Button>
                </div>
            </div>
        </div>
    );
}

function Step({n, title, desc, cta, to}: {n: number; title: string; desc: string; cta: string; to: string}) {
    return (
        <li className="flex gap-4 rounded-lg border border-white/[0.06] bg-surface-container-lowest p-4">
            <div className="h-8 w-8 shrink-0 rounded-full bg-primary-fixed-dim/15 border border-primary-fixed-dim/40 grid place-items-center font-mono text-code-sm text-primary-fixed-dim">
                {n}
            </div>
            <div className="min-w-0 flex-1">
                <div className="font-display text-title-md text-on-surface">{title}</div>
                <p className="text-body-md text-on-surface-variant mt-1">{desc}</p>
                <Link
                    to={to}
                    className="inline-flex items-center gap-1 mt-2 font-mono text-label-xs uppercase tracking-[0.14em] text-primary-fixed-dim hover:underline"
                >
                    {cta}
                    <Icon name="arrow_forward" className="text-[14px]" />
                </Link>
            </div>
        </li>
    );
}

function Recommend({
    title,
    steps,
    detail,
    primaryTo,
    primaryLabel
}: {
    title: string;
    steps: string;
    detail: string;
    primaryTo: string;
    primaryLabel: string;
}) {
    return (
        <div className="rounded-lg border border-white/[0.06] bg-surface-container-lowest p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                    <div className="font-display text-title-md text-on-surface">{title}</div>
                    <div className="font-mono text-[11px] text-on-surface-variant mt-1">
                        {steps}
                    </div>
                </div>
                <Link
                    to={primaryTo}
                    className="inline-flex items-center gap-1 font-mono text-label-xs uppercase tracking-[0.14em] text-primary-fixed-dim hover:underline shrink-0"
                >
                    {primaryLabel}
                    <Icon name="arrow_forward" className="text-[14px]" />
                </Link>
            </div>
            <p className="text-[12px] text-on-surface-variant mt-2">{detail}</p>
        </div>
    );
}
