import type {ReactNode} from "react";
import {Sidebar} from "./Sidebar";
import {TopBar} from "./TopBar";
import {BottomFooter} from "./BottomFooter";

/** Persistent chrome: sidebar + topbar + footer. */
export function AppShell({children}: {children: ReactNode}) {
    return (
        <div className="min-h-screen flex bg-background text-on-background ambient-glow">
            <Sidebar />
            <div className="relative z-10 flex flex-col flex-1 min-w-0">
                <TopBar />
                <main className="flex-1 min-w-0 px-6 lg:px-10 py-8 lg:py-10">{children}</main>
                <BottomFooter />
            </div>
        </div>
    );
}
