import {Routes, Route} from "react-router-dom";
import {AppShell} from "@/components/shell/AppShell";
import {ToastViewport} from "@/components/shell/ToastViewport";
import {HomePage} from "@/pages/Home";
import {GhosttyPage} from "@/pages/Ghostty";
import {TmuxPage} from "@/pages/Tmux";
import {NeovimPage} from "@/pages/Neovim";
import {ZshPage} from "@/pages/Zsh";
import {ThemesPage} from "@/pages/Themes";
import {MyRoutesPage} from "@/pages/MyRoutes";
import {SettingsPage} from "@/pages/Settings";
import {DiffPage} from "@/pages/Diff";
import {ExportPage} from "@/pages/Export";

export default function App() {
    return (
        <>
            <AppShell>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/ghostty" element={<GhosttyPage />} />
                    <Route path="/tmux" element={<TmuxPage />} />
                    <Route path="/neovim" element={<NeovimPage />} />
                    <Route path="/zsh" element={<ZshPage />} />
                    <Route path="/themes" element={<ThemesPage />} />
                    <Route path="/my-routes" element={<MyRoutesPage />} />
                    <Route path="/diff" element={<DiffPage />} />
                    <Route path="/export" element={<ExportPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Routes>
            </AppShell>
            <ToastViewport />
        </>
    );
}
