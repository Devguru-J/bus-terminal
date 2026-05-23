import {NavLink} from "react-router-dom";
import {motion} from "framer-motion";
import {cn} from "@/lib/utils";
import {Icon} from "@/components/ui/Icon";

interface Props {
    to: string;
    label: string;
    icon: string;
    end?: boolean;
}

/** Left-sidebar route entry, with active rail. */
export function PlatformNavItem({to, label, icon, end}: Props) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({isActive}) =>
                cn(
                    "relative group flex items-center gap-3 h-10 pl-5 pr-3 rounded-r-lg transition",
                    isActive
                        ? "bg-primary-fixed-dim/[0.08] text-primary-fixed-dim"
                        : "text-on-surface-variant hover:text-on-surface hover:bg-white/[0.03]"
                )
            }
        >
            {({isActive}) => (
                <>
                    {isActive && (
                        <motion.span
                            layoutId="nav-rail"
                            transition={{type: "spring", stiffness: 380, damping: 30}}
                            className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-primary-fixed-dim shadow-[0_0_12px_rgba(0,229,91,0.6)]"
                        />
                    )}
                    <Icon name={icon} className="text-[18px]" />
                    <span className="font-mono text-label-xs uppercase tracking-[0.12em]">
                        {label}
                    </span>
                </>
            )}
        </NavLink>
    );
}
