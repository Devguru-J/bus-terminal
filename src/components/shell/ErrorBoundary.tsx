import {Component, type ErrorInfo, type ReactNode} from "react";
import {Link} from "react-router-dom";

interface Props {
    children: ReactNode;
}

interface State {
    error: Error | null;
}

/**
 * 한 페이지에서 발생한 렌더 오류가 전체 앱을 흰 화면으로 만들지 않게 보호.
 * 사용자에게 친절한 복구 안내 + 새로고침/홈 이동 옵션을 제공한다.
 */
export class ErrorBoundary extends Component<Props, State> {
    state: State = {error: null};

    static getDerivedStateFromError(error: Error): State {
        return {error};
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        // 콘솔에는 남겨서 개발자가 추적할 수 있게.
        // 향후 에러 트래커(sentry 등)가 붙으면 여기서 보고.
        console.error("[BusTerminal] page render error:", error, info);
    }

    reset = () => {
        this.setState({error: null});
    };

    render() {
        if (!this.state.error) return this.props.children;
        const isDev =
            typeof import.meta !== "undefined" &&
            (import.meta as ImportMeta & {env?: {DEV?: boolean}}).env?.DEV === true;
        return (
            <div className="max-w-2xl mx-auto py-12 px-4 space-y-5">
                <div className="rounded-xl border border-error/30 bg-error/[0.05] p-6 text-center space-y-4">
                    <div className="font-mono text-label-xs uppercase tracking-[0.18em] text-error">
                        Unexpected Error
                    </div>
                    <h2 className="font-display text-headline-sm text-on-surface">
                        화면을 표시하는 중에 문제가 생겼어요
                    </h2>
                    <p className="text-body-md text-on-surface-variant">
                        새로고침하거나 홈으로 돌아가서 다시 시도해 주세요. 저장된 설정은 그대로 남아 있어요.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center pt-2">
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="h-10 px-4 rounded bg-primary-fixed-dim text-on-primary font-mono text-label-xs uppercase tracking-[0.14em] hover:opacity-90"
                        >
                            새로고침
                        </button>
                        <Link
                            to="/"
                            onClick={this.reset}
                            className="h-10 px-4 grid place-items-center rounded border border-white/15 text-on-surface font-mono text-label-xs uppercase tracking-[0.14em] hover:border-white/30"
                        >
                            홈으로
                        </Link>
                        <button
                            type="button"
                            onClick={this.reset}
                            className="h-10 px-4 rounded border border-white/15 text-on-surface-variant font-mono text-label-xs uppercase tracking-[0.14em] hover:text-on-surface hover:border-white/30"
                        >
                            다시 시도
                        </button>
                    </div>
                </div>
                {isDev && (
                    <details className="rounded-lg border border-white/[0.06] bg-surface-container-lowest p-4">
                        <summary className="cursor-pointer font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant">
                            개발자용 상세 (DEV)
                        </summary>
                        <pre className="mt-3 text-[11px] font-mono text-error/80 whitespace-pre-wrap break-words">
                            {this.state.error.message}
                            {"\n\n"}
                            {this.state.error.stack}
                        </pre>
                    </details>
                )}
            </div>
        );
    }
}
