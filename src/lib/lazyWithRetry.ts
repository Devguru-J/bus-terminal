import {lazy, type ComponentType} from "react";

// 새 배포 시 클라이언트가 캐시된 index.html을 들고 있으면 사라진 hashed chunk를
// 요청하다 SPA fallback HTML을 받아 MIME 에러를 낸다. 한 번 자동 새로고침해 새 index.html을
// 받아오고, 그래도 실패하면 일반 에러로 ErrorBoundary가 잡게 둔다.
const RELOAD_FLAG = "bus-terminal:chunk-reload";

export function lazyWithRetry<T extends ComponentType<unknown>>(
    factory: () => Promise<{default: T}>
) {
    return lazy(async () => {
        try {
            return await factory();
        }
        catch (err) {
            const alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG) === "1";
            if (!alreadyReloaded && isChunkLoadError(err)) {
                sessionStorage.setItem(RELOAD_FLAG, "1");
                window.location.reload();
                return new Promise<{default: T}>(() => {});
            }
            sessionStorage.removeItem(RELOAD_FLAG);
            throw err;
        }
    });
}

function isChunkLoadError(err: unknown): boolean {
    if (!(err instanceof Error)) return false;
    const msg = err.message || "";
    return (
        msg.includes("Failed to fetch dynamically imported module") ||
        msg.includes("Importing a module script failed") ||
        msg.includes("Loading chunk") ||
        msg.includes("MIME type")
    );
}

// 로딩이 성공한 다음 렌더 사이클부터는 flag를 비워, 다음 배포에서 다시 한 번 재시도가 가능하도록.
export function clearChunkReloadFlag() {
    sessionStorage.removeItem(RELOAD_FLAG);
}
