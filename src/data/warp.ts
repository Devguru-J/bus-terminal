/**
 * Warp 승강장 데이터.
 * Warp는 GUI 기반이지만 테마와 워크플로우를 YAML로 관리.
 * - 테마: ~/.warp/themes/<name>.yaml
 * - 워크플로우: ~/.warp/workflows/<name>.yaml
 * - launch_configurations: ~/.warp/launch_configurations/<name>.yaml
 */

export interface WarpTerminalColors {
    black: string;
    red: string;
    green: string;
    yellow: string;
    blue: string;
    magenta: string;
    cyan: string;
    white: string;
}

export interface WarpThemeColors {
    accent: string;
    background: string;
    foreground: string;
    /** 패널/탭/배지 등 약한 배경에 쓰이는 톤 (darker / lighter 둘 다 동일 필드를 보내면 안전) */
    details: "darker" | "lighter";
    normal: WarpTerminalColors;
    bright: WarpTerminalColors;
}

export interface WarpWorkflow {
    id: string;
    name: string;
    command: string;
    description: string;
    tags: string[];
    arguments: Array<{name: string; description: string; default: string}>;
}

export interface WarpAppearance {
    fontFamily: string;
    fontSize: number;
    cursorShape: "block" | "bar" | "underline";
    cursorBlinking: boolean;
    windowOpacity: number; // 0..100
    windowBlur: boolean;
    showStatusBar: boolean;
    blockBreadcrumbs: boolean;
    inputType: "modern" | "classic";
    pane_dim: boolean;
    enable_ligatures: boolean;
    show_command_inspector_tooltip: boolean;
}

export interface WarpAiSettings {
    enabled: boolean;
    autosuggestions: boolean;
    naturalLanguageEnabled: boolean;
    agentMode: boolean;
    historyContext: number; // 명령 히스토리 컨텍스트 개수
}

export interface WarpConfig {
    themeName: string;
    theme: WarpThemeColors;
    appearance: WarpAppearance;
    ai: WarpAiSettings;
    workflows: WarpWorkflow[];
}

export const WARP_FONT_FAMILIES = [
    "Hack",
    "JetBrains Mono",
    "Fira Code",
    "Source Code Pro",
    "Cascadia Code",
    "Iosevka",
    "MesloLGS NF",
    "Menlo",
    "Monaco"
] as const;

/**
 * 진짜 Warp 출고 기본 (Warp Dark).
 * - 폰트 Hack 13pt
 * - cursor block, blink off
 * - opacity 100 (불투명)
 * - blur off
 * - AI: 켜져있음 (Warp의 기본 셀링 포인트)
 */
export const warpDefault: WarpConfig = {
    themeName: "Warp Dark",
    theme: {
        accent: "#01a4ff",
        background: "#1b1b1d",
        foreground: "#ffffff",
        details: "darker",
        normal: {
            black: "#1b1b1d",
            red: "#ff5555",
            green: "#69ff94",
            yellow: "#f1fa8c",
            blue: "#01a4ff",
            magenta: "#ff79c6",
            cyan: "#8be9fd",
            white: "#f8f8f2"
        },
        bright: {
            black: "#6272a4",
            red: "#ff6e6e",
            green: "#69ff94",
            yellow: "#ffffa5",
            blue: "#01a4ff",
            magenta: "#ff92df",
            cyan: "#a4ffff",
            white: "#ffffff"
        }
    },
    appearance: {
        fontFamily: "Hack",
        fontSize: 13,
        cursorShape: "block",
        cursorBlinking: false,
        windowOpacity: 100,
        windowBlur: false,
        showStatusBar: true,
        blockBreadcrumbs: true,
        inputType: "modern",
        pane_dim: false,
        enable_ligatures: false,
        show_command_inspector_tooltip: true
    },
    ai: {
        enabled: true,
        autosuggestions: true,
        naturalLanguageEnabled: true,
        agentMode: false,
        historyContext: 20
    },
    workflows: []
};

function yamlIndent(level: number): string {
    return "  ".repeat(level);
}

