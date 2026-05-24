import {useMemo, useState} from "react";
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
import {ghosttyDefaults, PALETTE_DEFAULT} from "@/data/ghosttySchema";
import {tmuxStatusDefault} from "@/data/tmux";
import {nvimDefault} from "@/data/neovim";
import {zshDefault} from "@/data/zsh";
import {helixDefault} from "@/data/helix";
import {iterm2Default} from "@/data/iterm2";
import {warpDefault} from "@/data/warp";
import {downloadText} from "@/lib/download";
import {
    runConfigDiagnostics,
    summarizeDiagnostics,
    type ConfigDiagnostic,
    type DiagnosticLevel
} from "@/lib/diagnostics";
import {toast} from "@/stores/toastStore";
import {cn} from "@/lib/utils";

type Platform = "ghostty" | "warp" | "iterm2" | "neovim" | "helix" | "zsh" | "tmux";

interface PlatformMeta {
    id: Platform;
    label: string;
    summaryLabel: string;
    files: Array<{name: string; getter: () => string; optional?: boolean}>;
    targetPath: string;
}

export function ExportPage() {
    const navigate = useNavigate();

    // ---- 스토어 구독 ----
    const ghosttyConfig = useGhosttyStore(s => s.config);
    const ghosttyPalette = useGhosttyStore(s => s.palette);
    const ghosttyKeybinds = useGhosttyStore(s => s.keybinds);
    const ghostty = useGhosttyStore(s => s.exportText)();
    const tmuxConfig = useTmuxStore(s => s.config);
    const tmux = useTmuxStore(s => s.exportText)();
    const nvimConfig = useNeovimStore(s => s.config);
    const nvim = useNeovimStore(s => s.exportText)();
    const zshConfig = useZshStore(s => s.config);
    const zsh = useZshStore(s => s.exportText)();
    const starship = useZshStore(s => s.exportStarshipText)();
    const helixConfig = useHelixStore(s => s.config);
    const helix = useHelixStore(s => s.exportText)();
    const helixLanguages = useHelixStore(s => s.exportLanguagesText)();
    const itermProfile = useIterm2Store(s => s.profile);
    const itermColors = useIterm2Store(s => s.exportColors)();
    const itermProfileJson = useIterm2Store(s => s.exportProfile)();
    const warpConfig = useWarpStore(s => s.config);
    const warpTheme = useWarpStore(s => s.exportTheme)();
    const warpWorkflows = useWarpStore(s => s.exportWorkflows)();
    const warpSettings = useWarpStore(s => s.exportSettings)();

    // ---- 수정 여부 감지 (config 객체 비교) ----
    const modified: Record<Platform, boolean> = useMemo(
        () => ({
            ghostty:
                JSON.stringify(ghosttyConfig) !== JSON.stringify(ghosttyDefaults()) ||
                JSON.stringify(ghosttyPalette) !== JSON.stringify(PALETTE_DEFAULT) ||
                ghosttyKeybinds.length > 0,
            warp: JSON.stringify(warpConfig) !== JSON.stringify(warpDefault),
            iterm2: JSON.stringify(itermProfile) !== JSON.stringify(iterm2Default),
            neovim: JSON.stringify(nvimConfig) !== JSON.stringify(nvimDefault),
            helix: JSON.stringify(helixConfig) !== JSON.stringify(helixDefault),
            zsh: JSON.stringify(zshConfig) !== JSON.stringify(zshDefault),
            tmux: JSON.stringify(tmuxConfig) !== JSON.stringify(tmuxStatusDefault)
        }),
        [
            ghosttyConfig,
            ghosttyPalette,
            ghosttyKeybinds,
            warpConfig,
            itermProfile,
            nvimConfig,
            helixConfig,
            zshConfig,
            tmuxConfig
        ]
    );

    // ---- 플랫폼별 메타데이터 (파일 목록, 라벨, 경로) ----
    const META: PlatformMeta[] = [
        {
            id: "ghostty",
            label: "Ghostty",
            summaryLabel: "Platform",
            targetPath: "~/.config/ghostty/config",
            files: [{name: "ghostty-config", getter: () => ghostty}]
        },
        {
            id: "warp",
            label: "Warp",
            summaryLabel: "Warp (macOS)",
            targetPath: "~/.warp/themes/",
            files: [
                {name: "warp-theme.yaml", getter: () => warpTheme},
                {name: "warp-workflows.yaml", getter: () => warpWorkflows, optional: true},
                {name: "warp-settings.yaml", getter: () => warpSettings}
            ]
        },
        {
            id: "iterm2",
            label: "iTerm2",
            summaryLabel: "iTerm2 (macOS)",
            targetPath: "~/Library/Application Support/iTerm2/DynamicProfiles/",
            files: [
                {name: "BusTerminal.itermcolors", getter: () => itermColors},
                {name: "BusTerminal.profile.json", getter: () => itermProfileJson}
            ]
        },
        {
            id: "neovim",
            label: "Neovim",
            summaryLabel: "Editor",
            targetPath: "~/.config/nvim/init.lua",
            files: [{name: "init.lua", getter: () => nvim}]
        },
        {
            id: "helix",
            label: "Helix",
            summaryLabel: "Editor",
            targetPath: "~/.config/helix/",
            files: [
                {name: "helix-config.toml", getter: () => helix},
                {name: "helix-languages.toml", getter: () => helixLanguages, optional: true}
            ]
        },
        {
            id: "zsh",
            label: "Zsh",
            summaryLabel: "Shell",
            targetPath: "~/.zshrc",
            files: [
                {name: ".zshrc", getter: () => zsh},
                {name: "starship.toml", getter: () => starship, optional: true}
            ]
        },
        {
            id: "tmux",
            label: "tmux",
            summaryLabel: "Multiplexer",
            targetPath: "~/.tmux.conf",
            files: [{name: ".tmux.conf", getter: () => tmux}]
        }
    ];

    // ---- 선택 상태: 수정된 것만 초기 체크. 모두 미수정이면 전체 체크. ----
    const initialSelected = useMemo<Record<Platform, boolean>>(() => {
        const anyModified = Object.values(modified).some(Boolean);
        const init: Record<Platform, boolean> = {} as Record<Platform, boolean>;
        for (const p of META) {
            init[p.id] = anyModified ? modified[p.id] : true;
        }
        return init;
        // META는 클로저로 한 번만 평가됨 — 의존성 누락 경고 회피
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modified.ghostty, modified.warp, modified.iterm2, modified.neovim, modified.helix, modified.zsh, modified.tmux]);

    const [selected, setSelected] = useState<Record<Platform, boolean>>(initialSelected);

    // initialSelected가 바뀌면 (페이지 첫 진입 시 등) 동기화
    const [syncKey, setSyncKey] = useState("");
    const stamp = Object.entries(initialSelected).map(([k, v]) => `${k}:${v ? "1" : "0"}`).join("|");
    if (stamp !== syncKey) {
        setSelected(initialSelected);
        setSyncKey(stamp);
    }

    function toggle(id: Platform) {
        setSelected(s => ({...s, [id]: !s[id]}));
    }
    function selectModified() {
        const next: Record<Platform, boolean> = {} as Record<Platform, boolean>;
        for (const p of META) next[p.id] = modified[p.id];
        setSelected(next);
    }
    function selectAll() {
        const next: Record<Platform, boolean> = {} as Record<Platform, boolean>;
        for (const p of META) next[p.id] = true;
        setSelected(next);
    }
    function selectNone() {
        const next: Record<Platform, boolean> = {} as Record<Platform, boolean>;
        for (const p of META) next[p.id] = false;
        setSelected(next);
    }

    // ---- 선택된 파일 ----
    function collectFiles(): Array<[string, string]> {
        const out: Array<[string, string]> = [];
        for (const p of META) {
            if (!selected[p.id]) continue;
            for (const f of p.files) {
                const content = f.getter();
                if (f.optional && !content) continue;
                out.push([f.name, content]);
            }
        }
        return out;
    }

    const selectedCount = META.filter(p => selected[p.id]).length;
    const fileList = useMemo(collectFiles, [selected, ghostty, tmux, nvim, zsh, starship, helix, helixLanguages, itermColors, itermProfileJson, warpTheme, warpWorkflows, warpSettings]);

    const diagnostics = runConfigDiagnostics({
        ghostty: {config: ghosttyConfig, keybinds: ghosttyKeybinds},
        tmux: tmuxConfig,
        neovim: nvimConfig,
        zsh: zshConfig
    });
    const summary = summarizeDiagnostics(diagnostics);

    // ---- DepartureComplete 요약 (선택된 것만) ----
    const heroSummary = META.filter(p => selected[p.id]).map(p => ({
        label: p.summaryLabel,
        value: p.label
    }));

    function handleDownload() {
        if (selectedCount === 0 || fileList.length === 0) {
            toast("선택된 플랫폼이 없어요. 하나 이상 골라주세요.", "warn");
            return;
        }
        fileList.forEach(([name, content], i) =>
            setTimeout(() => downloadText(name, content), i * 150)
        );
        toast(
            `${selectedCount}개 플랫폼 · ${fileList.length}개 설정 파일이 도착했어요.`,
            "success"
        );
    }

    function handleInstallScript() {
        if (selectedCount === 0) {
            toast("선택된 플랫폼이 없어요.", "warn");
            return;
        }
        const script = buildInstallScript(META, selected, {
            ghostty,
            tmux,
            nvim,
            zsh,
            starship,
            helix,
            helixLanguages,
            itermColors,
            itermProfile: itermProfileJson,
            warpTheme,
            warpWorkflows,
            warpSettings
        });
        downloadText("bus-terminal-install.sh", script);
        toast(`${selectedCount}개 플랫폼 대상 설치 스크립트를 다운로드했어요.`, "success");
    }

    return (
        <div className="max-w-5xl mx-auto py-6 space-y-8">
            <DepartureComplete
                summary={
                    heroSummary.length > 0
                        ? heroSummary
                        : [{label: "선택", value: "비어 있음"}]
                }
                onDownload={handleDownload}
                onReturn={() => navigate("/ghostty")}
                downloadLabel={
                    selectedCount === 0
                        ? "플랫폼을 선택하세요"
                        : `${selectedCount}개 플랫폼 설정 다운로드`
                }
                downloadDisabled={selectedCount === 0}
            />

            <PlatformSelector
                meta={META}
                selected={selected}
                modified={modified}
                onToggle={toggle}
                onSelectModified={selectModified}
                onSelectAll={selectAll}
                onSelectNone={selectNone}
                fileList={fileList}
            />

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={handleInstallScript}
                    disabled={selectedCount === 0}
                >
                    <Icon name="terminal" className="text-[16px]" />
                    설치 스크립트 다운로드
                </Button>
                <span className="font-mono text-[11px] text-on-surface-variant">
                    스크립트는 선택한 {selectedCount}개 플랫폼만 처리합니다
                </span>
            </div>

            <DiagnosticsPanel diagnostics={diagnostics} summary={summary} />
        </div>
    );
}

