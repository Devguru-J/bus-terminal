// Plausible Analytics 얇은 래퍼.
// VITE_PLAUSIBLE_DOMAIN이 비어 있으면 완전한 no-op.
// 스크립트는 동적 주입 — 포크 사용자가 자기 트래픽을 우리 도메인 계정에 보내지 않게.

declare global {
    interface Window {
        plausible?: ((event: string, options?: {u?: string; props?: Record<string, string>}) => void) & {
            q?: unknown[];
        };
    }
}

const SCRIPT_ID = "plausible-analytics-script";

function getDomain(): string | undefined {
    const v = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
    return typeof v === "string" && v.trim().length > 0 ? v.trim() : undefined;
}

function getHost(): string {
    const v = import.meta.env.VITE_PLAUSIBLE_HOST;
    return typeof v === "string" && v.trim().length > 0 ? v.trim() : "https://plausible.io";
}

export function initAnalytics(): void {
    const domain = getDomain();
    if (!domain) return;
    if (typeof document === "undefined") return;
    if (document.getElementById(SCRIPT_ID)) return;

    // 스크립트 로드 전에도 trackEvent가 큐잉되도록 stub 설치.
    const w = window as Window;
    if (!w.plausible) {
        const stub = function (...args: unknown[]) {
            (stub.q = stub.q || []).push(args);
        } as Window["plausible"] & {q: unknown[]};
        w.plausible = stub;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.defer = true;
    script.dataset.domain = domain;
    script.src = `${getHost()}/js/script.tagged-events.js`;
    document.head.appendChild(script);
}

export function trackEvent(name: string, props?: Record<string, string>): void {
    try {
        if (typeof window === "undefined") return;
        const fn = window.plausible;
        if (typeof fn !== "function") return;
        fn(name, props ? {props} : undefined);
    } catch {
        // analytics는 절대 앱을 깨뜨리지 않는다.
    }
}

export function trackPageview(path: string): void {
    try {
        if (typeof window === "undefined") return;
        const fn = window.plausible;
        if (typeof fn !== "function") return;
        const url = `${window.location.origin}${path}`;
        fn("pageview", {u: url});
    } catch {
        // silent
    }
}
