import {useNavigate} from "react-router-dom";
import {DepartureComplete} from "@/components/export/DepartureComplete";
import {Badge} from "@/components/ui/Badge";
import {Icon} from "@/components/ui/Icon";
import {Button} from "@/components/ui/Button";
import {useGhosttyStore} from "@/stores/ghosttyStore";
import {useTmuxStore} from "@/stores/tmuxStore";
import {useNeovimStore} from "@/stores/neovimStore";
import {useZshStore} from "@/stores/zshStore";
import {useHelixStore} from "@/stores/helixStore";
import {useIterm2Store} from "@/stores/iterm2Store";
import {useWarpStore} from "@/stores/warpStore";
import {downloadText} from "@/lib/download";
import {
    runConfigDiagnostics,
    summarizeDiagnostics,
    type ConfigDiagnostic,
    type DiagnosticLevel
} from "@/lib/diagnostics";
import {toast} from "@/stores/toastStore";

export function ExportPage() {
    const ghosttyConfig = useGhosttyStore(s => s.config);
    const ghosttyKeybinds = useGhosttyStore(s => s.keybinds);
    const ghostty = useGhosttyStore(s => s.exportText)();
    const tmuxConfig = useTmuxStore(s => s.config);
    const tmux = useTmuxStore(s => s.exportText)();
    const nvimConfig = useNeovimStore(s => s.config);
    const nvim = useNeovimStore(s => s.exportText)();
    const zshConfig = useZshStore(s => s.config);
    const zsh = useZshStore(s => s.exportText)();
    const starship = useZshStore(s => s.exportStarshipText)();
    const helix = useHelixStore(s => s.exportText)();
    const helixLanguages = useHelixStore(s => s.exportLanguagesText)();
    const itermColors = useIterm2Store(s => s.exportColors)();
    const itermProfile = useIterm2Store(s => s.exportProfile)();
    const warpTheme = useWarpStore(s => s.exportTheme)();
    const warpWorkflows = useWarpStore(s => s.exportWorkflows)();
    const warpSettings = useWarpStore(s => s.exportSettings)();
    const navigate = useNavigate();
    const diagnostics = runConfigDiagnostics({
        ghostty: {config: ghosttyConfig, keybinds: ghosttyKeybinds},
        tmux: tmuxConfig,
        neovim: nvimConfig,
        zsh: zshConfig
    });
    const summary = summarizeDiagnostics(diagnostics);

    return (
        <div className="max-w-5xl mx-auto py-6 space-y-8">
            <DepartureComplete
                summary={[
                    {label: "Platform", value: "Ghostty"},
                    {label: "Multiplexer", value: "tmux"},
                    {label: "Editor", value: "Neovim · Helix"},
                    {label: "Shell", value: "Zsh"},
                    {label: "macOS", value: "iTerm2 · Warp"}
                ]}
                onDownload={() => {
                    const files: Array<[string, string]> = [
                        ["ghostty-config", ghostty],
                        [".tmux.conf", tmux],
                        ["init.lua", nvim],
                        [".zshrc", zsh],
                        ...(starship ? ([["starship.toml", starship]] as Array<[string, string]>) : []),
                        ["helix-config.toml", helix],
                        ...(helixLanguages ? ([["helix-languages.toml", helixLanguages]] as Array<[string, string]>) : []),
                        ["BusTerminal.itermcolors", itermColors],
                        ["BusTerminal.profile.json", itermProfile],
                        ["warp-theme.yaml", warpTheme],
                        ...(warpWorkflows ? ([["warp-workflows.yaml", warpWorkflows]] as Array<[string, string]>) : []),
                        ["warp-settings.yaml", warpSettings]
                    ];
                    files.forEach(([name, content], i) =>
                        setTimeout(() => downloadText(name, content), i * 150)
                    );
                    toast(`${files.length}개의 설정 파일이 도착했어요.`, "success");
                }}
                onReturn={() => navigate("/ghostty")}
            />
            <div className="flex justify-center">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                        downloadText(
                            "bus-terminal-install.sh",
                            buildInstallScript({ghostty, tmux, nvim, zsh, starship, helix, helixLanguages, itermColors, itermProfile, warpTheme, warpWorkflows, warpSettings})
                        );
                        toast("설치 스크립트를 다운로드했어요.", "success");
                    }}
                >
                    <Icon name="terminal" className="text-[16px]" />
                    설치 스크립트 다운로드
                </Button>
            </div>
            <DiagnosticsPanel diagnostics={diagnostics} summary={summary} />
        </div>
    );
}

