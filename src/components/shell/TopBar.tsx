import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {Icon} from "@/components/ui/Icon";
import {useUIStore} from "@/stores/uiStore";
import {useAuthStore} from "@/stores/authStore";

function localTimeStamp(d = new Date()): string {
    return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZoneName: "short"
    }).format(d);
}

export function TopBar() {
    const navigate = useNavigate();
    const [t, setT] = useState(localTimeStamp());
    const status = useAuthStore(s => s.status);
    const user = useAuthStore(s => s.user);
    const openAuth = useAuthStore(s => s.openModal);
    useEffect(() => {
        const i = setInterval(() => setT(localTimeStamp()), 30_000);
        return () => clearInterval(i);
    }, []);

    async function handleAccountClick() {
        if (status !== "signed-in") {
            openAuth();
            return;
        }
        navigate("/profile");
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
                    className="hidden lg:inline-flex p-2 rounded-full text-on-surface-variant hover:text-primary-fixed-dim hover:bg-white/5 transition"
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
                {status === "signed-in" ? (
                    <button
                        type="button"
                        onClick={handleAccountClick}
                        className="relative p-2 rounded-full text-on-surface-variant hover:text-primary-fixed-dim hover:bg-white/5 transition"
                        aria-label="프로필"
                        title={user?.email ?? "프로필"}
                    >
                        <Icon name="account_circle" className="text-[18px]" />
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary-fixed-dim" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleAccountClick}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-semibold font-mono tracking-wider text-primary-fixed-dim bg-primary-fixed-dim/[0.08] hover:bg-primary-fixed-dim/[0.18] border border-primary-fixed-dim/20 hover:border-primary-fixed-dim/40 rounded-full transition active:scale-[0.97] duration-200"
                        aria-label="로그인"
                        title="로그인"
                    >
                        <Icon name="login" className="text-[14px]" />
                        <span>로그인</span>
                    </button>
                )}
            </div>
        </header>
    );
}