function yamlString(value: string): string {
    if (/^[A-Za-z0-9_\-/.\s#]+$/.test(value) && !value.includes(":") && !value.startsWith("-")) {
        return value;
    }
    return JSON.stringify(value);
}

function serializeTerminalColors(c: WarpTerminalColors, level: number): string {
    const i = yamlIndent(level);
    return [
        `${i}black: "${c.black}"`,
        `${i}red: "${c.red}"`,
        `${i}green: "${c.green}"`,
        `${i}yellow: "${c.yellow}"`,
        `${i}blue: "${c.blue}"`,
        `${i}magenta: "${c.magenta}"`,
        `${i}cyan: "${c.cyan}"`,
        `${i}white: "${c.white}"`
    ].join("\n");
}

/** Warp 테마 YAML. ~/.warp/themes/<name>.yaml 로 저장. */
export function serializeWarpTheme(c: WarpConfig): string {
    const t = c.theme;
    return [
        `# 버스터미널에서 출발한 Warp 테마`,
        `# generated ${new Date().toISOString()}`,
        `name: ${yamlString(c.themeName)}`,
        `accent: "${t.accent}"`,
        `background: "${t.background}"`,
        `foreground: "${t.foreground}"`,
        `details: ${t.details}`,
        `terminal_colors:`,
        `  normal:`,
        serializeTerminalColors(t.normal, 2),
        `  bright:`,
        serializeTerminalColors(t.bright, 2),
        ""
    ].join("\n");
}

/** Warp 워크플로우 YAML 모음. 워크플로우당 1파일이 정석이지만 멀티 문서로 합쳐서 내보냄. */
export function serializeWarpWorkflows(c: WarpConfig): string {
    if (!c.workflows.length) return "";
    const docs = c.workflows.map(w => {
        const lines: string[] = [];
        lines.push(`# Workflow: ${w.name}`);
        lines.push(`name: ${yamlString(w.name)}`);
        lines.push(`command: |`);
        for (const line of w.command.split("\n")) {
            lines.push(`  ${line}`);
        }
        if (w.tags.length) {
            lines.push(`tags:`);
            for (const tag of w.tags) lines.push(`  - ${yamlString(tag)}`);
        }
        if (w.description) lines.push(`description: ${yamlString(w.description)}`);
        if (w.arguments.length) {
            lines.push(`arguments:`);
            for (const arg of w.arguments) {
                lines.push(`  - name: ${yamlString(arg.name)}`);
                if (arg.description) lines.push(`    description: ${yamlString(arg.description)}`);
                if (arg.default) lines.push(`    default_value: ${yamlString(arg.default)}`);
            }
        }
        return lines.join("\n");
    });
    return docs.join("\n---\n") + "\n";
}

/** appearance + AI 설정. Warp는 GUI 저장이 정식이라 이건 README 안내용 YAML. */
export function serializeWarpSettings(c: WarpConfig): string {
    const a = c.appearance;
    const ai = c.ai;
    return [
        `# 버스터미널에서 출발한 Warp 추천 설정`,
        `# Warp는 설정을 GUI로 저장합니다 — 아래 항목을 Settings에서 그대로 맞춰주세요.`,
        `# generated ${new Date().toISOString()}`,
        ``,
        `appearance:`,
        `  font_family: ${yamlString(a.fontFamily)}`,
        `  font_size: ${a.fontSize}`,
        `  cursor_shape: ${a.cursorShape}`,
        `  cursor_blinking: ${a.cursorBlinking}`,
        `  window_opacity: ${a.windowOpacity}`,
        `  window_blur: ${a.windowBlur}`,
        `  show_status_bar: ${a.showStatusBar}`,
        `  block_breadcrumbs: ${a.blockBreadcrumbs}`,
        `  input_type: ${a.inputType}`,
        `  pane_dim: ${a.pane_dim}`,
        `  enable_ligatures: ${a.enable_ligatures}`,
        `  show_command_inspector_tooltip: ${a.show_command_inspector_tooltip}`,
        ``,
        `ai:`,
        `  enabled: ${ai.enabled}`,
        `  autosuggestions: ${ai.autosuggestions}`,
        `  natural_language: ${ai.naturalLanguageEnabled}`,
        `  agent_mode: ${ai.agentMode}`,
        `  history_context: ${ai.historyContext}`,
        ``
    ].join("\n");
}
