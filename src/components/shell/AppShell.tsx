import type {ReactNode} from "react";
import {Sidebar} from "./Sidebar";
import {TopBar} from "./TopBar";
import {BottomFooter} from "./BottomFooter";

/** Persistent chrome: sidebar + topbar + footer. */
export function AppShell({children}: {children: ReactNode}) {
    return (
        <div className="min-h-[100dvh] flex bg-background text-on-background ambient-glow">
            <a
                href="#main"
                className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-50 focus-visible:rounded focus-visible:bg-primary-fixed-dim focus-visible:text-on-primary focus-visible:px-3 focus-visible:py-2 focus-visible:font-mono focus-visible:text-label-xs focus-visible:uppercase focus-visible:tracking-[0.14em]"
            >
                본문으로 건너뛰기
            </a>
            <Sidebar />
            <div className="relative z-10 flex flex-col flex-1 min-w-0">
                <TopBar />
                <main
                    id="main"
                    className="flex-1 min-w-0 px-6 lg:px-10 py-8 lg:py-10"
                >
                    {children}
                </main>
                <BottomFooter />
            </div>
        </div>
    );
}
