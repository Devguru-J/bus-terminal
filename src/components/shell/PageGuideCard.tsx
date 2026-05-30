import {useEffect, useState} from "react";
import {Icon} from "@/components/ui/Icon";
import {useUIStore} from "@/stores/uiStore";

interface Step {
    title: string;
    detail?: string;
}

interface Props {
    /** localStorage 키 — 한 번 닫으면 다시 안 펼침 (사용자가 다시 열기 전까지) */
    storageKey: string;
    title: string;
    steps: Step[];
}

/**
 * 페이지 상단에 접을 수 있는 작은 안내 카드.
 * 첫 방문 시 자동으로 펼쳐지고, 사용자가 닫으면 다음 방문부터 접힘 상태로 유지된다.
 */
export function PageGuideCard({storageKey, title, steps}: Props) {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const beginnerMode = useUIStore(s => s.beginnerMode);
    const setBeginnerMode = useUIStore(s => s.setBeginnerMode);

    useEffect(() => {
        if (beginnerMode) {
            setOpen(true);
            setMounted(true);
            return;
        }
        // 첫 방문 여부: localStorage 키가 없으면 처음
        try {
            const seen = localStorage.getItem(storageKey);
            setOpen(seen === null);
        }
        catch {
            setOpen(false);
        }
        setMounted(true);
    }, [storageKey, beginnerMode]);

    function close() {
        setOpen(false);
        try {
            localStorage.setItem(storageKey, "1");
        }
        catch {
            // 무시
        }
    }

    if (!mounted) return null;

    if (!open) {
        return (
            <div className="mb-4 flex justify-end">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant hover:border-white/25 hover:text-on-surface transition"
                    title="이 페이지에서 할 일 다시 보기"
                >
                    <Icon name="help_outline" className="text-[14px]" />
                    이 페이지 안내 보기
                </button>
            </div>
        );
    }

    return (
        <aside
            className="mb-5 rounded-xl border border-primary-fixed-dim/25 bg-primary-fixed-dim/[0.04] p-4"
            aria-label={title}
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                    <div className="font-mono text-label-xs uppercase tracking-[0.14em] text-primary-fixed-dim">
                        {beginnerMode ? "초보 모드에서 할 일" : "이 페이지에서 할 일"}
                    </div>
                    <h3 className="font-display text-title-md text-on-surface mt-1">{title}</h3>
                </div>
                {beginnerMode ? (
                    <button
                        type="button"
                        onClick={() => setBeginnerMode(false)}
                        className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant hover:border-white/20 hover:text-on-surface transition"
                    >
                        초보 모드 끄기
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={close}
                        className="text-on-surface-variant hover:text-on-surface p-1 rounded"
                        aria-label="안내 닫기"
                        title="안내 닫기 (오른쪽 작은 칩으로 다시 열 수 있어요)"
                    >
                        <Icon name="close" className="text-[16px]" />
                    </button>
                )}
            </div>
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {steps.map((s, i) => (
                    <li
                        key={i}
                        className="rounded-lg border border-white/[0.06] bg-surface-container-lowest/80 px-3 py-2 flex gap-2 items-start"
                    >
                        <span className="h-5 w-5 shrink-0 rounded-full bg-primary-fixed-dim/15 border border-primary-fixed-dim/40 grid place-items-center font-mono text-[10px] text-primary-fixed-dim">
                            {i + 1}
                        </span>
                        <div className="min-w-0">
                            <div className="text-code-sm text-on-surface">{s.title}</div>
                            {s.detail && (
                                <div className="text-[11px] text-on-surface-variant mt-0.5">
                                    {s.detail}
                                </div>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </aside>
    );
}
