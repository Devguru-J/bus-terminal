import {useEffect, useState} from "react";
import {Modal} from "./Modal";
import {Button} from "./Button";
import {TextInput, Label} from "./Field";

export interface FormField {
    name: string;
    label: string;
    placeholder?: string;
    initial?: string;
    required?: boolean;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: Record<string, string>) => void;
    title: string;
    fields: FormField[];
    submitLabel?: string;
}

export function FormPromptModal({
    open,
    onClose,
    onSubmit,
    title,
    fields,
    submitLabel = "추가"
}: Props) {
    const [values, setValues] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open) {
            const init: Record<string, string> = {};
            for (const f of fields) init[f.name] = f.initial ?? "";
            setValues(init);
        }
    }, [open, fields]);

    const canSubmit = fields.every(f => !f.required || values[f.name]?.trim());

    function submit() {
        if (!canSubmit) return;
        const trimmed: Record<string, string> = {};
        for (const f of fields) trimmed[f.name] = (values[f.name] ?? "").trim();
        onSubmit(trimmed);
        onClose();
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>취소</Button>
                    <Button onClick={submit} disabled={!canSubmit}>{submitLabel}</Button>
                </>
            }
        >
            <div className="space-y-3">
                {fields.map((f, idx) => (
                    <div key={f.name}>
                        <Label>{f.label}</Label>
                        <TextInput
                            autoFocus={idx === 0}
                            value={values[f.name] ?? ""}
                            placeholder={f.placeholder ?? f.initial}
                            onChange={e =>
                                setValues(v => ({...v, [f.name]: e.target.value}))
                            }
                            onKeyDown={e => {
                                if (e.key === "Enter" && idx === fields.length - 1) {
                                    e.preventDefault();
                                    submit();
                                }
                            }}
                        />
                    </div>
                ))}
            </div>
        </Modal>
    );
}
