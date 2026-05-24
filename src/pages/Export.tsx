import {useEffect, useMemo, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {DepartureComplete} from "@/components/export/DepartureComplete";
import {Badge} from "@/components/ui/Badge";
import {Icon} from "@/components/ui/Icon";
import {Button} from "@/components/ui/Button";
import {StationHeader} from "@/components/shell/StationHeader";
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
import {PageGuideCard} from "@/components/shell/PageGuideCard";
import {
    computeInitialSelection,
    countSelected,
    selectAllPlatforms,
    selectNoPlatforms,
    type ExportPlatform
} from "@/lib/exportSelection";
import {buildInstallScript, shellSingleQuoteEscape} from "@/lib/installScript";

type Platform = ExportPlatform;

interface PlatformMeta {
    id: Platform;
    label: string;
    files: Array<{name: string; getter: () => string; optional?: boolean}>;
    targetPath: string;
    /** 초보자용 한 줄 설명 */
    blurb: string;
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

    const META: PlatformMeta[] = [
        {
            id: "ghostty",
            label: "Ghostty",
            targetPath: "~/.config/ghostty/config",
            blurb: "Ghostty 터미널 앱의 폰트·색·창 패딩 등 외관 설정",
            files: [{name: "ghostty-config", getter: () => ghostty}]
        },
        {
            id: "warp",
            label: "Warp",
            targetPath: "~/.warp/themes/",
            blurb: "Warp 터미널의 테마·워크플로우·AI 설정",
            files: [
                {name: "warp-theme.yaml", getter: () => warpTheme},
                {name: "warp-workflows.yaml", getter: () => warpWorkflows, optional: true},
                {name: "warp-settings.yaml", getter: () => warpSettings}
            ]
        },
        {
            id: "iterm2",
            label: "iTerm2",
            targetPath: "~/Library/Application Support/iTerm2/...",
            blurb: "iTerm2 컬러 프리셋과 프로파일 (macOS 전용)",
            files: [
                {name: "BusTerminal.itermcolors", getter: () => itermColors},
                {name: "BusTerminal.profile.json", getter: () => itermProfileJson}
            ]
        },
        {
            id: "neovim",
            label: "Neovim",
            targetPath: "~/.config/nvim/init.lua",
            blurb: "Neovim 옵션·플러그인·키맵을 담은 init.lua",
            files: [{name: "init.lua", getter: () => nvim}]
        },
        {
            id: "helix",
            label: "Helix",
            targetPath: "~/.config/helix/",
            blurb: "Helix 에디터의 theme·statusline·LSP 설정",
            files: [
                {name: "helix-config.toml", getter: () => helix},
                {name: "helix-languages.toml", getter: () => helixLanguages, optional: true}
            ]
        },
        {
            id: "zsh",
            label: "Zsh",
            targetPath: "~/.zshrc",
            blurb: "Zsh 프롬프트·alias·플러그인·환경변수",
            files: [
                {name: ".zshrc", getter: () => zsh},
                {name: "starship.toml", getter: () => starship, optional: true}
            ]
        },
        {
            id: "tmux",
            label: "tmux",
            targetPath: "~/.tmux.conf",
            blurb: "tmux 상태바·키바인딩·플러그인",
            files: [{name: ".tmux.conf", getter: () => tmux}]
        }
    ];

    // 초기 선택 — 수정된 플랫폼만 (fallback 없음 — 위험)
    const initialSelected = useMemo(() => computeInitialSelection(modified), [modified]);
    const [selected, setSelected] = useState<Record<Platform, boolean>>(initialSelected);

    // modified가 바뀌면 선택 상태도 자동 동기화 (render 중이 아닌 effect로)
    const stamp = useMemo(
        () => Object.entries(initialSelected).map(([k, v]) => `${k}:${v ? "1" : "0"}`).join("|"),
        [initialSelected]
    );
    useEffect(() => {
        setSelected(initialSelected);
        // initialSelected 객체는 매 렌더 새로 만들어지므로 stamp 문자열로 의존성 안정화
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stamp]);

    function toggle(id: Platform) {
        setSelected(s => ({...s, [id]: !s[id]}));
    }
    function selectModifiedOnly() {
        setSelected(computeInitialSelection(modified));
    }
    function selectAll() {
        setSelected(selectAllPlatforms());
    }
    function selectNone() {
        setSelected(selectNoPlatforms());
    }

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

    const selectedCount = countSelected(selected);
    const anyModified = Object.values(modified).some(Boolean);
    const fileList = useMemo(collectFiles, [selected, ghostty, tmux, nvim, zsh, starship, helix, helixLanguages, itermColors, itermProfileJson, warpTheme, warpWorkflows, warpSettings]);

    const diagnostics = runConfigDiagnostics({
        ghostty: {config: ghosttyConfig, keybinds: ghosttyKeybinds},
        tmux: tmuxConfig,
        neovim: nvimConfig,
        zsh: zshConfig
    });
    const summary = summarizeDiagnostics(diagnostics);

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
        const script = buildInstallScript({
            selected,
            labels: Object.fromEntries(META.map(p => [p.id, p.label])) as Record<Platform, string>,
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

    // === 빈 상태 — 아무것도 수정되지 않은 경우 ===
    if (!anyModified) {
        return (
            <div className="max-w-3xl mx-auto py-6 space-y-6">
                <StationHeader
                    title="출발권 만들기"
                    eyebrow="Departure"
                    subtitle="아직 다운로드할 설정이 없어요."
                />
                <EmptyExportState />
                <DiagnosticsPanel diagnostics={diagnostics} summary={summary} />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-6 space-y-8">
            <PageGuideCard
                storageKey="bus-terminal:guide-card-export"
                title="출발권 만들기"
                steps={[
                    {title: "1. 다운로드 대상 확인", detail: "수정한 도구만 자동 체크되어 있음"},
                    {title: "2. 필요하면 직접 추가/해제", detail: "체크박스로 자유롭게 조정"},
                    {title: "3. 다운로드", detail: "선택한 도구의 설정 파일만 받아짐"}
                ]}
            />
            <DepartureComplete
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
                onSelectModified={selectModifiedOnly}
                onSelectAll={selectAll}
                onSelectNone={selectNone}
                fileList={fileList}
            />

            <AdvancedInstall
                selectedCount={selectedCount}
                onDownload={handleInstallScript}
            />

            <DiagnosticsPanel diagnostics={diagnostics} summary={summary} />
        </div>
    );
}

function EmptyExportState() {
    return (
        <div className="rounded-xl border border-white/[0.06] bg-surface-container-lowest/80 p-8 text-center space-y-5">
            <Icon name="luggage" className="text-[44px] text-on-surface-variant/50" />
            <div>
                <h2 className="font-display text-headline-sm text-on-surface">
                    아직 변경된 설정이 없어요
                </h2>
                <p className="mt-2 text-body-md text-on-surface-variant">
                    먼저 승강장에서 설정을 만져야 다운로드할 파일이 생겨요. 가장 많이 쓰는 순서는 Ghostty → 테마 센터 → 폰트 센터입니다.
                </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
                <Link to="/ghostty">
                    <Button size="sm">
                        <Icon name="play_arrow" className="text-[14px]" />
                        Ghostty 승강장
                    </Button>
                </Link>
                <Link to="/themes">
                    <Button variant="outline" size="sm">
                        <Icon name="palette" className="text-[14px]" />
                        테마 센터
                    </Button>
                </Link>
                <Link to="/fonts">
                    <Button variant="outline" size="sm">
                        <Icon name="text_fields" className="text-[14px]" />
                        폰트 센터
                    </Button>
                </Link>
                <Link to="/guide">
                    <Button variant="outline" size="sm">
                        <Icon name="help" className="text-[14px]" />
                        사용 안내
                    </Button>
                </Link>
            </div>
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
                <p className="text-[11px] text-on-surface-variant mt-1">
                    {meta.blurb}
                </p>
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

function AdvancedInstall({
    selectedCount,
    onDownload
}: {
    selectedCount: number;
    onDownload: () => void;
}) {
    return (
        <details className="rounded-xl border border-tertiary-fixed-dim/20 bg-tertiary-fixed-dim/[0.04] overflow-hidden">
            <summary className="cursor-pointer px-5 py-3 flex items-center gap-2 select-none">
                <Icon name="terminal" className="text-[16px] text-tertiary-fixed-dim" />
                <span className="font-mono text-label-xs uppercase tracking-[0.14em] text-tertiary-fixed-dim">
                    고급 · 설치 스크립트 (위험)
                </span>
                <span className="ml-auto text-[11px] text-on-surface-variant">펼쳐서 확인</span>
            </summary>
            <div className="px-5 py-4 space-y-3 border-t border-tertiary-fixed-dim/20">
                <p className="text-body-md text-on-surface">
                    설치 스크립트는 <strong className="text-tertiary-fixed-dim">홈 디렉토리의 기존 설정 파일을 덮어씁니다</strong>.
                    실행 전 반드시 한 번 더 확인하세요.
                </p>
                <ul className="text-[12px] text-on-surface-variant space-y-1 list-disc list-inside">
                    <li>
                        먼저 <code className="font-mono text-primary-fixed-dim">--dry-run</code> 옵션으로 실제 쓰기 없이 미리보기:
                        <code className="font-mono text-on-surface ml-1">bash bus-terminal-install.sh --dry-run</code>
                    </li>
                    <li>
                        기본적으로 기존 파일은 <code className="font-mono">.bak.YYYYMMDD...</code> 형태로 자동 백업합니다 (백업 끄려면 <code className="font-mono">--no-backup</code>).
                    </li>
                    <li>
                        특정 플랫폼만 적용하려면 <code className="font-mono text-on-surface">--only ghostty</code> 같은 식으로 제한.
                    </li>
                    <li>
                        스크립트를 다운로드하면 내용을 <strong>먼저 열어서 무엇을 쓰는지 검토</strong>한 뒤 실행하세요.
                    </li>
                </ul>
                <div className="flex items-center gap-3 flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onDownload}
                        disabled={selectedCount === 0}
                    >
                        <Icon name="terminal" className="text-[14px]" />
                        설치 스크립트 다운로드
                    </Button>
                    <span className="font-mono text-[11px] text-on-surface-variant">
                        선택한 {selectedCount}개 플랫폼만 처리됩니다
                    </span>
                </div>
            </div>
        </details>
    );
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

// Re-export shellSingleQuoteEscape symbol for tests-by-package — not used here, just keeps tree-shaking happy.
export {shellSingleQuoteEscape};
