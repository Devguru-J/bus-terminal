import {create} from "zustand";
import {persist} from "zustand/middleware";

/**
 * 차고 보관 — 사용자가 저장한 "내 노선".
 * 각 노선은 ghostty / tmux config 텍스트 스냅샷.
 */
export interface SavedRoute {
    id: string;
    name: string;
    platform: "ghostty" | "tmux" | "neovim" | "zsh";
    text: string;
    createdAt: number;
}

interface RoutesState {
    routes: SavedRoute[];
    save: (r: Omit<SavedRoute, "id" | "createdAt">) => SavedRoute;
    remove: (id: string) => void;
    rename: (id: string, name: string) => void;
    clear: () => void;
}

export const useRoutesStore = create<RoutesState>()(
    persist(
        (set) => ({
            routes: [],
            save: (r) => {
                const route: SavedRoute = {
                    ...r,
                    id: crypto.randomUUID(),
                    createdAt: Date.now()
                };
                set(s => ({routes: [route, ...s.routes]}));
                return route;
            },
            remove: (id) => set(s => ({routes: s.routes.filter(r => r.id !== id)})),
            rename: (id, name) =>
                set(s => ({routes: s.routes.map(r => (r.id === id ? {...r, name} : r))})),
            clear: () => set({routes: []})
        }),
        {name: "bus-terminal:routes"}
    )
);
