import {create} from "zustand";
import {persist} from "zustand/middleware";
import {
    iterm2Default,
    serializeIterm2Colors,
    serializeIterm2Profile,
    type Iterm2Profile
} from "@/data/iterm2";
import type {RouteTheme} from "@/data/themes";

interface Iterm2State {
    profile: Iterm2Profile;
    setField: <K extends keyof Iterm2Profile>(k: K, v: Iterm2Profile[K]) => void;
    setAnsi: (index: number, color: string) => void;
    applyTheme: (t: RouteTheme) => void;
    exportColors: () => string;
    exportProfile: () => string;
    reset: () => void;
}

export const useIterm2Store = create<Iterm2State>()(
    persist(
        (set, get) => ({
            profile: {...iterm2Default},
            setField: (k, v) => set(s => ({profile: {...s.profile, [k]: v}})),
            setAnsi: (index, color) =>
                set(s => {
                    const ansi = s.profile.ansi.slice();
                    ansi[index] = color;
                    return {profile: {...s.profile, ansi}};
                }),
            applyTheme: t =>
                set(s => ({
                    profile: {
                        ...s.profile,
                        background: t.background,
                        foreground: t.foreground,
                        cursor: t.cursor,
                        cursorText: t.background,
                        selection: t.selectionBg,
                        selectedText: t.selectionFg,
                        ansi: t.palette16.slice()
                    }
                })),
            exportColors: () => serializeIterm2Colors(get().profile),
            exportProfile: () => serializeIterm2Profile(get().profile),
            reset: () => set({profile: {...iterm2Default}})
        }),
        {
            name: "bus-terminal:iterm2",
            version: 1,
            migrate: () => ({profile: {...iterm2Default}})
        }
    )
);
