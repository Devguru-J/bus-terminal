import {Suspense, useEffect} from "react";
import {Routes, Route, useLocation} from "react-router-dom";
import {AppShell} from "@/components/shell/AppShell";
import {ErrorBoundary} from "@/components/shell/ErrorBoundary";
import {CommandPalette} from "@/components/shell/CommandPalette";
import {ToastViewport} from "@/components/shell/ToastViewport";
import {AuthModal} from "@/components/auth/AuthModal";
import {OnboardingModal} from "@/components/shell/OnboardingModal";
import {initAuth} from "@/stores/authStore";
import {HomePage} from "@/pages/Home";
import {NotFoundPage} from "@/pages/NotFound";
import {lazyWithRetry, clearChunkReloadFlag} from "@/lib/lazyWithRetry";
import {trackPageview} from "@/lib/analytics";
import {initAutosaveHint} from "@/lib/autosaveHint";
import {applySeoMeta, getSeoMeta} from "@/lib/seo";

// 페이지는 lazy-loading. 첫 번들이 작아지고 라우트 단위로 fetch.
// lazyWithRetry: 배포 후 stale chunk(MIME 에러) 자동 1회 새로고침 복구.
const GhosttyPage = lazyWithRetry(() => import("@/pages/Ghostty").then(m => ({default: m.GhosttyPage})));
const TmuxPage = lazyWithRetry(() => import("@/pages/Tmux").then(m => ({default: m.TmuxPage})));
const NeovimPage = lazyWithRetry(() => import("@/pages/Neovim").then(m => ({default: m.NeovimPage})));
const ZshPage = lazyWithRetry(() => import("@/pages/Zsh").then(m => ({default: m.ZshPage})));
const HelixPage = lazyWithRetry(() => import("@/pages/Helix").then(m => ({default: m.HelixPage})));
const Iterm2Page = lazyWithRetry(() => import("@/pages/Iterm2").then(m => ({default: m.Iterm2Page})));
const WarpPage = lazyWithRetry(() => import("@/pages/Warp").then(m => ({default: m.WarpPage})));
const ThemesPage = lazyWithRetry(() => import("@/pages/Themes").then(m => ({default: m.ThemesPage})));
const FontsPage = lazyWithRetry(() => import("@/pages/Fonts").then(m => ({default: m.FontsPage})));
const MyRoutesPage = lazyWithRetry(() => import("@/pages/MyRoutes").then(m => ({default: m.MyRoutesPage})));
const SettingsPage = lazyWithRetry(() => import("@/pages/Settings").then(m => ({default: m.SettingsPage})));
const ProfilePage = lazyWithRetry(() => import("@/pages/Profile").then(m => ({default: m.ProfilePage})));
const DiffPage = lazyWithRetry(() => import("@/pages/Diff").then(m => ({default: m.DiffPage})));
const ExportPage = lazyWithRetry(() => import("@/pages/Export").then(m => ({default: m.ExportPage})));
const ThemeDetailPage = lazyWithRetry(() => import("@/pages/ThemeDetail").then(m => ({default: m.ThemeDetailPage})));
const FontDetailPage = lazyWithRetry(() => import("@/pages/FontDetail").then(m => ({default: m.FontDetailPage})));
const ThemeComparePage = lazyWithRetry(() => import("@/pages/ThemeCompare").then(m => ({default: m.ThemeComparePage})));
const FontPairingsPage = lazyWithRetry(() => import("@/pages/FontPairings").then(m => ({default: m.FontPairingsPage})));
const GuidePage = lazyWithRetry(() => import("@/pages/Guide").then(m => ({default: m.GuidePage})));
const ApplyGuideDetailPage = lazyWithRetry(() => import("@/pages/ApplyGuideDetail").then(m => ({default: m.ApplyGuideDetailPage})));
const ToolsPage = lazyWithRetry(() => import("@/pages/Tools").then(m => ({default: m.ToolsPage})));
const FeedbackPage = lazyWithRetry(() => import("@/pages/Feedback").then(m => ({default: m.FeedbackPage})));
const PrivacyPage = lazyWithRetry(() => import("@/pages/Privacy").then(m => ({default: m.PrivacyPage})));
const TermsPage = lazyWithRetry(() => import("@/pages/Terms").then(m => ({default: m.TermsPage})));

function PageFallback() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="space-y-4 animate-pulse">
                <div className="h-8 w-64 rounded bg-white/[0.04]" />
                <div className="h-4 w-96 rounded bg-white/[0.03]" />
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="h-48 rounded-xl bg-white/[0.03]" />
                    <div className="h-48 rounded-xl bg-white/[0.03]" />
                </div>
            </div>
        </div>
    );
}

export default function App() {
    const location = useLocation();

    useEffect(() => {
        initAuth();
        clearChunkReloadFlag();
        initAutosaveHint();
    }, []);

    useEffect(() => {
        const path = location.pathname + location.search;
        const seo = getSeoMeta(location.pathname);
        applySeoMeta(seo);
        trackPageview(path);

        // GTM: SPA(싱글 페이지 애플리케이션) 라우팅 전환 시 GTM에 페이지뷰 이벤트를 전송합니다.
        if (typeof window !== "undefined") {
            const w = window as any;
            w.dataLayer = w.dataLayer || [];
            w.dataLayer.push({
                event: "pageview",
                page_path: path,
                page_title: seo.title
            });
        }
    }, [location.pathname, location.search]);

    return (
        <>
            <AppShell>
                <ErrorBoundary>
                    <Suspense fallback={<PageFallback />}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/guide" element={<GuidePage />} />
                        <Route path="/guides/:slug" element={<ApplyGuideDetailPage />} />
                        <Route path="/tools" element={<ToolsPage />} />
                        <Route path="/feedback" element={<FeedbackPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/ghostty" element={<GhosttyPage />} />
                        <Route path="/tmux" element={<TmuxPage />} />
                        <Route path="/neovim" element={<NeovimPage />} />
                        <Route path="/zsh" element={<ZshPage />} />
                        <Route path="/helix" element={<HelixPage />} />
                        <Route path="/iterm2" element={<Iterm2Page />} />
                        <Route path="/warp" element={<WarpPage />} />
                        <Route path="/themes" element={<ThemesPage />} />
                        <Route path="/themes/compare" element={<ThemeComparePage />} />
                        <Route path="/themes/:id" element={<ThemeDetailPage />} />
                        <Route path="/fonts" element={<FontsPage />} />
                        <Route path="/fonts/pairings" element={<FontPairingsPage />} />
                        <Route path="/fonts/:id" element={<FontDetailPage />} />
                        <Route path="/my-routes" element={<MyRoutesPage />} />
                        <Route path="/diff" element={<DiffPage />} />
                        <Route path="/export" element={<ExportPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Suspense>
                </ErrorBoundary>
            </AppShell>
            <CommandPalette />
            <AuthModal />
            <OnboardingModal />
            <ToastViewport />
        </>
    );
}
