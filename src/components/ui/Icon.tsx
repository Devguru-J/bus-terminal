import {cn} from "@/lib/utils";

interface Props {
    name: string;
    className?: string;
    fill?: boolean;
}

/** Material Symbols Outlined wrapper. */
export function Icon({name, className, fill}: Props) {
    return (
        <span
            aria-hidden
            className={cn(
                "material-symbols-outlined select-none leading-none",
                fill && "ms-fill",
                className
            )}
        >
            {name}
        </span>
    );
}
