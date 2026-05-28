import {useState, useCallback, type ReactNode} from "react";
import {Modal} from "./Modal";
import {Button} from "./Button";

interface ConfirmOptions {
    title?: string;
    message: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
}

interface State extends ConfirmOptions {
    open: boolean;
    resolve?: (v: boolean) => void;
}

export function useConfirmDialog() {
    const [state, setState] = useState<State>({open: false, message: ""});

    const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
        return new Promise(resolve => {
            setState({...opts, open: true, resolve});
        });
    }, []);

    function close(result: boolean) {
        state.resolve?.(result);
        setState(s => ({...s, open: false, resolve: undefined}));
    }

    const dialog = (
        <Modal
            open={state.open}
            onClose={() => close(false)}
            title={state.title ?? "확인"}
            footer={
                <>
                    <Button variant="ghost" onClick={() => close(false)}>
                        {state.cancelLabel ?? "취소"}
                    </Button>
                    <Button
                        variant={state.danger ? "danger" : "primary"}
                        onClick={() => close(true)}
                    >
                        {state.confirmLabel ?? "확인"}
                    </Button>
                </>
            }
        >
            <div className="text-body-md text-on-surface leading-relaxed">
                {state.message}
            </div>
        </Modal>
    );

    return {confirm, dialog};
}
