import {create} from "zustand";
import {persist} from "zustand/middleware";
import {ghosttyDefaults, PALETTE_DEFAULT} from "@/data/ghosttySchema";
import {parseGhosttyConfig, serializeGhosttyConfig} from "@/lib/parse";
import type {RouteTheme} from "@/data/themes";

interface GhosttyState {
    config: Record<string, string | number | boolean>;
    palette: Array<string | "">;
    keybinds: string[];
    rawExtras: Record<string, string>; // 스키마 외 키 보존

    setField: (key: string, value: string | number | boolean) => void;
    setPaletteSlot: (index: number, color: string) => void;
    addKeybind: (kb: string) => void;
    removeKeybind: (kb: string) => void;
    applyTheme: (t: RouteTheme) => void;
    importText: (text: string) => {ok: boolean; unknownLines: string[]};
    exportText: () => string;
    resetAll: () => void;
}

const defaults = ghosttyDefaults();
const paletteDefaultsConst = PALETTE_DEFAULT.slice();

export const useGhosttyStore = create<GhosttyState>()(
    persist(
        (set, get) => ({
            config: {...defaults},
            palette: PALETTE_DEFAULT.slice(),
            keybinds: [],
            rawExtras: {},

            setField: (key, value) =>
                set(s => ({config: {...s.config, [key]: value}})),

            setPaletteSlot: (index, color) =>
                set(s => {
                    const p = s.palette.slice();
                    p[index] = color;
                    return {palette: p};
                }),

            addKeybind: (kb) =>
                set(s => (s.keybinds.includes(kb) ? s : {keybinds: [...s.keybinds, kb]})),

            removeKeybind: (kb) =>
                set(s => ({keybinds: s.keybinds.filter(x => x !== kb)})),

            applyTheme: (t) =>
                set(s => {
                    const p = s.palette.slice();
                    t.palette16.forEach((c, i) => (p[i] = c));
                    return {
                        config: {
                            ...s.config,
                            background: t.background,
                            foreground: t.foreground,
                            "cursor-color": t.cursor,
                            "selection-background": t.selectionBg,
                            "selection-foreground": t.selectionFg,
                            theme: ""
                        },
                        palette: p
                    };
                }),

            importText: (text) => {
                const parsed = parseGhosttyConfig(text);
                set(s => {
                    const next = {...s.config};
                    const extras = {...s.rawExtras};
                    for (const [k, v] of Object.entries(parsed.raw)) {
                        if (k in defaults) {
                            const d = defaults[k];
                            if (typeof d === "number") next[k] = Number(v);
                            else if (typeof d === "boolean") next[k] = v === "true";
                            else next[k] = v;
                        }
                        else {
                            extras[k] = v;
                        }
                    }
                    const p = s.palette.slice();
                    parsed.palette.forEach((c, i) => {
                        if (c) p[i] = c;
                    });
                    const kbs = Array.from(new Set([...s.keybinds, ...parsed.keybind]));
                    return {config: next, palette: p, keybinds: kbs, rawExtras: extras};
                });
                return {ok: true, unknownLines: parsed.unknownLines};
            },

            exportText: () => {
                const s = get();
                const baseText = serializeGhosttyConfig(
                    s.config,
                    defaults,
                    s.palette,
                    paletteDefaultsConst,
                    s.keybinds,
                    []
                );
                const extras = Object.entries(s.rawExtras)
                    .map(([k, v]) => `${k} = ${v}`)
                    .join("\n");
                return extras ? `${baseText}\n# 스키마 외 키 (보존)\n${extras}\n` : baseText;
            },

            resetAll: () =>
                set({
                    config: {...defaults},
                    palette: PALETTE_DEFAULT.slice(),
                    keybinds: [],
                    rawExtras: {}
                })
        }),
        {name: "bus-terminal:ghostty", version: 2}
    )
);

/** 변경분(diff) 계산: 전광판/경로 비교에 사용 */
export interface DiffEntry {
    key: string;
    from: string;
    to: string;
}

export function computeGhosttyDiff(
    config: Record<string, string | number | boolean>
): DiffEntry[] {
    const out: DiffEntry[] = [];
    for (const k of Object.keys(config)) {
        const d = defaults[k];
        const v = config[k];
        if (v === d) continue;
        if (v === "" || v === undefined) continue;
        out.push({key: k, from: String(d), to: String(v)});
    }
    return out;
}
