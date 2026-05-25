import {Link} from "react-router-dom";
import {StationHeader} from "@/components/shell/StationHeader";
import {ConfigPanel} from "@/components/platform/ConfigPanel";
import {Badge} from "@/components/ui/Badge";
import {Icon} from "@/components/ui/Icon";

export function TermsPage() {
    return (
        <div className="max-w-3xl mx-auto pb-12 space-y-6">
            <StationHeader
                title="이용 안내 및 면책"
                eyebrow="Terms / Disclaimer"
                subtitle="버스터미널은 설정 파일을 만들어주는 도구입니다. 실제 적용은 사용자 책임이라는 점을 명확히 합니다."
            />

            <ConfigPanel
                title="① 한 줄 요약"
                actions={<Badge tone="warn">중요</Badge>}
            >
                <p className="text-body-md text-on-surface leading-relaxed">
                    버스터미널이 <strong className="text-on-surface">생성한 설정 파일을 본인 컴퓨터에 적용하는 것은 사용자 책임</strong>입니다.
                    적용 전에 기존 설정을 백업하고, 스크립트를 실행하기 전에 내용을 검토해 주세요.
                </p>
            </ConfigPanel>

            <ConfigPanel title="② 설정 파일 적용 책임">
                <ul className="space-y-2 text-body-md text-on-surface-variant">
                    <li className="flex gap-2">
                        <Icon name="description" className="text-[16px] text-on-surface-variant mt-0.5 shrink-0" />
                        <span>
                            다운로드된 설정 파일은 사용자의 입력을 기반으로 합성된 텍스트일 뿐이며,
                            도구별 무결성/호환성은 사용자가 확인해야 합니다.
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <Icon name="warning" className="text-[16px] text-tertiary-fixed-dim mt-0.5 shrink-0" />
                        <span>
                            <strong className="text-on-surface">기존 dotfiles는 적용 전에 백업</strong>하세요.
                            예: <code className="font-mono text-primary-fixed-dim">cp ~/.zshrc ~/.zshrc.bak</code>
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <Icon name="bug_report" className="text-[16px] text-error mt-0.5 shrink-0" />
                        <span>
                            잘못된 설정으로 인한 셸/에디터 부팅 실패 등은 사용자가 직접 복구해야 합니다.
                        </span>
                    </li>
                </ul>
            </ConfigPanel>

            <ConfigPanel
                title="③ 설치 스크립트 실행 가이드"
                actions={<Badge tone="warn">신중히</Badge>}
            >
                <p className="text-body-md text-on-surface-variant mb-3">
                    버스터미널은 선택사항으로 <code className="font-mono text-primary-fixed-dim">bus-terminal-install.sh</code> bash 스크립트를 생성합니다.
                    이 스크립트는 사용자의 홈 디렉토리에 직접 파일을 작성하므로 신중하게 다뤄 주세요.
                </p>
                <ol className="space-y-2 text-[13px] text-on-surface-variant list-decimal list-inside">
                    <li>
                        다운로드 후 <strong className="text-on-surface">스크립트 내용을 먼저 열어서 확인</strong>하세요.
                        설정 텍스트가 <code className="font-mono">$'...'</code> 형태로 인용되어 있어야 합니다.
                    </li>
                    <li>
                        먼저 <code className="font-mono text-primary-fixed-dim">--dry-run</code> 옵션으로 실제 쓰기 없이 미리보기:
                        <pre className="mt-1 ml-1 px-3 py-2 rounded bg-surface-container-lowest font-mono text-[12px] text-on-surface">
                            bash bus-terminal-install.sh --dry-run
                        </pre>
                    </li>
                    <li>
                        기본적으로 기존 파일은 <code className="font-mono">.bak.YYYYMMDD…</code>로 자동 백업합니다.
                        끄려면 <code className="font-mono text-tertiary-fixed-dim">--no-backup</code>.
                    </li>
                    <li>
                        특정 도구만 적용: <code className="font-mono text-on-surface">--only ghostty</code>
                    </li>
                </ol>
            </ConfigPanel>

            <ConfigPanel title="④ 면책 범위">
                <p className="text-body-md text-on-surface mb-2">
                    버스터미널은 "있는 그대로" 제공되며, 다음에 대한 명시적·묵시적 보증을 하지 않습니다:
                </p>
                <ul className="space-y-1 text-[13px] text-on-surface-variant list-disc list-inside">
                    <li>특정 환경(OS·셸·터미널 버전)에서의 동작 적합성</li>
                    <li>생성된 설정 파일의 정확성·완전성</li>
                    <li>설정 파일 적용 후 발생하는 데이터 손실 또는 시스템 문제</li>
                    <li>제3자 도구(Ghostty/Warp/iTerm2/Neovim/Helix/Zsh/tmux)와의 호환성 변동</li>
                </ul>
                <p className="mt-3 text-[12px] text-on-surface-variant">
                    버그·개선 제안은{" "}
                    <a
                        href="https://github.com/Devguru-J/bus-terminal/issues"
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-fixed-dim underline"
                    >
                        GitHub Issues
                    </a>
                    로 알려주시면 감사하겠습니다.
                </p>
            </ConfigPanel>

            <ConfigPanel title="⑤ 데이터 / 개인정보">
                <p className="text-body-md text-on-surface-variant">
                    저장·전송·삭제에 관한 자세한 내용은{" "}
                    <Link to="/privacy" className="text-primary-fixed-dim underline">
                        개인정보처리방침
                    </Link>
                    을 확인하세요. 요약하면: 비회원 설정은 localStorage 저장, 로그인 사용자의 클라우드 스냅샷은 Supabase 저장,
                    호스팅·로그인·폰트 로딩 과정의 표준 웹 요청 정보는 제3자 서비스에 전달될 수 있음.
                </p>
            </ConfigPanel>
        </div>
    );
}
