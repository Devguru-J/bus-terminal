import {create} from "zustand";

/** 셸 전반의 일시 UI 상태 (persist 불필요). */
interface UIState {
    drawerOpen: boolean;
    setDrawerOpen: (v: boolean) => void;
    toggleDrawer: () => void;
}

export const useUIStore = create<UIState>(set => ({
    drawerOpen: false,
    setDrawerOpen: v => set({drawerOpen: v}),
    toggleDrawer: () => set(s => ({drawerOpen: !s.drawerOpen}))
}));
