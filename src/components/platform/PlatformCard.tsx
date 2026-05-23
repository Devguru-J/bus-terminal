import {motion} from "framer-motion";
import {ArrowRight} from "lucide-react";
import {Link} from "react-router-dom";
import {cn} from "@/lib/utils";
import {Badge} from "@/components/ui/Badge";

interface Props {
    platform: string; // 1번 승강장
    title: string;
    description: string;
    to: string;
    accent: string;
    status?: "운행중" | "준비중";
    tag?: string;
}

export function PlatformCard({platform, title, description, to, accent, status = "운행중", tag}: Props) {
    return (
        <Link to={to} className="group">
            <motion.div
                whileHover={{y: -4}}
                transition={{type: "spring", stiffness: 320, damping: 24}}
                className={cn(
                    "relative overflow-hidden rounded-xl2 border border-line-strong p-6 h-full glass shadow-glass",
                    "before:absolute before:inset-0 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity",
                    "before:bg-gradient-to-br before:from-white/[0.04] before:to-transparent"
                )}
                style={{boxShadow: `0 30px 60px -30px ${accent}40`}}
            >
                <div
                    className="absolute -top-px left-0 h-px w-24"
                    style={{background: `linear-gradient(to right, transparent, ${accent}, transparent)`}}
                />
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <span
                            className="led-text text-2xl font-bold"
                            style={{color: accent}}
                        >
                            {platform}
                        </span>
                        {tag && <Badge tone="default">{tag}</Badge>}
                    </div>
                    <Badge tone={status === "운행중" ? "green" : "amber"}>{status}</Badge>
                </div>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">{title}</h3>
                <p className="mt-1.5 text-sm text-white/55 leading-relaxed">{description}</p>
                <div className="mt-6 inline-flex items-center gap-1.5 text-sm text-white/70 group-hover:text-white transition">
                    탑승하기
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition" />
                </div>
            </motion.div>
        </Link>
    );
}
