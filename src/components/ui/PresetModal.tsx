import {Modal} from "./Modal";
import {Button} from "./Button";

export interface Preset {
    id: string;
    name: string;
    description: string;
    badge?: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onSelect: (id: string) => void;
    presets: Preset[];
    title?: string;
}

export function PresetModal({open, onClose, onSelect, presets, title = "프리셋 선택"}: Props) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            footer={<Button variant="ghost" onClick={onClose}>닫기</Button>}
        >
            <p className="text-body-sm text-on-surface-variant mb-3">
                프리셋을 누르면 해당 설정 묶음이 즉시 적용됩니다. 적용 후에도 슬라이더와 체크박스로 자유롭게 다듬을 수 있어요.
            </p>
            <div className="space-y-2">
                {presets.map(p => (
                    <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                            onSelect(p.id);
                            onClose();
                        }}
                        className="w-full text-left rounded-lg border border-white/[0.06] bg-surface-container-lowest/80 hover:bg-surface-container-low hover:border-primary-fixed-dim/40 transition p-3 group"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-display text-title-md text-on-surface group-hover:text-primary-fixed-dim transition">
                                {p.name}
                            </span>
                            {p.badge && (
                                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary-fixed-dim/80">
                                    {p.badge}
                                </span>
                            )}
                        </div>
                        <p className="text-body-sm text-on-surface-variant leading-relaxed">
                            {p.description}
                        </p>
                    </button>
                ))}
            </div>
        </Modal>
    );
}
