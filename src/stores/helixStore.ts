import {create} from "zustand";
import {persist} from "zustand/middleware";
import {
    helixDefault,
    serializeHelixConfig,
    serializeHelixLanguages,
    type HelixConfig,
    type HelixKeymap
} from "@/data/helix";

interface HelixState {
    config: HelixConfig;
    setField: <K extends keyof HelixConfig>(k: K, v: HelixConfig[K]) => void;
    toggleLanguageServer: (id: string) => void;
    addKeymap: (k: HelixKeymap) => void;
    removeKeymap: (mode: HelixKeymap["mode"], lhs: string) => void;
    exportText: () => string;
    exportLanguagesText: () => string;
    reset: () => void;
}

export const useHelixStore = create<HelixState>()(
    persist(
        (set, get) => ({
            config: {...helixDefault},
            setField: (k, v) => set(s => ({config: {...s.config, [k]: v}})),
            toggleLanguageServer: id =>
                set(s => {
                    const has = s.config.languageServers.includes(id);
                    return {
                        config: {
                            ...s.config,
                            languageServers: has
                                ? s.config.languageServers.filter(p => p !== id)
                                : [...s.config.languageServers, id]
                        }
                    };
                }),
            addKeymap: k =>
                set(s => ({
                    config: {
                        ...s.config,
                        keymaps: s.config.keymaps.find(
                            x => x.mode === k.mode && x.lhs === k.lhs
                        )
                            ? s.config.keymaps
                            : [...s.config.keymaps, k]
                    }
                })),
            removeKeymap: (mode, lhs) =>
                set(s => ({
                    config: {
                        ...s.config,
                        keymaps: s.config.keymaps.filter(
                            k => !(k.mode === mode && k.lhs === lhs)
                        )
                    }
                })),
            exportText: () => serializeHelixConfig(get().config),
            exportLanguagesText: () => serializeHelixLanguages(get().config),
            reset: () => set({config: {...helixDefault}})
        }),
        {
            name: "bus-terminal:helix",
            version: 1,
            migrate: () => ({config: {...helixDefault}})
        }
    )
);
