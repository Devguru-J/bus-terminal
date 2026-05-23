import {create} from "zustand";

export interface Toast {
    id: string;
    text: string;
    tone: "info" | "success" | "warn" | "error";
}

interface ToastState {
    items: Toast[];
    push: (t: Omit<Toast, "id">) => void;
    dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
    items: [],
    push: (t) => {
        const id = crypto.randomUUID();
        set(s => ({items: [...s.items, {...t, id}]}));
        setTimeout(() => {
            set(s => ({items: s.items.filter(x => x.id !== id)}));
        }, 3200);
    },
    dismiss: (id) => set(s => ({items: s.items.filter(x => x.id !== id)}))
}));

export function toast(text: string, tone: Toast["tone"] = "info") {
    useToastStore.getState().push({text, tone});
}
