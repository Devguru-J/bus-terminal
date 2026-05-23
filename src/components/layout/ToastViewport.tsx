import {AnimatePresence, motion} from "framer-motion";
import {useToastStore} from "@/stores/toastStore";
import {CheckCircle2, AlertTriangle, Info, XCircle} from "lucide-react";
import {cn} from "@/lib/utils";

const iconFor = {
    info: Info,
    success: CheckCircle2,
    warn: AlertTriangle,
    error: XCircle
} as const;

const toneFor = {
    info: "text-led-blue",
    success: "text-led-green",
    warn: "text-led-amber",
    error: "text-led-red"
} as const;

export function ToastViewport() {
    const items = useToastStore(s => s.items);
    const dismiss = useToastStore(s => s.dismiss);

    return (
        <div className="fixed z-50 bottom-5 right-5 flex flex-col gap-2 max-w-sm w-[calc(100%-2.5rem)]">
            <AnimatePresence>
                {items.map(t => {
                    const Icon = iconFor[t.tone];
                    return (
                        <motion.button
                            key={t.id}
                            initial={{opacity: 0, y: 12, scale: 0.96}}
                            animate={{opacity: 1, y: 0, scale: 1}}
                            exit={{opacity: 0, y: 8, scale: 0.96}}
                            transition={{type: "spring", stiffness: 320, damping: 28}}
                            onClick={() => dismiss(t.id)}
                            className="glass rounded-xl px-4 py-3 text-sm text-left flex items-start gap-3 shadow-glass"
                        >
                            <Icon size={16} className={cn("mt-0.5 shrink-0", toneFor[t.tone])} />
                            <span className="text-white/85">{t.text}</span>
                        </motion.button>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
