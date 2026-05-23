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
                    <motion.button
                        key={t.id}
                        initial={{opacity: 0, y: 12, scale: 0.96}}
                        animate={{opacity: 1, y: 0, scale: 1}}
                        exit={{opacity: 0, y: 8, scale: 0.96}}
                        transition={{type: "spring", stiffness: 320, damping: 28}}
                        onClick={() => dismiss(t.id)}
                        className="glass-panel rounded-lg px-4 py-3 text-left flex items-start gap-3"
                    >
                        <Icon
                            name={ICONS[t.tone]}
                            className={cn("text-[18px] mt-0.5", TONES[t.tone])}
                            fill
                        />
                        <span className="text-body-md text-on-surface">{t.text}</span>
                    </motion.button>
                ))}
            </AnimatePresence>
        </div>
    );
}
