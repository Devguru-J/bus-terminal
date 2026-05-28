import {useEffect, useState} from "react";
import {Modal} from "./Modal";
import {Button} from "./Button";
import {TextInput, Label} from "./Field";

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (name: string) => void;
    title?: string;
    label?: string;
    placeholder?: string;
    initialValue?: string;
    submitLabel?: string;
}

export function SaveNameModal({
    open,
    onClose,
    onSubmit,
    title = "차고 보관",
    label = "노선 이름",
    placeholder,
    initialValue = "",
    submitLabel = "보관"
}: Props) {
    const [name, setName] = useState(initialValue);

    useEffect(() => {
        if (open) setName(initialValue);
    }, [open, initialValue]);

    function submit() {
        const trimmed = name.trim();
        if (!trimmed) return;
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
                    <Button onClick={submit} disabled={!name.trim()}>{submitLabel}</Button>
                </>
            }
        >
            <div className="space-y-2">
                <Label>{label}</Label>
                <TextInput
                    autoFocus
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={placeholder ?? initialValue}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            submit();
                        }
                    }}
                />
            </div>
        </Modal>
    );
}
