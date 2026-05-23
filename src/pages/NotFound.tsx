import {Link, useLocation} from "react-router-dom";
import {StationHeader} from "@/components/shell/StationHeader";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";

/** 폐선 안내 — 잘못된 URL 진입 시 표시 */
export function NotFoundPage() {
    const loc = useLocation();
    return (
        <div className="max-w-3xl mx-auto">
            <StationHeader
                title="이 노선은 폐선되었습니다"
                eyebrow="STATION CLOSED · 404"
                subtitle={
                    <>
                        요청하신 경로{" "}
                        <code className="font-mono text-primary-fixed-dim">{loc.pathname}</code>
                        에 운행 중인 승강장이 없어요. 출발 안내로 돌아가 다른 노선을 이용해 주세요.
                    </>
                }
            />
            <div className="rounded-xl border border-white/[0.06] bg-surface-container-low/60 p-8 text-center">
                <Icon
                    name="signpost"
                    fill
                    className="text-[44px] text-on-surface-variant/40"
                />
                <pre className="mt-4 font-mono text-[12px] leading-relaxed text-on-surface-variant whitespace-pre-wrap">{`[SYS] route lookup: ${loc.pathname}
[SYS] no manifest found
[SYS] suggesting: /, /ghostty, /tmux, /neovim, /zsh`}</pre>
                <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
                    <Link to="/">
                        <Button>
                            <Icon name="home" className="text-[16px]" /> 출발 안내로
                        </Button>
                    </Link>
                    <Link to="/my-routes">
                        <Button variant="outline">
                            <Icon name="bookmark" className="text-[16px]" /> 내 노선
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
