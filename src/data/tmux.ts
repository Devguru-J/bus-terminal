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

export interface TmuxKeyBinding {
    id: string;
    key: string;
    command: string;
    label: string;
    category: "session" | "window" | "pane" | "copy" | "layout" | "misc" | "custom";
    enabled: boolean;
    builtin: boolean;
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

export const tmuxDefaultKeyBindings: TmuxKeyBinding[] = [
    {id: "send-prefix", key: "C-b", command: "send-prefix", label: "Send prefix to nested tmux", category: "session", enabled: true, builtin: true},
    {id: "new-window", key: "c", command: "new-window", label: "New window", category: "window", enabled: true, builtin: true},
    {id: "rename-window", key: ",", command: "command-prompt -I '#W' 'rename-window -- %%'", label: "Rename window", category: "window", enabled: true, builtin: true},
    {id: "choose-window", key: "w", command: "choose-window", label: "Choose window", category: "window", enabled: true, builtin: true},
    {id: "next-window", key: "n", command: "next-window", label: "Next window", category: "window", enabled: true, builtin: true},
    {id: "previous-window", key: "p", command: "previous-window", label: "Previous window", category: "window", enabled: true, builtin: true},
    {id: "last-window", key: "l", command: "last-window", label: "Last window", category: "window", enabled: true, builtin: true},
    {id: "kill-window", key: "&", command: "confirm-before -p 'kill-window #W? (y/n)' kill-window", label: "Kill window", category: "window", enabled: true, builtin: true},
    {id: "select-window-0", key: "0", command: "select-window -t :=0", label: "Select window 0", category: "window", enabled: true, builtin: true},
    {id: "select-window-1", key: "1", command: "select-window -t :=1", label: "Select window 1", category: "window", enabled: true, builtin: true},
    {id: "select-window-2", key: "2", command: "select-window -t :=2", label: "Select window 2", category: "window", enabled: true, builtin: true},
    {id: "select-window-3", key: "3", command: "select-window -t :=3", label: "Select window 3", category: "window", enabled: true, builtin: true},
    {id: "select-window-4", key: "4", command: "select-window -t :=4", label: "Select window 4", category: "window", enabled: true, builtin: true},
    {id: "select-window-5", key: "5", command: "select-window -t :=5", label: "Select window 5", category: "window", enabled: true, builtin: true},
    {id: "select-window-6", key: "6", command: "select-window -t :=6", label: "Select window 6", category: "window", enabled: true, builtin: true},
    {id: "select-window-7", key: "7", command: "select-window -t :=7", label: "Select window 7", category: "window", enabled: true, builtin: true},
    {id: "select-window-8", key: "8", command: "select-window -t :=8", label: "Select window 8", category: "window", enabled: true, builtin: true},
    {id: "select-window-9", key: "9", command: "select-window -t :=9", label: "Select window 9", category: "window", enabled: true, builtin: true},
    {id: "split-vertical", key: "\"", command: "split-window", label: "Split pane vertically", category: "pane", enabled: true, builtin: true},
    {id: "split-horizontal", key: "%", command: "split-window -h", label: "Split pane horizontally", category: "pane", enabled: true, builtin: true},
    {id: "kill-pane", key: "x", command: "confirm-before -p 'kill-pane #P? (y/n)' kill-pane", label: "Kill pane", category: "pane", enabled: true, builtin: true},
    {id: "next-pane", key: "o", command: "select-pane -t :.+", label: "Next pane", category: "pane", enabled: true, builtin: true},
    {id: "last-pane", key: ";", command: "last-pane", label: "Last pane", category: "pane", enabled: true, builtin: true},
    {id: "pane-up", key: "Up", command: "select-pane -U", label: "Select pane up", category: "pane", enabled: true, builtin: true},
    {id: "pane-down", key: "Down", command: "select-pane -D", label: "Select pane down", category: "pane", enabled: true, builtin: true},
    {id: "pane-left", key: "Left", command: "select-pane -L", label: "Select pane left", category: "pane", enabled: true, builtin: true},
    {id: "pane-right", key: "Right", command: "select-pane -R", label: "Select pane right", category: "pane", enabled: true, builtin: true},
    {id: "resize-up", key: "C-Up", command: "resize-pane -U", label: "Resize pane up", category: "pane", enabled: true, builtin: true},
    {id: "resize-down", key: "C-Down", command: "resize-pane -D", label: "Resize pane down", category: "pane", enabled: true, builtin: true},
    {id: "resize-left", key: "C-Left", command: "resize-pane -L", label: "Resize pane left", category: "pane", enabled: true, builtin: true},
    {id: "resize-right", key: "C-Right", command: "resize-pane -R", label: "Resize pane right", category: "pane", enabled: true, builtin: true},
    {id: "copy-mode", key: "[", command: "copy-mode", label: "Enter copy mode", category: "copy", enabled: true, builtin: true},
    {id: "paste-buffer", key: "]", command: "paste-buffer", label: "Paste buffer", category: "copy", enabled: true, builtin: true},
    {id: "choose-buffer", key: "=", command: "choose-buffer", label: "Choose buffer", category: "copy", enabled: true, builtin: true},
    {id: "list-buffers", key: "#", command: "list-buffers", label: "List buffers", category: "copy", enabled: true, builtin: true},
    {id: "delete-buffer", key: "-", command: "delete-buffer", label: "Delete buffer", category: "copy", enabled: true, builtin: true},
    {id: "detach-client", key: "d", command: "detach-client", label: "Detach client", category: "session", enabled: true, builtin: true},
    {id: "choose-session", key: "s", command: "choose-tree -Zs", label: "Choose session", category: "session", enabled: true, builtin: true},
    {id: "rename-session", key: "$", command: "command-prompt -I '#S' 'rename-session -- %%'", label: "Rename session", category: "session", enabled: true, builtin: true},
    {id: "command-prompt", key: ":", command: "command-prompt", label: "Command prompt", category: "misc", enabled: true, builtin: true},
    {id: "list-keys", key: "?", command: "list-keys", label: "List key bindings", category: "misc", enabled: true, builtin: true},
    {id: "clock-mode", key: "t", command: "clock-mode", label: "Clock mode", category: "misc", enabled: true, builtin: true},
    {id: "refresh-client", key: "R", command: "refresh-client", label: "Refresh client", category: "misc", enabled: true, builtin: true},
    {id: "break-pane", key: "!", command: "break-pane", label: "Break pane into window", category: "pane", enabled: true, builtin: true},
    {id: "swap-pane-up", key: "{", command: "swap-pane -U", label: "Swap pane up", category: "pane", enabled: true, builtin: true},
    {id: "swap-pane-down", key: "}", command: "swap-pane -D", label: "Swap pane down", category: "pane", enabled: true, builtin: true},
    {id: "next-layout", key: "Space", command: "next-layout", label: "Next layout", category: "layout", enabled: true, builtin: true},
    {id: "even-horizontal", key: "M-1", command: "select-layout even-horizontal", label: "Even horizontal layout", category: "layout", enabled: true, builtin: true},
    {id: "even-vertical", key: "M-2", command: "select-layout even-vertical", label: "Even vertical layout", category: "layout", enabled: true, builtin: true},
    {id: "main-horizontal", key: "M-3", command: "select-layout main-horizontal", label: "Main horizontal layout", category: "layout", enabled: true, builtin: true},
    {id: "main-vertical", key: "M-4", command: "select-layout main-vertical", label: "Main vertical layout", category: "layout", enabled: true, builtin: true},
    {id: "tiled", key: "M-5", command: "select-layout tiled", label: "Tiled layout", category: "layout", enabled: true, builtin: true},
    {id: "reload-config", key: "r", command: "source-file ~/.tmux.conf \\; display-message 'Reloaded ~/.tmux.conf'", label: "Reload config", category: "custom", enabled: true, builtin: false}
];

export interface TmuxStatusConfig {
    prefix: string; // 예: "C-a"
    mouse: boolean;
    baseIndex: number; // 0 or 1
    paneBaseIndex: number; // 0 or 1
    modeKeys: "vi" | "emacs";
    historyLimit: number;
    renumberWindows: boolean;
    escapeTime: number;
    splitPreset: "tmux-default" | "vim-friendly";
    vimPaneNavigation: boolean;
    statusInterval: number; // status-bar 갱신 주기(초)
    statusPosition: "top" | "bottom";
    statusStyle: string; // fg=...,bg=...
    leftSegments: string[];
    rightSegments: string[];
    plugins: string[]; // selected plugin ids
    customPlugins: string[];
    keyBindings: TmuxKeyBinding[];
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
    paneBaseIndex: 0,
    modeKeys: "emacs",
    historyLimit: 2000,
    renumberWindows: false,
    escapeTime: 500,
    splitPreset: "tmux-default",
    vimPaneNavigation: false,
    statusInterval: 15,
    statusPosition: "bottom",
    statusStyle: "fg=black,bg=green",
    leftSegments: ["[#S] "],
    rightSegments: ["%H:%M %d-%b-%y"],
    plugins: [],
    customPlugins: [],
    keyBindings: tmuxDefaultKeyBindings.map(binding => ({...binding}))
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
    lines.push(`setw -g pane-base-index ${c.paneBaseIndex}`);
    lines.push(`setw -g mode-keys ${c.modeKeys}`);
    lines.push(`set -g history-limit ${c.historyLimit}`);
    lines.push(`set -g status-interval ${c.statusInterval}`);
    lines.push(`set -g renumber-windows ${c.renumberWindows ? "on" : "off"}`);
    lines.push(`set -sg escape-time ${c.escapeTime}`);
    lines.push("");