function PlatformSelector({
    meta,
    selected,
    modified,
    onToggle,
    onSelectModified,
    onSelectAll,
    onSelectNone,
    fileList
}: {
    meta: PlatformMeta[];
    selected: Record<Platform, boolean>;
    modified: Record<Platform, boolean>;
    onToggle: (id: Platform) => void;
    onSelectModified: () => void;
    onSelectAll: () => void;
    onSelectNone: () => void;
    fileList: Array<[string, string]>;
}) {
    return (
        <section className="rounded-xl border border-white/[0.06] bg-surface-container-low/60 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                    <div className="font-mono text-label-xs uppercase tracking-[0.16em] text-primary-fixed-dim">
                        다운로드 대상 선택
                    </div>
                    <p className="mt-1 text-body-md text-on-surface-variant">
                        받고 싶은 플랫폼만 골라요. <strong className="text-on-surface">수정한 것만 자동 선택</strong>됩니다.
                    </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    <QuickChip onClick={onSelectModified} icon="auto_fix_high" label="수정된 것만" />
                    <QuickChip onClick={onSelectAll} icon="select_all" label="전체" />
                    <QuickChip onClick={onSelectNone} icon="deselect" label="해제" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {meta.map(p => (
                    <PlatformTile
                        key={p.id}
                        meta={p}
                        checked={selected[p.id]}
                        modified={modified[p.id]}
                        onToggle={() => onToggle(p.id)}
                    />
                ))}
            </div>

            {fileList.length > 0 && (
                <details className="mt-4 rounded-lg border border-white/[0.05] bg-surface-container-lowest/80 p-3">
                    <summary className="cursor-pointer font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant">
                        다운로드 예정 파일 {fileList.length}개 보기
                    </summary>
                    <ul className="mt-2 space-y-0.5 font-mono text-[11px] text-on-surface-variant">
                        {fileList.map(([name]) => (
                            <li key={name}>· {name}</li>
                        ))}
                    </ul>
                </details>
            )}
        </section>
    );
}

