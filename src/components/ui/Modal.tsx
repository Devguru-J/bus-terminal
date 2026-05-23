import type {ReactNode} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {Icon} from "./Icon";

interface Props {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function Modal({open, onClose, title, children, footer}: Props) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        key="overlay"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        key="dialog"
                        initial={{opacity: 0, y: 12, scale: 0.97}}
                        animate={{opacity: 1, y: 0, scale: 1}}
                        exit={{opacity: 0, y: 8, scale: 0.97}}
                        transition={{type: "spring", stiffness: 320, damping: 28}}
                        role="dialog"
                        aria-modal="true"
                        className="fixed inset-0 z-50 grid place-items-center p-4 pointer-events-none"
                    >
                        <div className="pointer-events-auto w-full max-w-lg rounded-xl border border-white/10 bg-surface-container-low/95 backdrop-blur-md shadow-glow-soft overflow-hidden">
                            <header className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                                <h3 className="font-mono text-label-xs uppercase tracking-[0.16em] text-primary-fixed-dim">
                                    {title}
                                </h3>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Close"
                                    className="text-on-surface-variant hover:text-on-surface p-1 rounded"
                                >
                                    <Icon name="close" className="text-[18px]" />
                                </button>
                            </header>
                            <div className="p-5">{children}</div>
                            {footer && (
                                <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-end gap-2">
                                    {footer}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
