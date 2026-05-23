import {StatusDot} from "@/components/ui/Badge";

interface Props {
    label: string;
}

/** FIDS-style status pill ("STATUS: READY TO DEPART"). */
export function DepartureStatus({label}: Props) {
    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container/60 border border-white/[0.05]">
            <StatusDot />
            <span className="font-mono text-label-xs uppercase tracking-[0.18em] text-primary-fixed-dim">
                {label}
            </span>
        </div>
    );
}