function PlatformTile({
    meta,
    checked,
    modified,
    onToggle
}: {
    meta: PlatformMeta;
    checked: boolean;
    modified: boolean;
    onToggle: () => void;
}) {
    const fileCount = meta.files.filter(f => !f.optional || f.getter()).length;
    return (
        <label
            className={cn(
                "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition select-none",
                checked
                    ? "border-primary-fixed-dim/50 bg-primary-fixed-dim/[0.05]"
                    : "border-white/[0.06] bg-surface-container-lowest/60 hover:border-white/15"
            )}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={onToggle}
                className="mt-1 h-4 w-4 accent-primary-fixed-dim shrink-0"
                aria-label={`${meta.label} 선택`}
            />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display text-title-md text-on-surface">
                        {meta.label}
                    </span>
                    {modified ? (
                        <Badge tone="active">수정됨</Badge>
                    ) : (
                        <Badge tone="muted">기본값</Badge>
                    )}
                </div>
                <div className="font-mono text-[10px] text-on-surface-variant/70 mt-1 truncate">
                    {meta.targetPath}
                </div>
                <div className="font-mono text-[10px] text-on-surface-variant mt-0.5">
                    {fileCount}개 파일
                </div>
            </div>
        </label>
    );
}

function QuickChip({
    onClick,
    icon,
    label
}: {
    onClick: () => void;
    icon: string;
    label: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant hover:border-white/25 hover:text-on-surface transition"
        >
            <Icon name={icon} className="text-[14px]" />
            {label}
        </button>
    );
}

