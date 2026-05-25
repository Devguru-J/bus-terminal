import {create} from "zustand";
import type {Session, User} from "@supabase/supabase-js";
import {supabase} from "@/lib/supabase";

type AuthStatus = "booting" | "signed-out" | "signed-in";

interface AuthState {
    status: AuthStatus;
    session: Session | null;
    user: User | null;
    modalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>(set => ({
    status: "booting",
    session: null,
    user: null,
    modalOpen: false,
    openModal: () => set({modalOpen: true}),
    closeModal: () => set({modalOpen: false}),
    setSession: session =>
        set({
            session,
            user: session?.user ?? null,
            status: session ? "signed-in" : "signed-out"
        })
}));

let initialized = false;

export function initAuth() {
    if (initialized) return;
    initialized = true;

    if (!supabase) {
        // 환경변수 없으면 즉시 로컬-온리 모드로 전환
        useAuthStore.getState().setSession(null);
        return;
    }

    supabase.auth.getSession().then(({data}) => {
        useAuthStore.getState().setSession(data.session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
        useAuthStore.getState().setSession(session);
    });
}

export async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
}
