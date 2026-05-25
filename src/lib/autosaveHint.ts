// 사용자가 처음 설정을 만질 때 한 번만 "자동 저장됨" 안내 토스트.
// sessionStorage로 세션 1회 제한 — 매 페이지에서 잔소리하지 않음.
//
// 주의: zustand persist는 마운트 후 localStorage에서 비동기 hydration을 수행.
// hydration 자체가 첫 state 변경이라 단순 subscribe()는 새 탭마다 토스트가 잘못 뜸.
// → 실제 사용자 입력(pointerdown/keydown) 이후에만 트리거.

import {toast} from "@/stores/toastStore";

const SESSION_KEY = "bus-terminal:autosave-hint-shown";

export function initAutosaveHint() {
    if (typeof window === "undefined") return;
    try {
        if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
        return;
    }

    let armed = false;
    let triggered = false;

    function arm() {
        if (armed || triggered) return;
        armed = true;
        // 첫 실제 입력 이후 다음 입력에 토스트 표시.
        // 단순히 pointerdown 한 번에 띄우면 사이드바 클릭에도 뜸 — keydown(타이핑)이 더 정확.
        document.addEventListener("keydown", onFirstEdit, {once: true, capture: true});
    }

    function onFirstEdit(e: KeyboardEvent) {
        // 입력 필드 안에서의 키 입력만 — 단축키나 페이지 이동 키는 제외
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName;
        const isEditable =
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT" ||
            target?.isContentEditable === true;
        if (!isEditable) {
            // 다시 다음 입력 기다림
            document.addEventListener("keydown", onFirstEdit, {once: true, capture: true});
            return;
        }
        if (triggered) return;
        triggered = true;
        try {
            sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
            // ignore
        }
        toast("작업은 자동으로 저장됩니다 — 새로고침해도 안전해요.", "info");
    }

    // 사용자가 실제로 페이지와 상호작용한 후에 arm — 페이지 로드 직후 자동 키 이벤트(예: 자동 포커스)는 무시.
    document.addEventListener("pointerdown", arm, {once: true, capture: true});
    document.addEventListener("keydown", arm, {once: true, capture: true});
}
