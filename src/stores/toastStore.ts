import {create} from "zustand";

export interface ToastAction {
    label: string;
    run: () => void;
}

export interface Toast {
    id: string;
    text: string;
    tone: "info" | "success" | "warn" | "error";
    action?: ToastAction;
    /** ms — 미지정 시 3200, action 있는 토스트는 6000 */
    duration?: number;
}

interface ToastState {
    items: Toast[];
    push: (t: Omit<Toast, "id">) => string;
    dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
    items: [],
    push: (t) => {
        const id = crypto.randomUUID();
        const item: Toast = {...t, id};
        set(s => ({items: [...s.items, item]}));
        const ttl = t.duration ?? (t.action ? 6000 : 3200);
        setTimeout(() => {
            set(s => ({items: s.items.filter(x => x.id !== id)}));
        }, ttl);
        return id;
    },
    dismiss: (id) => set(s => ({items: s.items.filter(x => x.id !== id)}))
}));

export function toast(text: string, tone: Toast["tone"] = "info") {
    useToastStore.getState().push({text, tone});
}

/**
 * 토스트와 함께 "되돌리기" 버튼을 노출.
 * undo()가 호출되면 토스트는 즉시 닫힌다.
 */
export function toastWithUndo(
    text: string,
    undo: () => void,
    tone: Toast["tone"] = "success"
) {
    let id = "";
    id = useToastStore.getState().push({
        text,
        tone,
        action: {
            label: "되돌리기",
            run: () => {
                undo();
                useToastStore.getState().dismiss(id);
            }
        }
    });
}
