/**
 * iTerm2 승강장 데이터.
 * .itermcolors (Apple plist XML) 색상 프리셋 + Profile JSON.
 * iTerm2 공식 import 형식과 호환.
 */

export interface Iterm2Profile {
    profileName: string;

    // 색상 (24개 키)
    background: string; // hex #rrggbb
    foreground: string;
    cursor: string;
    cursorText: string;
    selection: string;
    selectedText: string;
    bold: string;
    link: string;
    badge: string;
    tabColor: string;
    underline: string;
    ansi: string[]; // length 16

    // 폰트 / 텍스트
    fontFamily: string;
    fontSize: number;
    nonAsciiFontFamily: string;
    nonAsciiFontSize: number;
    useBoldFont: boolean;
    useItalicFont: boolean;
    blinkingCursor: boolean;
    cursorType: "block" | "vertical-bar" | "underline";
    minimumContrast: number; // 0..1
    horizontalSpacing: number; // 0.5..2
    verticalSpacing: number;
    useThinStrokes: "always" | "dark-bg" | "retina" | "never";

    // 윈도우
    transparency: number; // 0..1
    blur: boolean;
    blurRadius: number; // 0..30
    columns: number;
    rows: number;
    windowStyle: "normal" | "full-screen" | "maximized" | "fullscreen-traditional";

    // 터미널
    scrollbackLines: number;
    unlimitedScrollback: boolean;
    silenceBell: boolean;
    visualBell: boolean;
    closeWindowOnExit: "always" | "never" | "clean";
    sendCodeWhenIdle: boolean;

    // 키
    optionAsMeta: "esc-plus" | "meta" | "normal";
    rightOptionAsMeta: "esc-plus" | "meta" | "normal";

    // Hotkey window
    hotkeyEnabled: boolean;
    hotkeyKey: string; // 예: "F12"
    hotkeyModifiers: string[]; // ["cmd","opt"]
}

/**
 * iTerm2의 진짜 출고 기본값.
 * - Default 프로파일
 * - Monaco 12pt
 * - cursor block, blink off
 * - transparency 0, blur off
 * - 25x80
 */
export const iterm2Default: Iterm2Profile = {
    profileName: "Default",
    background: "#000000",
    foreground: "#c7c7c7",
    cursor: "#c7c7c7",
    cursorText: "#000000",
    selection: "#c1deff",
    selectedText: "#000000",
    bold: "#ffffff",
    link: "#0080ff",
    badge: "#ff2000",
    tabColor: "#808080",
    underline: "#0080ff",
    ansi: [
        "#000000", "#c91b00", "#00c200", "#c7c400",
        "#0225c7", "#ca30c7", "#00c5c7", "#c7c7c7",
        "#686868", "#ff6e67", "#5ffa68", "#fffc67",
        "#6871ff", "#ff77ff", "#60fdff", "#ffffff"
    ],
    fontFamily: "Monaco",
    fontSize: 12,
    nonAsciiFontFamily: "Monaco",
    nonAsciiFontSize: 12,
    useBoldFont: true,
    useItalicFont: true,
    blinkingCursor: false,
    cursorType: "block",
    minimumContrast: 0,
    horizontalSpacing: 1,
    verticalSpacing: 1,
    useThinStrokes: "retina",
    transparency: 0,
    blur: false,
    blurRadius: 10,
    columns: 80,
    rows: 25,
    windowStyle: "normal",
    scrollbackLines: 1000,
    unlimitedScrollback: false,
    silenceBell: false,
    visualBell: false,
    closeWindowOnExit: "clean",
    sendCodeWhenIdle: false,
    optionAsMeta: "normal",
    rightOptionAsMeta: "normal",
    hotkeyEnabled: false,
    hotkeyKey: "F12",
    hotkeyModifiers: ["cmd"]
};

/** hex #rrggbb → 0..1 RGB 분해. */
function hexToRgb01(hex: string): {r: number; g: number; b: number} {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    return {
        r: isNaN(r) ? 0 : r,
        g: isNaN(g) ? 0 : g,
        b: isNaN(b) ? 0 : b
    };
}

function plistColorDict(hex: string, key: string): string {
    const {r, g, b} = hexToRgb01(hex);
    return `	<key>${key}</key>
	<dict>
		<key>Alpha Component</key>
		<real>1</real>
		<key>Blue Component</key>
		<real>${b.toFixed(6)}</real>
		<key>Color Space</key>
		<string>sRGB</string>
		<key>Green Component</key>
		<real>${g.toFixed(6)}</real>
		<key>Red Component</key>
		<real>${r.toFixed(6)}</real>
	</dict>`;
}