function buildInstallScript(
    meta: PlatformMeta[],
    selected: Record<Platform, boolean>,
    files: {
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
    }
): string {
    const writes: string[] = [];
    const guard = (id: Platform, line: string) =>
        `[[ -z "$ONLY" || "$ONLY" == "${id}" ]] && ${line}`;

    if (selected.ghostty) {
        writes.push(guard("ghostty", `write_file "$HOME/.config/ghostty/config" ${shellString(files.ghostty)}`));
    }
    if (selected.tmux) {
        writes.push(guard("tmux", `write_file "$HOME/.tmux.conf" ${shellString(files.tmux)}`));
    }
    if (selected.neovim) {
        writes.push(guard("neovim", `write_file "$HOME/.config/nvim/init.lua" ${shellString(files.nvim)}`));
    }
    if (selected.zsh) {
        writes.push(guard("zsh", `write_file "$HOME/.zshrc" ${shellString(files.zsh)}`));
        if (files.starship) {
            writes.push(guard("zsh", `write_file "$HOME/.config/starship.toml" ${shellString(files.starship)}`));
        }
    }
    if (selected.helix) {
        writes.push(guard("helix", `write_file "$HOME/.config/helix/config.toml" ${shellString(files.helix)}`));
        if (files.helixLanguages) {
            writes.push(guard("helix", `write_file "$HOME/.config/helix/languages.toml" ${shellString(files.helixLanguages)}`));
        }
    }
    if (selected.iterm2) {
        writes.push(guard("iterm2", `write_file "$HOME/Library/Application Support/iTerm2/DynamicProfiles/BusTerminal.json" ${shellString(files.itermProfile)}`));
        writes.push(guard("iterm2", `write_file "$HOME/Downloads/BusTerminal.itermcolors" ${shellString(files.itermColors)}`));
    }
    if (selected.warp) {
        writes.push(guard("warp", `write_file "$HOME/.warp/themes/bus-terminal.yaml" ${shellString(files.warpTheme)}`));
        if (files.warpWorkflows) {
            writes.push(guard("warp", `write_file "$HOME/.warp/workflows/bus-terminal.yaml" ${shellString(files.warpWorkflows)}`));
        }
        writes.push(guard("warp", `write_file "$HOME/.warp/bus-terminal-settings.yaml" ${shellString(files.warpSettings)}`));
    }

    const targetList = meta.filter(p => selected[p.id]).map(p => p.label).join(" + ") || "(none)";

    return `#!/usr/bin/env bash
# 버스터미널 설치 스크립트
# 대상 플랫폼: ${targetList}
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

${writes.join("\n")}
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
