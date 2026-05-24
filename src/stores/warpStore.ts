import {create} from "zustand";
import {persist} from "zustand/middleware";
import {
    warpDefault,
    serializeWarpTheme,
    serializeWarpWorkflows,
    serializeWarpSettings,
    type WarpConfig,
    type WarpWorkflow,
    type WarpTerminalColors
} from "@/data/warp";
import type {RouteTheme} from "@/data/themes";

interface WarpState {
    config: WarpConfig;
    setAppearance: <K extends keyof WarpConfig["appearance"]>(
        k: K,
        v: WarpConfig["appearance"][K]
    ) => void;
    setAi: <K extends keyof WarpConfig["ai"]>(k: K, v: WarpConfig["ai"][K]) => void;
    setThemeField: <K extends keyof WarpConfig["theme"]>(
        k: K,
        v: WarpConfig["theme"][K]
    ) => void;
    setNormalColor: (k: keyof WarpTerminalColors, color: string) => void;
    setBrightColor: (k: keyof WarpTerminalColors, color: string) => void;
    setThemeName: (name: string) => void;
    applyTheme: (t: RouteTheme) => void;
    addWorkflow: (w: WarpWorkflow) => void;
    removeWorkflow: (id: string) => void;
    updateWorkflow: (id: string, patch: Partial<WarpWorkflow>) => void;
    exportTheme: () => string;
    exportWorkflows: () => string;
    exportSettings: () => string;
    reset: () => void;
}

export const useWarpStore = create<WarpState>()(
    persist(
        (set, get) => ({
            config: {...warpDefault, theme: {...warpDefault.theme}},
            setAppearance: (k, v) =>
                set(s => ({
                    config: {...s.config, appearance: {...s.config.appearance, [k]: v}}
                })),
            setAi: (k, v) =>
                set(s => ({config: {...s.config, ai: {...s.config.ai, [k]: v}}})),
            setThemeField: (k, v) =>
                set(s => ({config: {...s.config, theme: {...s.config.theme, [k]: v}}})),
            setNormalColor: (k, color) =>
                set(s => ({
                    config: {
                        ...s.config,
                        theme: {
                            ...s.config.theme,
                            normal: {...s.config.theme.normal, [k]: color}
                        }
                    }
                })),
            setBrightColor: (k, color) =>
                set(s => ({
                    config: {
                        ...s.config,
                        theme: {
                            ...s.config.theme,
                            bright: {...s.config.theme.bright, [k]: color}
                        }
                    }
                })),
            setThemeName: name => set(s => ({config: {...s.config, themeName: name}})),
            applyTheme: t => {
                // RouteTheme의 16색 → Warp의 normal(8) + bright(8) 매핑
                const p = t.palette16;
                set(s => ({
                    config: {
                        ...s.config,
                        themeName: t.ko,
                        theme: {
                            ...s.config.theme,
                            accent: t.accent,
                            background: t.background,
                            foreground: t.foreground,
                            normal: {
                                black: p[0], red: p[1], green: p[2], yellow: p[3],
                                blue: p[4], magenta: p[5], cyan: p[6], white: p[7]
                            },
                            bright: {
                                black: p[8], red: p[9], green: p[10], yellow: p[11],
                                blue: p[12], magenta: p[13], cyan: p[14], white: p[15]
                            }
                        }
                    }
                }));
            },
            addWorkflow: w =>
                set(s => ({
                    config: {...s.config, workflows: [...s.config.workflows, w]}
                })),
            removeWorkflow: id =>
                set(s => ({
                    config: {
                        ...s.config,
                        workflows: s.config.workflows.filter(w => w.id !== id)
                    }
                })),
            updateWorkflow: (id, patch) =>
                set(s => ({
                    config: {
                        ...s.config,
                        workflows: s.config.workflows.map(w =>
                            w.id === id ? {...w, ...patch} : w
                        )
                    }
                })),
            exportTheme: () => serializeWarpTheme(get().config),
            exportWorkflows: () => serializeWarpWorkflows(get().config),
            exportSettings: () => serializeWarpSettings(get().config),
            reset: () => set({config: {...warpDefault, theme: {...warpDefault.theme}}})
        }),
        {
            name: "bus-terminal:warp",
            version: 1,
            migrate: () => ({
                config: {...warpDefault, theme: {...warpDefault.theme}}
            })
        }
    )
);
