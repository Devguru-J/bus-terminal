import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Icon} from "@/components/ui/Icon";
import {useUIStore} from "@/stores/uiStore";
import {signOut, useAuthStore} from "@/stores/authStore";
import {toast} from "@/stores/toastStore";

function utcStamp(d = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

export function TopBar() {
    const [t, setT] = useState(utcStamp());
    const status = useAuthStore(s => s.status);
    const user = useAuthStore(s => s.user);
    const openAuth = useAuthStore(s => s.openModal);
    useEffect(() => {
        const i = setInterval(() => setT(utcStamp()), 30_000);
        return () => clearInterval(i);
    }, []);

    async function handleAccountClick() {
        if (status !== "signed-in") {
            openAuth();
            return;
        }
        if (!window.confirm(`${user?.email ?? "현재 계정"}에서 로그아웃할까요?`)) return;
        await signOut();
        toast("로그아웃했어요. 로컬 설정은 그대로 남아 있습니다.", "success");
    }

    return (
        <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 sm:px-6 border-b border-white/[0.06] bg-surface/60 backdrop-blur-md">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={useUIStore.getState().toggleDrawer}
                    className="lg:hidden p-2 -ml-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-white/[0.04] transition"
                    aria-label="메뉴 열기"
                >
                    <Icon name="menu" className="text-[20px]" />
                </button>
                <Link
                    to="/"
                    className="font-display text-[15px] font-semibold tracking-[0.32em] text-primary-fixed-dim uppercase"
                >
                    BusTerminal
                </Link>
            </div>
            <div className="flex items-center gap-5">
                <span className="font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant hidden sm:inline">
                    {t}
                </span>
                <Link
                    to="/"
                    className="p-2 rounded-full text-on-surface-variant hover:text-primary-fixed-dim hover:bg-white/5 transition"
                    aria-label="메인으로 돌아가기"
                    title="메인으로 돌아가기"
                >
                    <Icon name="home" className="text-[18px]" />
                </Link>
                <Link
                    to="/export"
                    className="p-2 rounded-full text-on-surface-variant hover:text-primary-fixed-dim hover:bg-white/5 transition"
                    aria-label="출발 전 점검"
                    title="출발 전 점검"
                >
                    <Icon name="sensors" className="text-[18px]" />
                </Link>
                <Link
                    to="/settings"
                    className="p-2 rounded-full text-on-surface-variant hover:text-primary-fixed-dim hover:bg-white/5 transition"
                    aria-label="설정"
                    title="설정"
                >
                    <Icon name="settings" className="text-[18px]" />
                </Link>
                <button
                    type="button"
                    onClick={handleAccountClick}
                    className="relative p-2 rounded-full text-on-surface-variant hover:text-primary-fixed-dim hover:bg-white/5 transition"
                    aria-label={status === "signed-in" ? "계정 로그아웃" : "계정 연결"}
                    title={status === "signed-in" ? user?.email ?? "계정 연결됨" : "계정 연결"}
                >
                    <Icon name="account_circle" className="text-[18px]" />
                    {status === "signed-in" && (
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary-fixed-dim" />
                    )}
                </button>
            </div>
        </header>
    );
}
