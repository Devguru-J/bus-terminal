import {Routes, Route} from "react-router-dom";
import {Header} from "@/components/layout/Header";
import {Footer} from "@/components/layout/Footer";
import {ToastViewport} from "@/components/layout/ToastViewport";
import {HomePage} from "@/pages/Home";
import {GhosttyPage} from "@/pages/Ghostty";
import {TmuxPage} from "@/pages/Tmux";
import {ThemesPage} from "@/pages/Themes";
import {MyRoutesPage} from "@/pages/MyRoutes";
import {SettingsPage} from "@/pages/Settings";

export default function App() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/ghostty" element={<GhosttyPage />} />
                    <Route path="/tmux" element={<TmuxPage />} />
                    <Route path="/themes" element={<ThemesPage />} />
                    <Route path="/my-routes" element={<MyRoutesPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Routes>
            </main>
            <Footer />
            <ToastViewport />
        </div>
    );
}
