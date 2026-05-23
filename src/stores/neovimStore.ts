import {create} from "zustand";
import {persist} from "zustand/middleware";
import {
    nvimDefault,
    serializeNvimConfig,
    type NvimConfig
} from "@/data/neovim";

interface NeovimState {
    config: NvimConfig;
    setField: <K extends keyof NvimConfig>(k: K, v: NvimConfig[K]) => void;
    togglePlugin: (id: string) => void;
    addKeymap: (k: NvimConfig["keymaps"][number]) => void;
    removeKeymap: (lhs: string) => void;
    exportText: () => string;
    reset: () => void;
}

export const useNeovimStore = create<NeovimState>()(
    persist(
        (set, get) => ({
            config: {...nvimDefault},
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
            addKeymap: k =>
                set(s => ({
                    config: {
                        ...s.config,
                        keymaps: s.config.keymaps.find(x => x.lhs === k.lhs)
                            ? s.config.keymaps
                            : [...s.config.keymaps, k]
                    }
                })),
            removeKeymap: lhs =>
                set(s => ({
                    config: {
                        ...s.config,
                        keymaps: s.config.keymaps.filter(k => k.lhs !== lhs)
                    }
                })),
            exportText: () => serializeNvimConfig(get().config),
            reset: () => set({config: {...nvimDefault}})
        }),
        {name: "bus-terminal:neovim", version: 2}
    )
);
