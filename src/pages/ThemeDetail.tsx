import {useState} from "react";
import {Link, useParams} from "react-router-dom";
import {StationHeader} from "@/components/shell/StationHeader";
import {Button} from "@/components/ui/Button";
import {useConfirmDialog} from "@/components/ui/ConfirmModal";
import {Icon} from "@/components/ui/Icon";
import {Badge} from "@/components/ui/Badge";
import {themes as builtinThemes, themeToConfigSnippet} from "@/data/themes";
import {useUserThemesStore} from "@/stores/userThemesStore";
import {useGhosttyStore} from "@/stores/ghosttyStore";
import {useTmuxStore} from "@/stores/tmuxStore";
import {useNeovimStore} from "@/stores/neovimStore";
import {useHelixStore} from "@/stores/helixStore";
import {useIterm2Store} from "@/stores/iterm2Store";
import {useWarpStore} from "@/stores/warpStore";
import {useFavoritesStore} from "@/stores/favoritesStore";
import {NVIM_COLORSCHEMES, type NvimColorscheme} from "@/data/neovim";
import {HELIX_THEMES, type HelixTheme} from "@/data/helix";
import {toast} from "@/stores/toastStore";
import {copyText} from "@/lib/download";
import {cn} from "@/lib/utils";

const ANSI_LABELS = [
    "black", "red", "green", "yellow", "blue", "magenta", "cyan", "white",
    "br-black", "br-red", "br-green", "br-yellow", "br-blue", "br-magenta", "br-cyan", "br-white"
];

function themeToNvimColorscheme(id: string): NvimColorscheme {
    const map: Record<string, NvimColorscheme> = {
        "tokyo-night": "tokyonight", "tokyo-night-storm": "tokyonight", "tokyo-night-moon": "tokyonight",
        "gruvbox-dark": "gruvbox", "gruvbox-light": "gruvbox",
        "catppuccin-mocha": "catppuccin", "catppuccin-macchiato": "catppuccin",
        "catppuccin-frappe": "catppuccin", "catppuccin-latte": "catppuccin",
        "nord": "nord", "rose-pine": "rose-pine", "rose-pine-moon": "rose-pine",
        "kanagawa": "kanagawa"
    };
    const c = map[id];
    return NVIM_COLORSCHEMES.includes(c as NvimColorscheme) ? (c as NvimColorscheme) : "default";
}

function themeToHelixTheme(id: string): HelixTheme {
    const map: Record<string, HelixTheme> = {
        "tokyo-night": "tokyonight", "tokyo-night-storm": "tokyonight_storm", "tokyo-night-moon": "tokyonight",
        "catppuccin-mocha": "catppuccin_mocha", "catppuccin-macchiato": "catppuccin_macchiato",
        "catppuccin-frappe": "catppuccin_mocha", "gruvbox-dark": "gruvbox_dark_hard",
        "gruvbox-light": "gruvbox", "nord": "nord", "dracula": "dracula",
        "rose-pine": "rose_pine", "rose-pine-moon": "rose_pine_moon",
        "monokai-pro": "monokai_pro", "ayu-dark": "ayu_dark", "one-dark": "onedark"
    };
    const c = map[id];
    return HELIX_THEMES.includes(c as HelixTheme) ? (c as HelixTheme) : "default";
}

