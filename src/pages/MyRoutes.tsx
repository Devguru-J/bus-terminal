import {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {StationHeader} from "@/components/shell/StationHeader";
import {RouteTable} from "@/components/platform/RouteTable";
import {Icon} from "@/components/ui/Icon";
import {Badge} from "@/components/ui/Badge";
import {TextInput} from "@/components/ui/Field";
import {SaveNameModal} from "@/components/ui/SaveNameModal";
import {useConfirmDialog} from "@/components/ui/ConfirmModal";
import {type SavedRoute, useRoutesStore} from "@/stores/routesStore";
import {useGhosttyStore} from "@/stores/ghosttyStore";
import {copyText} from "@/lib/download";
import {useTmuxStore} from "@/stores/tmuxStore";
import {useNeovimStore} from "@/stores/neovimStore";
import {useZshStore} from "@/stores/zshStore";
import {useHelixStore} from "@/stores/helixStore";
import {useIterm2Store} from "@/stores/iterm2Store";
import {useWarpStore} from "@/stores/warpStore";
import type {Iterm2Profile} from "@/data/iterm2";
import {
    importHelixToml,
    importNvimInit,
    importTmuxConf,
    importWarpTheme,
    importZshrc,
    parseItermColors
} from "@/lib/importers";
import {
    buildShareUrl,
    decodePayload,
    encodePayload,
    MAX_SHARE_URL_LENGTH,
    readShareFromHash
} from "@/lib/share";
import {toast} from "@/stores/toastStore";

const PLATFORM_PATH: Record<string, string> = {
    ghostty: "/ghostty",
    tmux: "/tmux",
    neovim: "/neovim",
    zsh: "/zsh",
    helix: "/helix",
    iterm2: "/iterm2",
    warp: "/warp"
};

export function MyRoutesPage() {
    const navigate = useNavigate();
    const {routes, remove, rename, save} = useRoutesStore();
    const importGhostty = useGhosttyStore(s => s.importText);
    const [query, setQuery] = useState("");
    const [renameTarget, setRenameTarget] = useState<{id: string; name: string} | null>(null);
    const {confirm, dialog: confirmDialog} = useConfirmDialog();
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
                subtitle="저장해 둔 개발환경 설정입니다. 다시 탑승하면 해당 도구 화면에 바로 적용돼요."
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
                    const result = applyRouteInApp(r, importGhostty);
                    if (!result.ok) {
                        toast(result.message, "warn");
                        return;
                    }
                    toast(result.message, "success");
                    navigate(PLATFORM_PATH[r.platform] ?? "/");
                }}
                onRename={r => setRenameTarget({id: r.id, name: r.name})}
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
                onDelete={async r => {
                    if (await confirm({
                        title: "노선 삭제",
                        message: `"${r.name}"을(를) 삭제합니다.`,
                        confirmLabel: "삭제",
                        danger: true
                    })) {
                        remove(r.id);
                        toast("삭제했어요.", "success");
                    }
                }}
            />

            <SaveNameModal
                open={!!renameTarget}
                onClose={() => setRenameTarget(null)}
                onSubmit={name => {
                    if (!renameTarget) return;
                    rename(renameTarget.id, name);
                    toast("노선 이름을 변경했어요.", "success");
                }}
                title="노선 이름 변경"
                label="새 노선 이름"
                initialValue={renameTarget?.name ?? ""}
                submitLabel="변경"
            />
            {confirmDialog}
        </div>
    );
}

function applyRouteInApp(
    route: SavedRoute,
    importGhostty: ReturnType<typeof useGhosttyStore.getState>["importText"]
): {ok: boolean; message: string} {
    switch (route.platform) {
        case "ghostty": {
            const r = importGhostty(route.text);
            return appliedMessage(route.name, r.applied, r.unknownLines.length, "Ghostty");
        }
        case "tmux": {
            const r = importTmuxConf(route.text);
            if (r.applied === 0) return noImport(route.name, "tmux");
            useTmuxStore.setState(s => ({config: {...s.config, ...r.value}}));
            return appliedMessage(route.name, r.applied, r.unknownLines.length, "tmux");
        }
        case "neovim": {
            const r = importNvimInit(route.text);
            if (r.applied === 0) return noImport(route.name, "Neovim");
            useNeovimStore.setState(s => ({config: {...s.config, ...r.value}}));
            return appliedMessage(route.name, r.applied, r.unknownLines.length, "Neovim");
        }
        case "zsh": {
            const r = importZshrc(route.text);
            if (r.applied === 0) return noImport(route.name, "Zsh");
            useZshStore.setState(s => ({config: {...s.config, ...r.value}}));
            return appliedMessage(route.name, r.applied, r.unknownLines.length, "Zsh");
        }
        case "helix": {
            const r = importHelixToml(route.text);
            if (r.applied === 0) return noImport(route.name, "Helix");
            useHelixStore.setState(s => ({config: {...s.config, ...r.value}}));
            return appliedMessage(route.name, r.applied, r.unknownLines.length, "Helix");
        }
        case "iterm2": {
            const colors = parseItermColors(route.text);
            if (!colors) return noImport(route.name, "iTerm2");
            let applied = 0;
            useIterm2Store.setState(s => {
                const ansi = s.profile.ansi.slice();
                const profile = {...s.profile};
                for (const [key, value] of Object.entries(colors)) {
                    const ansiMatch = key.match(/^Ansi (\d+) Color$/);
                    if (ansiMatch) {
                        ansi[Number(ansiMatch[1])] = value;
                        applied++;
                        continue;
                    }
                    const field = ITERM_COLOR_FIELD[key];
                    if (field) {
                        profile[field] = value as never;
                        applied++;
                    }
                }
                return {profile: {...profile, ansi}};
            });
            return appliedMessage(route.name, applied, 0, "iTerm2");
        }
        case "warp": {
            const r = importWarpTheme(route.text);
            if (r.applied === 0) return noImport(route.name, "Warp");
            useWarpStore.setState(s => ({
                config: {
                    ...s.config,
                    ...r.value,
                    theme: r.value.theme ? {...s.config.theme, ...r.value.theme} : s.config.theme
                }
            }));
            return appliedMessage(route.name, r.applied, r.unknownLines.length, "Warp");
        }
    }
}

const ITERM_COLOR_FIELD: Record<string, keyof Iterm2Profile> = {
    "Background Color": "background",
    "Foreground Color": "foreground",
    "Cursor Color": "cursor",
    "Cursor Text Color": "cursorText",
    "Selection Color": "selection",
    "Selected Text Color": "selectedText",
    "Bold Color": "bold",
    "Link Color": "link",
    "Badge Color": "badge",
    "Tab Color": "tabColor"
} as const;

function appliedMessage(name: string, applied: number, unknown: number, platform: string) {
    if (applied === 0) return noImport(name, platform);
    const suffix = unknown > 0 ? ` 미인식 ${unknown}줄은 건너뛰었어요.` : "";
    return {ok: true, message: `"${name}" 노선을 ${platform} 화면에 바로 환승했어요. (${applied}개 적용)${suffix}`};
}

function noImport(name: string, platform: string) {
    return {
        ok: false,
        message: `"${name}"에서 ${platform}에 적용할 수 있는 설정을 찾지 못했어요.`
    };
}
