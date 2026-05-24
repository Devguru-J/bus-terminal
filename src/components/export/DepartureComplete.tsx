import {motion, useReducedMotion} from "framer-motion";
import {useEffect, useState} from "react";
import {Icon} from "@/components/ui/Icon";
import {DepartureStatus} from "@/components/platform/DepartureStatus";
import {Button} from "@/components/ui/Button";

interface Props {
    /** Configuration manifest summary cards (4-cell bento). */
    summary: Array<{label: string; value: string}>;
    onDownload?: () => void;
    onReturn?: () => void;
    /** 다운로드 버튼의 라벨 (선택 카운트 표시 등) */
    downloadLabel?: string;
    /** 다운로드 비활성화 (선택 0개일 때 등) */
    downloadDisabled?: boolean;
}

/**
 * Showcase FIDS panel: a bus icon drives across the dotted grid, then
 * settles into a "departed" state with status text.
 */
export function DepartureComplete({summary, onDownload, onReturn, downloadLabel, downloadDisabled}: Props) {
    const reduced = useReducedMotion();
    const [arrived, setArrived] = useState(false);

    // After ~3.6s the bus has driven across; switch state to "arrived"
    useEffect(() => {
        if (reduced) {
            setArrived(true);
            return;
        }
        const t = setTimeout(() => setArrived(true), 3400);
        return () => clearTimeout(t);
    }, [reduced]);

    return (
        <div className="w-full flex flex-col items-center text-center space-y-10">
            {/* FIDS header */}
            <div className="space-y-3">
                <DepartureStatus label={arrived ? "STATUS: DEPARTED" : "STATUS: READY TO DEPART"} />
                <h1 className="font-display text-display-lg text-on-surface tracking-tight animate-flicker fids-glow">
                    출발권 준비 완료
                </h1>
                <h2 className="font-display text-headline-sm text-primary-fixed-dim tracking-[0.32em] opacity-90">
                    SUCCESS
                </h2>
            </div>

            {/* Bus animation board */}
            <div className="relative w-full max-w-3xl h-36 rounded-xl overflow-hidden border-y border-white/[0.06] bg-surface-container-lowest/85">
                <div className="absolute inset-0 grid-board" />
                <div className="absolute inset-0 grid-board-fine opacity-50" />

                {/* Driving bus */}
                {!reduced && !arrived && (
                    <div className="absolute inset-0 flex items-center">
                        <motion.div
                            initial={{x: "-12%", opacity: 0}}
                            animate={{x: "108%", opacity: [0, 1, 1, 0]}}
                            transition={{
                                duration: 3.6,
                                times: [0, 0.18, 0.8, 1],
                                ease: "easeInOut"
                            }}
                            className="will-change-transform"
                        >
                            <Icon
                                name="directions_bus"
                                fill
                                className="text-[56px] text-primary-fixed-dim drop-shadow-[0_0_18px_rgba(0,229,91,0.55)]"
                            />
                        </motion.div>
                    </div>
                )}

                {/* Arrived state */}
                {arrived && (
                    <motion.div
                        initial={{opacity: 0, scale: 0.92}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{type: "spring", stiffness: 320, damping: 26}}
                        className="absolute inset-0 flex items-center justify-end pr-10"
                    >
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-label-xs uppercase tracking-[0.18em] text-primary-fixed-dim">
                                Arrived · ~/.config
                            </span>
                            <Icon
                                name="directions_bus"
                                fill
                                className="text-[44px] text-primary-fixed-dim drop-shadow-[0_0_18px_rgba(0,229,91,0.55)]"
                            />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Message + actions */}
            <div className="space-y-6 flex flex-col items-center">
                <p className="text-body-md text-on-surface-variant max-w-md">
                    설정 파일을 다운로드할 준비가 끝났어요.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button size="lg" onClick={onDownload} disabled={downloadDisabled}>
                        <Icon name="download" className="text-[16px]" />
                        {downloadLabel ?? "설정 파일 다운로드"}
                    </Button>
                    <Button size="lg" variant="outline" onClick={onReturn}>
                        <Icon name="terminal" className="text-[16px]" />
                        설정 화면으로 돌아가기
                    </Button>
                </div>
            </div>

            {/* Bento manifest */}
            <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
                {summary.map(item => (
                    <div
                        key={item.label}
                        className="rounded-lg bg-surface-container-low/85 border border-white/[0.05] p-4"
                    >
                        <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-on-surface-variant mb-2">
                            {item.label}
                        </div>
                        <div className="font-mono text-code-sm text-on-surface">
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
