import {forwardRef, type HTMLAttributes} from "react";
import {cn} from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({className, ...rest}, ref) => (
        <div
            ref={ref}
            className={cn("glass rounded-xl2 shadow-glass", className)}
            {...rest}
        />
    )
);
Card.displayName = "Card";

export function CardHeader({className, ...rest}: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("px-5 pt-5 pb-3", className)} {...rest} />;
}

export function CardBody({className, ...rest}: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("px-5 pb-5", className)} {...rest} />;
}

export function CardTitle({className, ...rest}: HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn("text-base font-semibold tracking-tight text-white", className)}
            {...rest}
        />
    );
}

export function CardSubtitle({className, ...rest}: HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn("text-xs text-white/50 mt-1", className)} {...rest} />;
}
