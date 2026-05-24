import {useEffect, useMemo, useState} from "react";
import {StationHeader} from "@/components/shell/StationHeader";
import {RouteTable} from "@/components/platform/RouteTable";
import {Icon} from "@/components/ui/Icon";
import {Badge} from "@/components/ui/Badge";
import {TextInput} from "@/components/ui/Field";
import {useRoutesStore} from "@/stores/routesStore";
import {useGhosttyStore} from "@/stores/ghosttyStore";
import {downloadText} from "@/lib/download";
import {copyText} from "@/lib/download";
import {
    buildShareUrl,
    decodePayload,
    encodePayload,
    MAX_SHARE_URL_LENGTH,
    readShareFromHash
} from "@/lib/share";
import {toast} from "@/stores/toastStore";

const FILENAME: Record<string, string> = {
    ghostty: "ghostty-config",
    tmux: ".tmux.conf",
    neovim: "init.lua",
    zsh: ".zshrc",
    helix: "helix-config.toml",
    iterm2: "BusTerminal.itermcolors",
    warp: "warp-theme.yaml"
};

export function MyRoutesPage() {
    const {routes, remove, rename, save} = useRoutesStore();
    const importGhostty = useGhosttyStore(s => s.importText);
    const [query, setQuery] = useState("");
    useEffect(() => {
        const encoded = readShareFromHash(window.location.hash);
        if (!encoded) return;
        try {
            const parsed = JSON.parse(decodePayload(encoded)) as {
                name: string;
                platform: "ghostty" | "tmux" | "neovim" | "zsh" | "helix" | "iterm2" | "warp";
                text: string;
            };
            if (!parsed.name || !parsed.platform || !parsed.text) return;
            save({name: `${parsed.name} shared`, platform: parsed.platform, text: parsed.text});
            toast("공유 노선을 내 차고에 복사했어요.", "success");
            history.replaceState(null, "", window.location.pathname);
        }
        catch {
            toast("공유 링크를 읽지 못했어요.", "warn");
        }
    }, [save]);
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return routes;
        return routes.filter(r =>
            `${r.name} ${r.platform} ${r.text}`.toLowerCase().includes(q)
        );
    }, [query, routes]);

    return (
        <div className="max-w-7xl mx-auto">
            <StationHeader
                title="내 노선"
                eyebrow={`Saved · ${filtered.length}/${routes.length} Stored`}
                subtitle="저장해 둔 개발환경 설정입니다. 다시 적용하거나 파일로 다운로드할 수 있어요."
                actions={
                    <Badge tone="active">
                        <Icon name="garage" className="text-[14px]" />
                        차고 보관 (Saved)
                    </Badge>
                }
            />

            <div className="mb-4">
                <TextInput
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="노선 이름, 플랫폼, 설정 내용 검색"
                />
            </div>

            <RouteTable
                routes={filtered}
                onPlay={r => {
                    if (r.platform === "ghostty") {
                        importGhostty(r.text);
                        toast(`"${r.name}"으로 환승했어요.`, "success");
                    }
                    else {
                        // 다른 플랫폼은 import 파서가 없으므로 즉시 다운로드로 출발시킴
                        downloadText(FILENAME[r.platform] ?? r.platform, r.text);
                        toast(
                            `"${r.name}" 노선을 ${FILENAME[r.platform]} 파일로 출발시켰어요.`,
                            "success"
                        );
                    }
                }}
                onRename={r => {
                    const next = prompt("새 노선 이름", r.name);
                    if (!next?.trim()) return;
                    rename(r.id, next.trim());
                    toast("노선 이름을 변경했어요.", "success");
                }}
                onDuplicate={r => {
                    save({name: `${r.name} copy`, platform: r.platform, text: r.text});
                    toast(`"${r.name}" 노선을 복제했어요.`, "success");
                }}
                onShare={async r => {
                    const payload = encodePayload(JSON.stringify({
                        name: r.name,
                        platform: r.platform,
                        text: r.text
                    }));
                    const url = buildShareUrl(window.location.origin, "/my-routes", payload);
                    const ok = await copyText(url);
                    const lengthNote =
                        url.length > MAX_SHARE_URL_LENGTH
                            ? " 링크가 길어 일부 메신저에서 깨질 수 있어요."
                            : "";
                    toast(
                        ok
                            ? `공유 링크를 복사했어요.${lengthNote}`
                            : "클립보드 복사에 실패했어요.",
                        ok ? "success" : "warn"
                    );
                }}
                onDelete={r => {
                    if (confirm(`"${r.name}"을(를) 삭제하시겠어요?`)) {
                        remove(r.id);
                    }
                }}
            />

        </div>
    );
}
