import {Toggle} from "./Field";

interface Props {
    title: string;
    description?: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}

/** A single toggle inside a bordered card row — used by Stitch panels. */
export function ToggleRow({title, description, checked, onChange}: Props) {
    return (
        <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-surface-container-low border border-white/[0.05]">
            <div className="min-w-0">
                <h4 className="font-mono text-code-sm text-on-surface">{title}</h4>
                {description && (
                    <p className="text-[11px] text-on-surface-variant/80 mt-1 leading-snug">
                        {description}
                    </p>
                )}
            </div>
            <Toggle checked={checked} onChange={onChange} />
        </div>
    );
}
