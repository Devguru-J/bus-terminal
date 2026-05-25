// 사용자가 처음 설정을 만질 때 한 번만 "자동 저장됨" 안내 토스트.
// sessionStorage로 세션 1회 제한 — 매 페이지에서 잔소리하지 않음.

import {useGhosttyStore} from "@/stores/ghosttyStore";
import {useTmuxStore} from "@/stores/tmuxStore";
import {useNeovimStore} from "@/stores/neovimStore";
import {useZshStore} from "@/stores/zshStore";
import {useHelixStore} from "@/stores/helixStore";
import {useIterm2Store} from "@/stores/iterm2Store";
import {useWarpStore} from "@/stores/warpStore";
import {toast} from "@/stores/toastStore";

const SESSION_KEY = "bus-terminal:autosave-hint-shown";

export function initAutosaveHint() {
    if (typeof window === "undefined") return;
    try {
        if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
        // sessionStorage 차단 환경(시크릿 모드 일부) — 그냥 노쇼
        return;
    }

    const stores = [
        useGhosttyStore,
        useTmuxStore,
        useNeovimStore,
        useZshStore,
        useHelixStore,
        useIterm2Store,
        useWarpStore
    ];

    const unsubs: Array<() => void> = [];
    let triggered = false;

    function onChange() {
        if (triggered) return;
        triggered = true;
        try {
            sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
            // ignore
        }
        toast("작업은 자동으로 저장됩니다 — 새로고침해도 안전해요.", "info");
        unsubs.forEach(u => u());
    }

    // 첫 마운트의 초기 상태 캡처 후, 이후 변경에만 반응
    for (const store of stores) {
        let initial = store.getState();
        const unsub = store.subscribe(state => {
            if (state !== initial) {
                initial = state;
                onChange();
            }
        });
        unsubs.push(unsub);
    }
}
