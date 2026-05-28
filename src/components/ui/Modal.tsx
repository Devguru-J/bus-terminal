import {useEffect, useId, useRef, type ReactNode} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {Icon} from "./Icon";

interface Props {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    /** 본문 설명 (aria-describedby로 연결) */
    description?: string;
}

export function Modal({open, onClose, title, children, footer, description}: Props) {
    const titleId = useId();
    const descId = useId();
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    // 열릴 때 직전 포커스 저장 → 닫힐 때 복원
    useEffect(() => {
        if (open) {
            previousFocusRef.current = document.activeElement as HTMLElement | null;
            // 첫 focusable element에 포커스
            window.setTimeout(() => {
                const first = dialogRef.current?.querySelector<HTMLElement>(
                    'input,textarea,select,button:not([aria-label="Close"])'
                );
                first?.focus();
            }, 50);
        }
        else {
            previousFocusRef.current?.focus?.();
        }
    }, [open]);

    // Esc 닫기 + Tab focus trap
    useEffect(() => {
        if (!open) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") {
                e.stopPropagation();
                onClose();
                return;
            }
            if (e.key !== "Tab") return;
            const container = dialogRef.current;
            if (!container) return;
            const focusables = container.querySelectorAll<HTMLElement>(
                'a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])'
            );
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement as HTMLElement | null;
            if (e.shiftKey) {
                if (active === first || !container.contains(active)) {
                    e.preventDefault();
                    last.focus();
                }
            }
            else {
                if (active === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

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
                        aria-labelledby={titleId}
                        aria-describedby={description ? descId : undefined}
                        className="fixed inset-0 z-50 grid place-items-center p-4 pointer-events-none"
                    >
                        <div
                            ref={dialogRef}
                            className="pointer-events-auto w-full max-w-lg rounded-xl border border-white/10 bg-surface-container-low/95 backdrop-blur-md shadow-glow-soft overflow-hidden"
                        >
                            <header className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                                <h3
                                    id={titleId}
                                    className="font-mono text-label-xs uppercase tracking-[0.16em] text-primary-fixed-dim"
                                >
                                    {title}
                                </h3>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Close"
                                    className="text-on-surface-variant hover:text-on-surface p-2 -m-1 rounded"
                                >
                                    <Icon name="close" className="text-[18px]" />
                                </button>
                            </header>
                            {description && (
                                <p
                                    id={descId}
                                    className="px-5 pt-4 text-[12px] text-on-surface-variant"
                                >
                                    {description}
                                </p>
                            )}
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