/** .itermcolors 파일 (Apple plist XML). iTerm2에서 직접 import 가능. */
export function serializeIterm2Colors(p: Iterm2Profile): string {
    const entries: string[] = [];
    for (let i = 0; i < 16; i++) {
        entries.push(plistColorDict(p.ansi[i], `Ansi ${i} Color`));
    }
    entries.push(plistColorDict(p.background, "Background Color"));
    entries.push(plistColorDict(p.bold, "Bold Color"));
    entries.push(plistColorDict(p.cursor, "Cursor Color"));
    entries.push(plistColorDict(p.cursorText, "Cursor Text Color"));
    entries.push(plistColorDict(p.foreground, "Foreground Color"));
    entries.push(plistColorDict(p.link, "Link Color"));
    entries.push(plistColorDict(p.badge, "Badge Color"));
    entries.push(plistColorDict(p.tabColor, "Tab Color"));
    entries.push(plistColorDict(p.underline, "Underline Color"));
    entries.push(plistColorDict(p.selection, "Selection Color"));
    entries.push(plistColorDict(p.selectedText, "Selected Text Color"));
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
${entries.join("\n")}
</dict>
</plist>
`;
}

/** Dynamic Profile JSON. ~/Library/Application Support/iTerm2/DynamicProfiles/ 에 두면 자동 로드. */
export function serializeIterm2Profile(p: Iterm2Profile): string {
    const cursorTypeNum = p.cursorType === "block" ? 0 : p.cursorType === "vertical-bar" ? 1 : 2;
    const closeWindowMap = {always: 0, never: 1, clean: 2} as const;
    const optionMap = {"esc-plus": 0, "meta": 1, "normal": 2} as const;

    const profile = {
        Guid: `bus-terminal-${p.profileName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        Name: p.profileName,
        "Dynamic Profile Parent Name": "Default",
        "Normal Font": `${p.fontFamily.replace(/\s/g, "_")} ${p.fontSize}`,
        "Non-Ascii Font": `${p.nonAsciiFontFamily.replace(/\s/g, "_")} ${p.nonAsciiFontSize}`,
        "Use Bold Font": p.useBoldFont,
        "Use Italic Font": p.useItalicFont,
        "Blinking Cursor": p.blinkingCursor,
        "Cursor Type": cursorTypeNum,
        "Minimum Contrast": p.minimumContrast,
        "Horizontal Spacing": p.horizontalSpacing,
        "Vertical Spacing": p.verticalSpacing,
        "Thin Strokes": p.useThinStrokes === "never" ? 0 : p.useThinStrokes === "dark-bg" ? 1 : p.useThinStrokes === "retina" ? 2 : 4,
        Transparency: p.transparency,
        "Blur": p.blur,
        "Blur Radius": p.blurRadius,
        Columns: p.columns,
        Rows: p.rows,
        "Scrollback Lines": p.scrollbackLines,
        "Unlimited Scrollback": p.unlimitedScrollback,
        "Silence Bell": p.silenceBell,
        "Visual Bell": p.visualBell,
        "Close Sessions On End": closeWindowMap[p.closeWindowOnExit],
        "Send Code When Idle": p.sendCodeWhenIdle,
        "Option Key Sends": optionMap[p.optionAsMeta],
        "Right Option Key Sends": optionMap[p.rightOptionAsMeta],
        ...(p.hotkeyEnabled && {
            "Hotkey": p.hotkeyKey,
            "Hotkey Modifiers": p.hotkeyModifiers.join("+")
        }),
        ...embedColors(p)
    };
    return JSON.stringify({Profiles: [profile]}, null, 2) + "\n";
}

function embedColors(p: Iterm2Profile): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    const colorEntry = (hex: string) => {
        const {r, g, b} = hexToRgb01(hex);
        return {
            "Alpha Component": 1,
            "Blue Component": b,
            "Color Space": "sRGB",
            "Green Component": g,
            "Red Component": r
        };
    };
    for (let i = 0; i < 16; i++) out[`Ansi ${i} Color`] = colorEntry(p.ansi[i]);
    out["Background Color"] = colorEntry(p.background);
    out["Foreground Color"] = colorEntry(p.foreground);
    out["Cursor Color"] = colorEntry(p.cursor);
    out["Cursor Text Color"] = colorEntry(p.cursorText);
    out["Selection Color"] = colorEntry(p.selection);
    out["Selected Text Color"] = colorEntry(p.selectedText);
    out["Bold Color"] = colorEntry(p.bold);
    out["Link Color"] = colorEntry(p.link);
    out["Badge Color"] = colorEntry(p.badge);
    out["Tab Color"] = colorEntry(p.tabColor);
    out["Underline Color"] = colorEntry(p.underline);
    return out;
}

export const ITERM_FONT_FAMILIES = [
    "Monaco",
    "Menlo",
    "SF Mono",
    "JetBrainsMono Nerd Font",
    "FiraCode Nerd Font",
    "Hack Nerd Font",
    "MesloLGS NF",
    "Iosevka",
    "Cascadia Code"
] as const;