function buildInstallScript(files: {
    ghostty: string;
    tmux: string;
    nvim: string;
    zsh: string;
    starship: string;
    helix: string;
    helixLanguages: string;
    itermColors: string;
    itermProfile: string;
    warpTheme: string;
    warpWorkflows: string;
    warpSettings: string;
}): string {
    return `#!/usr/bin/env bash
set -euo pipefail

DRY_RUN=0
BACKUP=1
ONLY=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --no-backup) BACKUP=0 ;;
    --only) ONLY="$2"; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
  shift
done

write_file() {
  local target="$1"
  local content="$2"
  mkdir -p "$(dirname "$target")"
  if [[ "$BACKUP" == "1" && -f "$target" ]]; then
    cp "$target" "$target.bak.$(date +%Y%m%d%H%M%S)"
  fi
  if [[ "$DRY_RUN" == "1" ]]; then
    echo "[dry-run] write $target"
  else
    printf "%s" "$content" > "$target"
    echo "wrote $target"
  fi
}

[[ -z "$ONLY" || "$ONLY" == "ghostty" ]] && write_file "$HOME/.config/ghostty/config" ${shellString(files.ghostty)}
[[ -z "$ONLY" || "$ONLY" == "tmux" ]] && write_file "$HOME/.tmux.conf" ${shellString(files.tmux)}
[[ -z "$ONLY" || "$ONLY" == "neovim" ]] && write_file "$HOME/.config/nvim/init.lua" ${shellString(files.nvim)}
[[ -z "$ONLY" || "$ONLY" == "zsh" ]] && write_file "$HOME/.zshrc" ${shellString(files.zsh)}
${files.starship ? `[[ -z "$ONLY" || "$ONLY" == "zsh" ]] && write_file "$HOME/.config/starship.toml" ${shellString(files.starship)}` : ""}
[[ -z "$ONLY" || "$ONLY" == "helix" ]] && write_file "$HOME/.config/helix/config.toml" ${shellString(files.helix)}
${files.helixLanguages ? `[[ -z "$ONLY" || "$ONLY" == "helix" ]] && write_file "$HOME/.config/helix/languages.toml" ${shellString(files.helixLanguages)}` : ""}
[[ -z "$ONLY" || "$ONLY" == "iterm2" ]] && write_file "$HOME/Library/Application Support/iTerm2/DynamicProfiles/BusTerminal.json" ${shellString(files.itermProfile)}
[[ -z "$ONLY" || "$ONLY" == "iterm2" ]] && write_file "$HOME/Downloads/BusTerminal.itermcolors" ${shellString(files.itermColors)}
[[ -z "$ONLY" || "$ONLY" == "warp" ]] && write_file "$HOME/.warp/themes/bus-terminal.yaml" ${shellString(files.warpTheme)}
${files.warpWorkflows ? `[[ -z "$ONLY" || "$ONLY" == "warp" ]] && write_file "$HOME/.warp/workflows/bus-terminal.yaml" ${shellString(files.warpWorkflows)}` : ""}
[[ -z "$ONLY" || "$ONLY" == "warp" ]] && write_file "$HOME/.warp/bus-terminal-settings.yaml" ${shellString(files.warpSettings)}
`;
}

function shellString(value: string): string {
    return `$'${value
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "")}'`;
}

function DiagnosticsPanel({
    diagnostics,
    summary
}: {
    diagnostics: ConfigDiagnostic[];
    summary: {errors: number; warnings: number; info: number};
}) {
    const hasIssues = diagnostics.length > 0;
    return (
        <section className="rounded-xl border border-white/[0.06] bg-surface-container-low/60 p-5 text-left">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="font-mono text-label-xs uppercase tracking-[0.16em] text-primary-fixed-dim">
                        출발 전 점검
                    </div>
                    <p className="mt-2 text-body-md text-on-surface-variant">
                        생성될 설정의 충돌, 누락, 주의 사항을 점검합니다.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Badge tone={summary.errors ? "danger" : "muted"}>
                        {summary.errors} error
                    </Badge>
                    <Badge tone={summary.warnings ? "warn" : "muted"}>
                        {summary.warnings} warning
                    </Badge>
                    <Badge tone={summary.info ? "info" : "muted"}>
                        {summary.info} info
                    </Badge>
                </div>
            </div>

            {!hasIssues ? (
                <div className="mt-5 rounded-lg border border-primary-fixed-dim/20 bg-primary-fixed-dim/[0.06] px-4 py-3 text-code-sm text-primary-fixed-dim">
                    점검 결과 문제가 없습니다. 바로 출발해도 됩니다.
                </div>
            ) : (
                <div className="mt-5 space-y-3">
                    {diagnostics.map(item => (
                        <DiagnosticRow key={item.id} item={item} />
                    ))}
                </div>
            )}
        </section>
    );
}

function DiagnosticRow({item}: {item: ConfigDiagnostic}) {
    return (
        <div className="flex gap-3 rounded-lg border border-white/[0.06] bg-surface-container-lowest px-4 py-3">
            <div className="pt-0.5">
                <Icon
                    name={iconForLevel(item.level)}
                    className={`text-[18px] ${colorForLevel(item.level)}`}
                />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={toneForLevel(item.level)}>{item.level}</Badge>
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                        {item.platform}
                    </span>
                </div>
                <div className="mt-2 text-code-sm text-on-surface">{item.title}</div>
                <p className="mt-1 text-[12px] leading-relaxed text-on-surface-variant">
                    {item.detail}
                </p>
            </div>
        </div>
    );
}

function toneForLevel(level: DiagnosticLevel): "danger" | "warn" | "info" {
    if (level === "error") return "danger";
    if (level === "warning") return "warn";
    return "info";
}

function iconForLevel(level: DiagnosticLevel): string {
    if (level === "error") return "error";
    if (level === "warning") return "warning";
    return "info";
}

function colorForLevel(level: DiagnosticLevel): string {
    if (level === "error") return "text-error";
    if (level === "warning") return "text-tertiary-fixed-dim";
    return "text-secondary-fixed-dim";
}
