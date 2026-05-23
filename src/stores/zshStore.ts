import {create} from "zustand";
import {persist} from "zustand/middleware";
import {zshDefault, serializeZshConfig, type ZshConfig} from "@/data/zsh";

interface ZshState {
    config: ZshConfig;
    setField: <K extends keyof ZshConfig>(k: K, v: ZshConfig[K]) => void;
    togglePlugin: (id: string) => void;
    setAlias: (idx: number, name: string, value: string) => void;
    addAlias: () => void;
    removeAlias: (idx: number) => void;
    exportText: () => string;
    reset: () => void;
}

export const useZshStore = create<ZshState>()(
    persist(
        (set, get) => ({
            config: {...zshDefault},
            setField: (k, v) => set(s => ({config: {...s.config, [k]: v}})),
            togglePlugin: id =>
                set(s => {
                    const has = s.config.plugins.includes(id);
                    return {
                        config: {
                            ...s.config,
                            plugins: has
                                ? s.config.plugins.filter(p => p !== id)
                                : [...s.config.plugins, id]
                        }
                    };
                }),
            setAlias: (idx, name, value) =>
                set(s => {
                    const next = s.config.aliases.slice();
                    next[idx] = {name, value};
                    return {config: {...s.config, aliases: next}};
                }),
            addAlias: () =>
                set(s => ({
                    config: {
                        ...s.config,
                        aliases: [...s.config.aliases, {name: "", value: ""}]
                    }
                })),
            removeAlias: idx =>
                set(s => ({
                    config: {
                        ...s.config,
                        aliases: s.config.aliases.filter((_, i) => i !== idx)
                    }
                })),
            exportText: () => serializeZshConfig(get().config),
            reset: () => set({config: {...zshDefault}})
        }),
        {name: "bus-terminal:zsh", version: 2}
    )
);