export function ThemeDetailPage() {
    const {id} = useParams();
    const userThemes = useUserThemesStore(s => s.items);
    const removeUserTheme = useUserThemesStore(s => s.remove);
    const theme = [...userThemes, ...builtinThemes].find(t => t.id === id);
    const isUserTheme = userThemes.some(t => t.id === id);
    const favorite = useFavoritesStore(s => s.themes.includes(id ?? ""));
    const toggleFavorite = useFavoritesStore(s => s.toggleTheme);
    const applyGhostty = useGhosttyStore(s => s.applyTheme);
    const applyIterm2 = useIterm2Store(s => s.applyTheme);
    const applyWarp = useWarpStore(s => s.applyTheme);
    const setTmuxField = useTmuxStore(s => s.setField);
    const setNvimField = useNeovimStore(s => s.setField);
    const setHelixField = useHelixStore(s => s.setField);

    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const {confirm, dialog: confirmDialog} = useConfirmDialog();

    if (!theme) {
        return (
            <div className="max-w-2xl mx-auto py-12 text-center">
                <Icon name="palette" className="text-[40px] text-on-surface-variant/40" />
                <p className="mt-3 text-body-md text-on-surface-variant">
                    "{id}" 테마를 찾을 수 없어요.
                </p>
                <Link
                    to="/themes"
                    className="inline-flex items-center gap-1 mt-4 text-primary-fixed-dim hover:underline"
                >
                    <Icon name="arrow_back" className="text-[16px]" /> 테마 환승센터로
                </Link>
            </div>
        );
    }

    async function copy(snippet: string, key: string) {
        const ok = await copyText(snippet);
        if (ok) {
            setCopiedKey(key);
            toast("클립보드에 복사했어요.", "success");
            setTimeout(() => setCopiedKey(null), 1500);
        }
    }

    function applyToAll() {
        applyGhostty(theme!);
        applyIterm2(theme!);
        applyWarp(theme!);
        setTmuxField("statusStyle", `fg=${theme!.foreground},bg=${theme!.background}`);
        setTmuxField("leftSegments", [`#[fg=${theme!.accent}] #S `, `#[fg=${theme!.foreground}] | `]);
        setTmuxField("rightSegments", [`#[fg=${theme!.foreground}] %Y-%m-%d `, `#[fg=${theme!.accent}] %H:%M `]);
        setNvimField("colorscheme", themeToNvimColorscheme(theme!.id));
        setHelixField("theme", themeToHelixTheme(theme!.id));
        toast(`6개 도구에 "${theme!.ko}"을 적용했어요.`, "success");
    }

    const ghosttySnippet = themeToConfigSnippet(theme);
    const tmuxSnippet = `set -g status-style "fg=${theme.foreground},bg=${theme.background}"\nset -g status-left "#[fg=${theme.accent}] #S "\nset -g status-right "#[fg=${theme.accent}] %H:%M "`;
    const helixSnippet = `theme = "${themeToHelixTheme(theme.id)}"`;
    const nvimSnippet = `vim.cmd.colorscheme("${themeToNvimColorscheme(theme.id)}")`;
    const warpSnippet = `name: ${theme.ko}\naccent: "${theme.accent}"\nbackground: "${theme.background}"\nforeground: "${theme.foreground}"`;

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <StationHeader
                title={theme.ko}
                eyebrow={`테마 노선 · ${theme.id}`}
                subtitle={
                    <span className="inline-flex items-center gap-2 flex-wrap">
                        {theme.author && (
                            <span className="text-on-surface-variant">{theme.author}</span>
                        )}
                        {theme.tags.map(t => (
                            <Badge key={t} tone={t === "popular" ? "active" : "info"}>
                                {t}
                            </Badge>
                        ))}
                    </span>
                }
                actions={
                    <>
                        {isUserTheme && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                    if (await confirm({
                                        title: "사용자 테마 삭제",
                                        message: `"${theme.ko}" 사용자 테마를 삭제합니다.`,
                                        confirmLabel: "삭제",
                                        danger: true
                                    })) {
                                        removeUserTheme(theme.id);
                                        toast("삭제했어요.", "success");
                                        window.history.back();
                                    }
                                }}
                            >
                                <Icon name="delete" className="text-[16px] text-error" />
                                삭제
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleFavorite(theme.id)}
                        >
                            <Icon
                                name="favorite"
                                className={cn("text-[16px]", favorite && "text-error")}
                                fill={favorite}
                            />
                            {favorite ? "즐겨찾기 해제" : "즐겨찾기"}
                        </Button>
                        <Button size="sm" onClick={applyToAll}>
                            <Icon name="cell_tower" className="text-[16px]" /> 6개 도구에 모두 적용
                        </Button>
                    </>
                }
            />

            <div className="mb-4 flex items-center justify-between">
                <Link
                    to="/themes"
                    className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary-fixed-dim text-code-sm"
                >
                    <Icon name="arrow_back" className="text-[14px]" /> 테마 환승센터
                </Link>
            </div>

            <p className="text-body-md text-on-surface-variant mb-6">
                {theme.description}
            </p>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
                {/* 좌측: 큰 미리보기 */}
                <div className="space-y-5 min-w-0">
                    <div
                        className="rounded-xl border border-white/[0.06] overflow-hidden"
                        style={{background: theme.background, color: theme.foreground}}
                    >
                        <div
                            className="px-4 py-2 border-b font-mono text-[11px] flex items-center gap-2"
                            style={{
                                borderColor: theme.selectionBg,
                                background: theme.selectionBg + "33"
                            }}
                        >
                            <span style={{color: theme.accent}}>●</span>
                            <span>{theme.ko}</span>
                            <span className="opacity-50">·</span>
                            <span className="opacity-50">{theme.id}</span>
                        </div>
                        <pre className="p-5 font-mono text-[13px] leading-relaxed whitespace-pre-wrap">
                            <span style={{color: theme.accent}}>❯</span> git status
                            {"\n"}On branch <span style={{color: theme.palette16[12]}}>main</span>
                            {"\n"}Your branch is up to date with{" "}
                            <span
                                style={{
                                    background: theme.selectionBg,
                                    color: theme.selectionFg
                                }}
                            >
                                'origin/main'
                            </span>
                            {"\n\n"}Changes to be committed:
                            {"\n"}  (use <span style={{color: theme.palette16[3]}}>"git restore --staged"</span> to unstage)
                            {"\n\n"}  <span style={{color: theme.palette16[2]}}>modified:</span>   src/data/themes.ts
                            {"\n"}  <span style={{color: theme.palette16[2]}}>modified:</span>   src/pages/Themes.tsx
                            {"\n\n"}<span style={{color: theme.palette16[1]}}>Untracked files:</span>
                            {"\n"}  src/pages/ThemeDetail.tsx
                            {"\n\n"}<span style={{color: theme.palette16[12]}}>function</span>{" "}
                            <span style={{color: theme.palette16[4]}}>fibonacci</span>(n: <span style={{color: theme.palette16[6]}}>number</span>): <span style={{color: theme.palette16[6]}}>number</span> {"{"}
                            {"\n"}    <span style={{color: theme.palette16[5]}}>if</span> (n {"<"} <span style={{color: theme.palette16[3]}}>2</span>) <span style={{color: theme.palette16[5]}}>return</span> n;
                            {"\n"}    <span style={{color: theme.palette16[5]}}>return</span> fibonacci(n - <span style={{color: theme.palette16[3]}}>1</span>) + fibonacci(n - <span style={{color: theme.palette16[3]}}>2</span>);
                            {"\n"}{"}"}
                            {"\n\n"}<span style={{color: theme.accent}}>❯</span> <span style={{background: theme.cursor, color: theme.background}}>{" "}</span>
                        </pre>
                    </div>

                    {/* 16색 팔레트 그리드 */}
                    <div className="rounded-xl border border-white/[0.06] bg-surface-container-lowest/80 p-4">
                        <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant mb-3">
                            ANSI 16 Colors
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                            {theme.palette16.map((c, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => copy(c, `ansi-${i}`)}
                                    className="group rounded-lg border border-white/[0.06] overflow-hidden text-left hover:border-white/30 transition"
                                    title={`${ANSI_LABELS[i]} · ${c}`}
                                >
                                    <div className="h-12" style={{background: c}} />
                                    <div className="px-2 py-1.5 bg-surface-container-lowest">
                                        <div className="font-mono text-[10px] text-on-surface-variant truncate">
                                            {i}. {ANSI_LABELS[i]}
                                        </div>
                                        <div className="font-mono text-[10px] text-on-surface uppercase">
                                            {copiedKey === `ansi-${i}` ? "복사됨" : c}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* UI 색 */}
                    <div className="rounded-xl border border-white/[0.06] bg-surface-container-lowest/80 p-4">
                        <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant mb-3">
                            UI Colors
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {([
                                ["background", theme.background],
                                ["foreground", theme.foreground],
                                ["cursor", theme.cursor],
                                ["selectionBg", theme.selectionBg],
                                ["selectionFg", theme.selectionFg],
                                ["accent", theme.accent]
                            ] as const).map(([k, c]) => (
                                <button
                                    key={k}
                                    type="button"
                                    onClick={() => copy(c, `ui-${k}`)}
                                    className="rounded-lg border border-white/[0.06] overflow-hidden text-left hover:border-white/30 transition"
                                >
                                    <div className="h-10" style={{background: c}} />
                                    <div className="px-3 py-2 bg-surface-container-lowest">
                                        <div className="font-mono text-[10px] text-on-surface-variant">{k}</div>
                                        <div className="font-mono text-[11px] text-on-surface uppercase">
                                            {copiedKey === `ui-${k}` ? "복사됨" : c}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 우측: 플랫폼별 코드 스니펫 */}
                <div className="space-y-3 xl:sticky xl:top-[80px] h-fit">
                    <ExportBlock
                        title="Ghostty"
                        filename="~/.config/ghostty/config"
                        snippet={ghosttySnippet}
                        onCopy={() => copy(ghosttySnippet, "ghostty")}
                        copied={copiedKey === "ghostty"}
                    />
                    <ExportBlock
                        title="tmux"
                        filename="~/.tmux.conf"
                        snippet={tmuxSnippet}
                        onCopy={() => copy(tmuxSnippet, "tmux")}
                        copied={copiedKey === "tmux"}
                    />
                    <ExportBlock
                        title="Helix"
                        filename="~/.config/helix/config.toml"
                        snippet={helixSnippet}
                        onCopy={() => copy(helixSnippet, "helix")}
                        copied={copiedKey === "helix"}
                    />
                    <ExportBlock
                        title="Neovim"
                        filename="init.lua"
                        snippet={nvimSnippet}
                        onCopy={() => copy(nvimSnippet, "nvim")}
                        copied={copiedKey === "nvim"}
                    />
                    <ExportBlock
                        title="Warp"
                        filename="~/.warp/themes/*.yaml"
                        snippet={warpSnippet}
                        onCopy={() => copy(warpSnippet, "warp")}
                        copied={copiedKey === "warp"}
                    />

                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                            const url = `${window.location.origin}/themes/${theme.id}`;
                            copy(url, "share");
                        }}
                    >
                        <Icon name="link" className="text-[14px]" />
                        {copiedKey === "share" ? "복사됨" : "공유 링크 복사"}
                    </Button>
                </div>
            </div>
            {confirmDialog}
        </div>
    );

}

function ExportBlock({
    title,
    filename,
    snippet,
    onCopy,
    copied
}: {
    title: string;
    filename: string;
    snippet: string;
    onCopy: () => void;
    copied: boolean;
}) {
    return (
        <div className="rounded-xl border border-white/[0.06] bg-surface-container-lowest/80 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.05]">
                <div>
                    <div className="font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface">
                        {title}
                    </div>
                    <div className="font-mono text-[10px] text-on-surface-variant/70">
                        {filename}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onCopy}
                    className="text-on-surface-variant hover:text-on-surface text-[12px] font-mono uppercase tracking-[0.12em]"
                >
                    <Icon name={copied ? "check" : "content_copy"} className="text-[14px]" />
                    {copied ? "복사됨" : "복사"}
                </button>
            </div>
            <pre className="p-3 text-[11px] font-mono text-on-surface-variant whitespace-pre-wrap max-h-40 overflow-y-auto">
                {snippet}
            </pre>
        </div>
    );
}
