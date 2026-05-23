import type {ReactNode} from "react";
import {Card, CardBody, CardHeader, CardTitle} from "@/components/ui/Card";

interface Props {
    title: string;
    actions?: ReactNode;
    children: ReactNode;
}

/** Grouping card used by Ghostty/tmux station forms. */
export function ConfigPanel({title, actions, children}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {actions}
            </CardHeader>
            <CardBody>{children}</CardBody>
        </Card>
    );
}
