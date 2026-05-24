import {create} from "zustand";
import {persist} from "zustand/middleware";

/**
 * 즐겨찾기 — 테마와 폰트.
 * id는 RouteTheme.id 또는 FontEntry.id.
 */

interface FavoritesState {
    themes: string[];
    fonts: string[];
    toggleTheme: (id: string) => void;
    toggleFont: (id: string) => void;
    isThemeFavorite: (id: string) => boolean;
    isFontFavorite: (id: string) => boolean;
    clear: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
    persist(
        (set, get) => ({
            themes: [],
            fonts: [],
            toggleTheme: id =>
                set(s => ({
                    themes: s.themes.includes(id)
                        ? s.themes.filter(x => x !== id)
                        : [...s.themes, id]
                })),
            toggleFont: id =>
                set(s => ({
                    fonts: s.fonts.includes(id)
                        ? s.fonts.filter(x => x !== id)
                        : [...s.fonts, id]
                })),
            isThemeFavorite: id => get().themes.includes(id),
            isFontFavorite: id => get().fonts.includes(id),
            clear: () => set({themes: [], fonts: []})
        }),
        {name: "bus-terminal:favorites", version: 1}
    )
);
