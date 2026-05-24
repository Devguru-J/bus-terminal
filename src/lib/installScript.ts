/**
 * 설치 스크립트 빌더 + shell escaping 헬퍼.
 *
 * 보안 경계: 사용자가 만든 설정 텍스트를 bash `$'...'` (ANSI-C 인용)으로 임베드한다.
 * 작은따옴표·백슬래시·줄바꿈·캐리지리턴이 모두 안전하게 이스케이프되어야 한다.
 * 잘못 이스케이프하면 사용자 입력이 shell command로 빠져나갈 수 있다.
 */

import type {ExportPlatform} from "./exportSelection";

/**
 * bash `$'...'` (ANSI-C quoting) 안에 안전하게 박을 문자열로 변환.
 *
 * 처리 순서가 중요:
 *   1) 백슬래시를 먼저 (이후 추가되는 백슬래시가 다시 이중 이스케이프되지 않게)
 *   2) 작은따옴표
 *   3) 줄바꿈 → \n
 *   4) 캐리지리턴 → 제거 (\r 우회용)
 *
 * 반환값은 `$'...'` 형태 — 그대로 명령줄에 붙여 쓸 수 있다.
 */
export function shellSingleQuoteEscape(value: string): string {
    const escaped = value
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "");
    return `$'${escaped}'`;
}

export interface BuildInstallScriptInput {
    selected: Record<ExportPlatform, boolean>;
    labels: Record<ExportPlatform, string>;
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

export function buildInstallScript(input: BuildInstallScriptInput): string {
    const {selected, labels} = input;
    const writes: string[] = [];
    const guard = (id: ExportPlatform, line: string) =>
        `[[ -z "$ONLY" || "$ONLY" == "${id}" ]] && ${line}`;

    if (selected.ghostty) {
        writes.push(
            guard("ghostty", `write_file "$HOME/.config/ghostty/config" ${shellSingleQuoteEscape(input.ghostty)}`)
        );
    }
    if (selected.tmux) {
        writes.push(
            guard("tmux", `write_file "$HOME/.tmux.conf" ${shellSingleQuoteEscape(input.tmux)}`)
        );
    }
    if (selected.neovim) {
        writes.push(
            guard("neovim", `write_file "$HOME/.config/nvim/init.lua" ${shellSingleQuoteEscape(input.nvim)}`)
        );
    }
    if (selected.zsh) {
        writes.push(
            guard("zsh", `write_file "$HOME/.zshrc" ${shellSingleQuoteEscape(input.zsh)}`)
        );
        if (input.starship) {
            writes.push(
                guard("zsh", `write_file "$HOME/.config/starship.toml" ${shellSingleQuoteEscape(input.starship)}`)
            );
        }
    }
    if (selected.helix) {
        writes.push(
            guard("helix", `write_file "$HOME/.config/helix/config.toml" ${shellSingleQuoteEscape(input.helix)}`)
        );
        if (input.helixLanguages) {
            writes.push(
                guard("helix", `write_file "$HOME/.config/helix/languages.toml" ${shellSingleQuoteEscape(input.helixLanguages)}`)
            );
        }
    }
    if (selected.iterm2) {
        writes.push(
            guard("iterm2", `write_file "$HOME/Library/Application Support/iTerm2/DynamicProfiles/BusTerminal.json" ${shellSingleQuoteEscape(input.itermProfile)}`)
        );
        writes.push(
            guard("iterm2", `write_file "$HOME/Downloads/BusTerminal.itermcolors" ${shellSingleQuoteEscape(input.itermColors)}`)
        );
    }
    if (selected.warp) {
        writes.push(
            guard("warp", `write_file "$HOME/.warp/themes/bus-terminal.yaml" ${shellSingleQuoteEscape(input.warpTheme)}`)
        );
        if (input.warpWorkflows) {
            writes.push(
                guard("warp", `write_file "$HOME/.warp/workflows/bus-terminal.yaml" ${shellSingleQuoteEscape(input.warpWorkflows)}`)
            );
        }
        writes.push(
            guard("warp", `write_file "$HOME/.warp/bus-terminal-settings.yaml" ${shellSingleQuoteEscape(input.warpSettings)}`)
        );
    }

    const targetList =
        (["ghostty", "warp", "iterm2", "neovim", "helix", "zsh", "tmux"] as ExportPlatform[])
            .filter(p => selected[p])
            .map(p => labels[p] ?? p)
            .join(" + ") || "(none)";

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
