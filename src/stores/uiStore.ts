import {create} from "zustand";
import {persist} from "zustand/middleware";

/** 셸 전반의 UI 상태. 초보 모드는 사용자가 명시적으로 끌 때까지 유지한다. */
interface UIState {
    drawerOpen: boolean;
    beginnerMode: boolean;
    setDrawerOpen: (v: boolean) => void;
    toggleDrawer: () => void;
    setBeginnerMode: (v: boolean) => void;
    toggleBeginnerMode: () => void;
}

export const useUIStore = create<UIState>()(
    persist(
        set => ({
            drawerOpen: false,
            beginnerMode: false,
            setDrawerOpen: v => set({drawerOpen: v}),
            toggleDrawer: () => set(s => ({drawerOpen: !s.drawerOpen})),
            setBeginnerMode: v => set({beginnerMode: v}),
            toggleBeginnerMode: () => set(s => ({beginnerMode: !s.beginnerMode}))
        }),
        {
            name: "bus-terminal:ui",
            partialize: state => ({beginnerMode: state.beginnerMode}) as UIState
        }
    )
);
