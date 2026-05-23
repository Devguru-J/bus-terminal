import {create} from "zustand";
import {persist} from "zustand/middleware";
import {tmuxStatusDefault, type TmuxStatusConfig, serializeTmuxConf} from "@/data/tmux";

interface TmuxState {
    config: TmuxStatusConfig;
    setField: <K extends keyof TmuxStatusConfig>(k: K, v: TmuxStatusConfig[K]) => void;
    togglePlugin: (id: string) => void;
    exportText: () => string;
    reset: () => void;
}

export const useTmuxStore = create<TmuxState>()(
    persist(
        (set, get) => ({
            config: {...tmuxStatusDefault},
            setField: (k, v) => set(s => ({config: {...s.config, [k]: v}})),
            togglePlugin: (id) =>
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
            exportText: () => serializeTmuxConf(get().config),
            reset: () => set({config: {...tmuxStatusDefault}})
        }),
        {name: "bus-terminal:tmux", version: 2}
    )
);
