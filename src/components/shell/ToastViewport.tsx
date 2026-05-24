import {AnimatePresence, motion} from "framer-motion";
import {useToastStore} from "@/stores/toastStore";
import {cn} from "@/lib/utils";
import {Icon} from "@/components/ui/Icon";

const ICONS = {
    info: "info",
    success: "check_circle",
    warn: "warning",
    error: "error"
} as const;

const TONES = {
    info: "text-secondary-fixed-dim",
    success: "text-primary-fixed-dim",
    warn: "text-tertiary-fixed-dim",
    error: "text-error"
} as const;

export function ToastViewport() {
    const items = useToastStore(s => s.items);
    const dismiss = useToastStore(s => s.dismiss);
    return (
        <div className="fixed z-50 bottom-14 right-5 flex flex-col gap-2 max-w-sm w-[calc(100%-2.5rem)]">
            <AnimatePresence>
                {items.map(t => (
                    <motion.div
                        key={t.id}
                        initial={{opacity: 0, y: 12, scale: 0.96}}
                        animate={{opacity: 1, y: 0, scale: 1}}
                        exit={{opacity: 0, y: 8, scale: 0.96}}
                        transition={{type: "spring", stiffness: 320, damping: 28}}
                        className="glass-panel rounded-lg px-4 py-3 flex items-start gap-3"
                    >
                        <Icon
                            name={ICONS[t.tone]}
                            className={cn("text-[18px] mt-0.5 shrink-0", TONES[t.tone])}
                            fill
                        />
                        <button
                            type="button"
                            onClick={() => dismiss(t.id)}
                            className="text-body-md text-on-surface text-left flex-1 min-w-0"
                        >
                            {t.text}
                        </button>
                        {t.action && (
                            <button
                                type="button"
                                onClick={() => t.action!.run()}
                                className="shrink-0 ml-2 rounded border border-primary-fixed-dim/50 bg-primary-fixed-dim/15 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-primary-fixed-dim hover:bg-primary-fixed-dim/25 transition"
                            >
                                {t.action.label}
                            </button>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
