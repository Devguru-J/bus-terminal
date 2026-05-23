import {useNavigate} from "react-router-dom";
import {DepartureComplete} from "@/components/export/DepartureComplete";
import {useGhosttyStore} from "@/stores/ghosttyStore";
import {useTmuxStore} from "@/stores/tmuxStore";
import {downloadText} from "@/lib/download";
import {toast} from "@/stores/toastStore";

export function ExportPage() {
    const ghostty = useGhosttyStore(s => s.exportText)();
    const tmux = useTmuxStore(s => s.exportText)();
    const navigate = useNavigate();

    return (
        <div className="max-w-5xl mx-auto py-6">
            <DepartureComplete
                summary={[
                    {label: "Platform", value: "Ghostty"},
                    {label: "Multiplexer", value: "tmux"},
                    {label: "Editor", value: "Neovim"},
                    {label: "Shell", value: "Zsh"}
                ]}
                onDownload={() => {
                    downloadText("ghostty-config", ghostty);
                    setTimeout(() => downloadText(".tmux.conf", tmux), 200);
                    toast("두 개의 설정 파일이 도착했어요.", "success");
                }}
                onReturn={() => navigate("/ghostty")}
            />
        </div>
    );
}
