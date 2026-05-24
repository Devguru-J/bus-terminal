/**
 * Export 페이지의 플랫폼 선택 로직 (순수 함수).
 *
 * 핵심 안전 규칙:
 *   "수정된 플랫폼만 기본 선택" — 미수정 플랫폼을 자동으로 체크하지 않는다.
 *   미수정 fallback으로 전체 체크를 하면 손도 안 댄 설정 파일이 다운로드되어
 *   사용자의 기존 dotfiles가 의도치 않게 덮어쓰일 위험이 있다.
 */

export type ExportPlatform =
    | "ghostty"
    | "warp"
    | "iterm2"
    | "neovim"
    | "helix"
    | "zsh"
    | "tmux";

export const EXPORT_PLATFORMS: readonly ExportPlatform[] = [
    "ghostty",
    "warp",
    "iterm2",
    "neovim",
    "helix",
    "zsh",
    "tmux"
] as const;

/**
 * 초기 선택 상태를 계산.
 * - 수정된 플랫폼은 체크
 * - 미수정 플랫폼은 체크하지 않음 (fallback도 없음)
 * - 모두 미수정이면 전체가 false → 빈 상태 UX로 처리해야 함
 */
export function computeInitialSelection(
    modified: Record<ExportPlatform, boolean>
): Record<ExportPlatform, boolean> {
    const init = {} as Record<ExportPlatform, boolean>;
    for (const p of EXPORT_PLATFORMS) {
        init[p] = Boolean(modified[p]);
    }
    return init;
}

/** 선택된 플랫폼 수 */
export function countSelected(selected: Record<ExportPlatform, boolean>): number {
    let n = 0;
    for (const p of EXPORT_PLATFORMS) if (selected[p]) n++;
    return n;
}

/** 미수정 + 미선택 → 빈 상태인지 */
export function isExportEmpty(
    modified: Record<ExportPlatform, boolean>,
    selected: Record<ExportPlatform, boolean>
): boolean {
    return countSelected(selected) === 0 && !Object.values(modified).some(Boolean);
}

/** 모든 플랫폼 체크 */
export function selectAllPlatforms(): Record<ExportPlatform, boolean> {
    const next = {} as Record<ExportPlatform, boolean>;
    for (const p of EXPORT_PLATFORMS) next[p] = true;
    return next;
}

/** 모든 플랫폼 해제 */
export function selectNoPlatforms(): Record<ExportPlatform, boolean> {
    const next = {} as Record<ExportPlatform, boolean>;
    for (const p of EXPORT_PLATFORMS) next[p] = false;
    return next;
}