    if (c.splitPreset === "vim-friendly") {
        lines.push("# === Pane split preset ===");
        lines.push("unbind %");
        lines.push("unbind '\"'");
        lines.push("bind | split-window -h");
        lines.push("bind - split-window -v");
        lines.push("");
    }

    if (c.vimPaneNavigation) {
        lines.push("# === Vim-style pane navigation ===");
        lines.push("bind h select-pane -L");
        lines.push("bind j select-pane -D");
        lines.push("bind k select-pane -U");
        lines.push("bind l select-pane -R");
        lines.push("");
    }

    if (c.keyBindings.length) {
        lines.push("# === Key bindings ===");
        for (const binding of c.keyBindings) {
            const key = binding.key.trim();
            const command = binding.command.trim();
            if (!key) continue;
            if (!binding.enabled) {
                lines.push(`unbind ${key}`);
                continue;
            }
            if (!command) continue;
            if (binding.label.trim()) lines.push(`# ${binding.label.trim()}`);
            lines.push(`bind ${key} ${command}`);
        }
        lines.push("");
    }

    lines.push("# === 상태바 ===");
    lines.push(`set -g status-position ${c.statusPosition}`);
    lines.push(`set -g status-style "${c.statusStyle}"`);
    lines.push(`set -g status-left "${c.leftSegments.join("")}"`);
    lines.push(`set -g status-right "${c.rightSegments.join("")}"`);
    lines.push("set -g status-left-length 60");
    lines.push("set -g status-right-length 80");
    lines.push("");

    const pluginObjects = tmuxPlugins.filter(p => c.plugins.includes(p.id));
    const customPlugins = c.customPlugins.map(p => p.trim()).filter(Boolean);
    if (pluginObjects.length || customPlugins.length) {
        lines.push("# === 플러그인 (TPM) ===");
        for (const p of pluginObjects) {
            if (p.id === "tpm") continue;
            lines.push(`set -g @plugin '${p.name}'`);
        }
        for (const p of customPlugins) {
            lines.push(`set -g @plugin '${p.replace(/'/g, "'\\''")}'`);
        }
        lines.push("set -g @plugin 'tmux-plugins/tpm'");
        lines.push("run '~/.tmux/plugins/tpm/tpm'");
    }
    return lines.join("\n") + "\n";
}
