import {create} from "zustand";
import {persist} from "zustand/middleware";
import type {RouteTheme, ThemeTag} from "@/data/themes";

interface UserThemesState {
    items: RouteTheme[];
    add: (theme: Omit<RouteTheme, "id" | "tags"> & {id?: string; tags?: ThemeTag[]}) => RouteTheme;
    remove: (id: string) => void;
    rename: (id: string, ko: string) => void;
    clear: () => void;
}

function slugify(text: string): string {
    const base = text
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]+/g, "-")
        .replace(/^-|-$/g, "");
    return base || "custom";
}

export const useUserThemesStore = create<UserThemesState>()(
    persist(
        (set, get) => ({
            items: [],
            add: theme => {
                let id = theme.id ?? `${slugify(theme.ko)}-${Date.now().toString(36)}`;
                // 충돌 방지
                while (get().items.some(t => t.id === id)) {
                    id = `${id}-x`;
                }
                const route: RouteTheme = {
                    id,
                    ko: theme.ko,
                    description: theme.description ?? "사용자가 가져온 테마.",
                    author: theme.author ?? "imported",
                    background: theme.background,
                    foreground: theme.foreground,
                    cursor: theme.cursor,
                    selectionBg: theme.selectionBg,
                    selectionFg: theme.selectionFg,
                    palette16: theme.palette16,
                    accent: theme.accent,
                    tags: theme.tags ?? ["new"]
                };
                set(s => ({items: [route, ...s.items]}));
                return route;
            },
            remove: id => set(s => ({items: s.items.filter(t => t.id !== id)})),
            rename: (id, ko) =>
                set(s => ({items: s.items.map(t => (t.id === id ? {...t, ko} : t))})),
            clear: () => set({items: []})
        }),
        {name: "bus-terminal:user-themes", version: 1}
    )
);
