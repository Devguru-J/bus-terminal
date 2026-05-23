/**
 * tmux 승강장: 상태바 + 플러그인.
 * 초보자에겐 ~/.tmux.conf 통째로 보여주는 것보다 "조합형 카드"가 직관적.
 */

export interface TmuxPlugin {
    id: string;
    ko: string;
    name: string; // tpm plugin path
    desc: string;
}

export const tmuxPlugins: TmuxPlugin[] = [
    {id: "tpm", ko: "TPM (플러그인 매니저)", name: "tmux-plugins/tpm", desc: "다른 플러그인을 설치/갱신하기 위한 기본 매니저."},
    {id: "sensible", ko: "기본값 합리화", name: "tmux-plugins/tmux-sensible", desc: "거의 모든 사람이 동의하는 기본 옵션을 켭니다."},
    {id: "yank", ko: "복사하기 강화", name: "tmux-plugins/tmux-yank", desc: "시스템 클립보드와 연동된 복사."},
    {id: "resurrect", ko: "세션 복원", name: "tmux-plugins/tmux-resurrect", desc: "재부팅 후에도 세션을 그대로 살립니다."},
    {id: "continuum", ko: "세션 자동저장", name: "tmux-plugins/tmux-continuum", desc: "주기적으로 세션을 자동 저장."},
    {id: "catppuccin", ko: "카푸치노 테마", name: "catppuccin/tmux", desc: "상태바 카푸치노 테마."},
    {id: "battery", ko: "배터리 표시", name: "tmux-plugins/tmux-battery", desc: "상태바에 배터리 잔량 표시."}
];

export interface TmuxStatusConfig {
    prefix: string; // 예: "C-a"
    mouse: boolean;
    baseIndex: number; // 0 or 1
    statusInterval: number; // status-bar 갱신 주기(초)
    statusPosition: "top" | "bottom";
    statusStyle: string; // fg=...,bg=...
    leftSegments: string[];
    rightSegments: string[];
    plugins: string[]; // selected plugin ids
}

/**
 * 진짜 tmux 기본값 (`man tmux` 기준).
 * - prefix C-b, mouse off, base-index 0, status bottom, status-interval 15
 * - 상태바: 검정 글씨 + 녹색 배경 (tmux의 트레이드마크)
 * - 좌측: [#S] (세션명), 우측: "%H:%M %d-%b-%y"
 * - 플러그인: 없음 (TPM 미설치 상태)
 */
export const tmuxStatusDefault: TmuxStatusConfig = {
    prefix: "C-b",
    mouse: false,
    baseIndex: 0,
    statusInterval: 15,
    statusPosition: "bottom",
    statusStyle: "fg=black,bg=green",
    leftSegments: ["[#S] "],
    rightSegments: ["%H:%M %d-%b-%y"],
    plugins: []
};

export function serializeTmuxConf(c: TmuxStatusConfig): string {
    const lines: string[] = [];
    lines.push("# 버스터미널에서 출발한 tmux 설정");
    lines.push(`# generated ${new Date().toISOString()}`);
    lines.push("");
    lines.push("# === 기본 ===");
    lines.push("unbind C-b");
    lines.push(`set -g prefix ${c.prefix}`);
    lines.push(`bind ${c.prefix} send-prefix`);
    lines.push(`set -g mouse ${c.mouse ? "on" : "off"}`);
    lines.push(`set -g base-index ${c.baseIndex}`);
    lines.push("setw -g pane-base-index 1");
    lines.push(`set -g status-interval ${c.statusInterval}`);
    lines.push("set -g renumber-windows on");
    lines.push("set -g escape-time 10");
    lines.push("");
    lines.push("# === 상태바 ===");
    lines.push(`set -g status-position ${c.statusPosition}`);
    lines.push(`set -g status-style "${c.statusStyle}"`);
    lines.push(`set -g status-left "${c.leftSegments.join("")}"`);
    lines.push(`set -g status-right "${c.rightSegments.join("")}"`);
    lines.push("set -g status-left-length 60");
    lines.push("set -g status-right-length 80");
    lines.push("");

    const pluginObjects = tmuxPlugins.filter(p => c.plugins.includes(p.id));
    if (pluginObjects.length) {
        lines.push("# === 플러그인 (TPM) ===");
        for (const p of pluginObjects) {
            if (p.id === "tpm") continue;
            lines.push(`set -g @plugin '${p.name}'`);
        }
        lines.push("set -g @plugin 'tmux-plugins/tpm'");
        lines.push("run '~/.tmux/plugins/tpm/tpm'");
    }
    return lines.join("\n") + "\n";
}
