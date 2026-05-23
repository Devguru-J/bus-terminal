import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function camelToKebab(s: string): string {
    return s.replace(/([A-Z])/g, "-$1").toLowerCase();
}

export function kebabToCamel(s: string): string {
    return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

export function nowStamp(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatHhmm(d = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
