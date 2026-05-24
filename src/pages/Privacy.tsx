import {Link} from "react-router-dom";
import {StationHeader} from "@/components/shell/StationHeader";
import {ConfigPanel} from "@/components/platform/ConfigPanel";
import {Badge} from "@/components/ui/Badge";
import {Icon} from "@/components/ui/Icon";

export function PrivacyPage() {
    return (
        <div className="max-w-3xl mx-auto pb-12 space-y-6">
            <StationHeader
                title="개인정보처리방침"
                eyebrow="Privacy"
                subtitle="버스터미널이 어떤 정보를 어떻게 다루는지에 대한 안내입니다. 마지막 갱신: 2026-05-25."
            />

            <ConfigPanel
                title="요약 — 한 줄로"
                actions={<Badge tone="active">서버 없음</Badge>}
            >
                <p className="text-body-md text-on-surface leading-relaxed">
                    버스터미널은 <strong className="text-primary-fixed-dim">서버를 운영하지 않습니다.</strong>
                    모든 데이터는 사용자의 브라우저(localStorage)에만 저장되며, 어떤 정보도 외부로 전송되지 않습니다.
                </p>
            </ConfigPanel>

            <ConfigPanel title="① 어떤 데이터를 저장하나요?">
                <ul className="space-y-2 text-body-md text-on-surface-variant">
                    <li className="flex gap-2">
                        <Icon name="storage" className="text-[16px] text-on-surface-variant mt-0.5 shrink-0" />
                        <span>
                            <strong className="text-on-surface">사용자 입력 설정값</strong> — Ghostty/Warp/iTerm2/Neovim/Helix/Zsh/tmux 각 도구의 옵션, 색상, 폰트 등
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <Icon name="bookmark" className="text-[16px] text-on-surface-variant mt-0.5 shrink-0" />
                        <span>
                            <strong className="text-on-surface">저장한 노선</strong> — 사용자가 "차고 보관"으로 명시 저장한 설정 스냅샷
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <Icon name="favorite" className="text-[16px] text-on-surface-variant mt-0.5 shrink-0" />
                        <span>
                            <strong className="text-on-surface">즐겨찾기와 가져온 테마</strong> — 테마/폰트 즐겨찾기 목록, import한 사용자 테마
                        </span>
                    </li>
                </ul>
                <p className="mt-4 text-[12px] text-on-surface-variant">
                    저장 위치는 브라우저 localStorage 키 `bus-terminal:*`입니다. <Link to="/settings" className="text-primary-fixed-dim underline underline-offset-2">설정</Link>에서 전체 목록을 확인할 수 있습니다.
                </p>
            </ConfigPanel>

            <ConfigPanel title="② 외부 전송 / 수집은 있나요?">
                <p className="text-body-md text-on-surface mb-3">
                    <strong className="text-primary-fixed-dim">없습니다.</strong> 다음 항목들은 모두 사용자 브라우저에서 직접 처리됩니다:
                </p>
                <ul className="space-y-1.5 text-[13px] text-on-surface-variant list-disc list-inside">
                    <li>설정 파일 생성 — 브라우저에서 텍스트로 합성</li>
                    <li>다운로드 — 브라우저의 Blob URL을 통해 직접 저장</li>
                    <li>백업 JSON 생성 — 메모리에서 만들어 다운로드</li>
                    <li>공유 링크 — 브라우저 URL 해시에 base64로 인코딩 (서버 거치지 않음)</li>
                    <li>테마/폰트 import — 사용자가 붙여넣은 텍스트를 브라우저에서 파싱</li>
                </ul>
            </ConfigPanel>

            <ConfigPanel title="③ 제3자 서비스">
                <p className="text-body-md text-on-surface mb-3">
                    사이트를 구성하기 위해 다음 외부 리소스만 사용합니다:
                </p>
                <ul className="space-y-1.5 text-[13px] text-on-surface-variant list-disc list-inside">
                    <li>
                        <strong className="text-on-surface">Google Fonts</strong> — UI 및 폰트 미리보기용 웹폰트.
                        Google이 IP 등 기본 요청 정보를 받을 수 있습니다 (Google의 정책에 따름).
                    </li>
                    <li>
                        <strong className="text-on-surface">Cloudflare Pages</strong> — 사이트 호스팅. 표준 웹 액세스 로그 수준의 정보가 Cloudflare 측에 남을 수 있습니다.
                    </li>
                    <li>
                        <strong className="text-on-surface">분석 / 에러 트래커</strong> — 현재 도입되어 있지 않음. 추후 도입하게 되면 이 페이지에서 사전 고지합니다.
                    </li>
                </ul>
            </ConfigPanel>

            <ConfigPanel title="④ 데이터 삭제 / 이동" actions={<Badge tone="info">사용자 권한</Badge>}>
                <ul className="space-y-2 text-body-md text-on-surface-variant">
                    <li className="flex gap-2">
                        <Icon name="delete" className="text-[16px] text-error mt-0.5 shrink-0" />
                        <span>
                            언제든지 <Link to="/settings" className="text-primary-fixed-dim underline">설정 → 전체 초기화</Link>로 모든 저장 데이터를 삭제할 수 있습니다.
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <Icon name="file_download" className="text-[16px] text-primary-fixed-dim mt-0.5 shrink-0" />
                        <span>
                            JSON 백업으로 데이터를 내보내 다른 브라우저로 옮길 수 있습니다.
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <Icon name="info" className="text-[16px] text-on-surface-variant mt-0.5 shrink-0" />
                        <span>
                            브라우저 히스토리/저장소 초기화, 시크릿 모드 종료 시에도 데이터는 삭제됩니다.
                        </span>
                    </li>
                </ul>
            </ConfigPanel>

            <ConfigPanel title="⑤ 변경 / 문의">
                <p className="text-body-md text-on-surface-variant">
                    이 정책은 서비스 변경에 따라 갱신될 수 있습니다. 큰 변경이 있을 때는 사이트 상단 공지 또는 이 페이지의 갱신 일자로 알립니다.
                    문의는 <a href="https://github.com/Devguru-J/bus-terminal/issues" target="_blank" rel="noreferrer" className="text-primary-fixed-dim underline">GitHub Issues</a>로 부탁드립니다.
                </p>
            </ConfigPanel>
        </div>
    );
}
