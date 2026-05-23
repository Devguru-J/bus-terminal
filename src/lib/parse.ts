/**
 * Ghostty config 파서. 레퍼런스 구현을 참고하되 React/TS 환경에 맞게 재작성.
 * - `key = value` 라인 추출
 * - palette / keybind는 배열로 누적
 * - 알 수 없는 키도 폐기하지 않고 raw 맵에 보존 (사용자 입력 보호)
 */

const LINE_RE = /^\s*([a-z][a-z0-9-]*)\s*=\s*(.*?)\s*$/;
const COLOR_KEYS = new Set([
    "background",
    "foreground",
    "cursor-color",
    "selection-background",
    "selection-foreground"
]);

export interface ParsedGhosttyConfig {
    palette: Array<string | "">;
    keybind: string[];
    raw: Record<string, string>;
    unknownLines: string[];
}

export function parseGhosttyConfig(input: string): ParsedGhosttyConfig {
    const result: ParsedGhosttyConfig = {
        palette: Array<string | "">(256).fill(""),
        keybind: [],
        raw: {},
        unknownLines: []
    };

    for (const lineRaw of input.split(/\r?\n/)) {
        const line = lineRaw.trim();
        if (!line || line.startsWith("#")) continue;
        const m = LINE_RE.exec(line);
        if (!m) {
            result.unknownLines.push(line);
            continue;
        }
        const key = m[1];
        let value = m[2];

        if (key === "palette") {
            const eq = value.indexOf("=");
            if (eq < 0) continue;
            const idx = parseInt(value.slice(0, eq).trim(), 10);
            const color = value.slice(eq + 1).trim();
            if (idx >= 0 && idx < 256) result.palette[idx] = color;
            continue;
        }
        if (key === "keybind") {
            result.keybind.push(value);
            continue;
        }
        if (COLOR_KEYS.has(key) && /^[0-9a-fA-F]{6}$/.test(value)) {
            value = `#${value}`;
        }
        result.raw[key] = value;
    }
    return result;
}

/**
 * config 객체를 다시 ghostty 텍스트로 직렬화.
 * defaults와 다른 키만 export("출발하기")한다는 원칙.
 */
export function serializeGhosttyConfig(
    current: Record<string, string | number | boolean>,
    defaults: Record<string, string | number | boolean>,
    palette: Array<string | "">,
    paletteDefaults: Array<string | "">,
    keybinds: string[],
    keybindDefaults: string[]
): string {
    const out: string[] = [];
    out.push("# 버스터미널에서 출발한 설정");
    out.push(`# generated ${new Date().toISOString()}`);
    out.push("");

    for (const key of Object.keys(current).sort()) {
        const v = current[key];
        const d = defaults[key];
        if (v === d || v === "" || v === undefined) continue;
        out.push(`${key} = ${v}`);
    }

    for (let i = 0; i < palette.length; i++) {
        const v = palette[i];
        if (!v || v === paletteDefaults[i]) continue;
        out.push(`palette = ${i}=${v}`);
    }

    for (const kb of keybinds) {
        if (keybindDefaults.includes(kb)) continue;
        out.push(`keybind = ${kb}`);
    }

    return out.join("\n") + "\n";
}
