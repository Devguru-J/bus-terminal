import {useMemo, useState} from "react";
import {Modal} from "@/components/ui/Modal";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {TextInput, Textarea, Select} from "@/components/ui/Field";
import {Badge} from "@/components/ui/Badge";
import {detectThemeFormat, importTheme, type ThemeFormat} from "@/lib/themeImporters";
import {useUserThemesStore} from "@/stores/userThemesStore";
import {toast} from "@/stores/toastStore";

interface Props {
    open: boolean;
    onClose: () => void;
    /** import 성공 시 호출 (id를 전달해서 호출 측이 active로 만들 수 있음) */
    onImported?: (themeId: string) => void;
}

const FORMAT_HINTS: Record<ThemeFormat, string> = {
    iterm2: "iTerm2 .itermcolors plist 형식이 인식됐어요.",
    base16: "Base16 YAML 형식 (base00~base0F) 이 인식됐어요.",
    vim: "Vim colorscheme (highlight Normal guifg=... guibg=...) 이 인식됐어요.",
    ghostty: "Ghostty config 스니펫이 인식됐어요.",
    unknown: "포맷을 자동 인식하지 못했어요. 강제로 지정해 보세요."
};

const ACCEPT = ".itermcolors,.yaml,.yml,.vim,.txt,.conf";

export function ImportThemeModal({open, onClose, onImported}: Props) {
    const add = useUserThemesStore(s => s.add);
    const [text, setText] = useState("");
    const [filename, setFilename] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [forcedFormat, setForcedFormat] = useState<ThemeFormat | "auto">("auto");

    const detected = useMemo<ThemeFormat>(
        () => (text.trim() ? detectThemeFormat(text) : "unknown"),
        [text]
    );
    const usedFormat: ThemeFormat = forcedFormat === "auto" ? detected : forcedFormat;
    const result = useMemo(
        () => (text.trim() ? importTheme(text, usedFormat) : null),
        [text, usedFormat]
    );

    function handleFile() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ACCEPT;
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            const content = await file.text();
            setText(content);
            setFilename(file.name);
            // 파일 이름을 기본 이름으로 채움
            if (!name) {
                const base = file.name.replace(/\.(itermcolors|yaml|yml|vim|txt|conf)$/i, "");
                setName(base);
            }
        };
        input.click();
    }

    function reset() {
        setText("");
        setFilename(null);
        setName("");
        setForcedFormat("auto");
    }

    function handleApply() {
        if (!result?.ok || !result.theme) return;
        const ko = name.trim() || "Imported Theme";
        const added = add({...result.theme, ko});
        toast(`"${ko}" 테마를 차고에 추가했어요.`, "success");
        onImported?.(added.id);
        reset();
        onClose();
    }

    return (
        <Modal
            open={open}
            onClose={() => {
                reset();
                onClose();
            }}
            title="외부 테마 가져오기"
            footer={
                <>
                    <Button variant="outline" size="sm" onClick={() => {reset(); onClose();}}>
                        취소
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleApply}
                        disabled={!result?.ok}
                    >
                        <Icon name="add" className="text-[14px]" />
                        {result?.ok ? "테마 추가" : "추가 불가"}
                    </Button>
                </>
            }
        >
            <div className="space-y-3">
                <p className="text-[12px] text-on-surface-variant">
                    iTerm2 .itermcolors / Base16 YAML / Vim colorscheme / Ghostty 스니펫 4종 자동 인식.
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={handleFile}>
                        <Icon name="file_upload" className="text-[14px]" />
                        파일 선택
                    </Button>
                    {filename && (
                        <span className="font-mono text-[11px] text-on-surface-variant truncate">
                            {filename}
                        </span>
                    )}
                    <Select
                        value={forcedFormat}
                        onChange={e => setForcedFormat(e.target.value as ThemeFormat | "auto")}
                        className="ml-auto w-36"
                    >
                        <option value="auto">자동 인식</option>
                        <option value="iterm2">iTerm2</option>
                        <option value="base16">Base16 YAML</option>
                        <option value="vim">Vim colorscheme</option>
                        <option value="ghostty">Ghostty 스니펫</option>
                    </Select>
                </div>
                <Textarea
                    value={text}
                    onChange={e => {
                        setText(e.target.value);
                        if (filename) setFilename(null);
                    }}
                    placeholder="테마 파일 내용을 붙여넣거나 위에서 파일을 선택하세요."
                    rows={9}
                    className="font-mono text-[11px]"
                />

                {text.trim() && (
                    <div className="flex flex-wrap gap-2 items-center">
                        <Badge tone={usedFormat === "unknown" ? "warn" : "active"}>
                            {usedFormat === "unknown" ? "포맷 미인식" : usedFormat}
                        </Badge>
                        <span className="text-[11px] text-on-surface-variant">
                            {FORMAT_HINTS[usedFormat]}
                        </span>
                    </div>
                )}

                {result?.warnings && result.warnings.length > 0 && (
                    <div className="rounded-lg border border-tertiary-fixed-dim/20 bg-tertiary-fixed-dim/[0.06] px-3 py-2 text-[11px] text-tertiary-fixed-dim space-y-0.5">
                        {result.warnings.map((w, i) => (
                            <div key={i}>⚠ {w}</div>
                        ))}
                    </div>
                )}

                {result?.ok && result.theme && (
                    <div className="space-y-3">
                        <div>
                            <label className="block font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant mb-1">
                                테마 이름
                            </label>
                            <TextInput
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="My Imported Theme"
                            />
                        </div>
                        <div
                            className="rounded-lg border border-white/[0.06] overflow-hidden"
                            style={{background: result.theme.background, color: result.theme.foreground}}
                        >
                            <div className="p-3 font-mono text-[12px]">
                                <span style={{color: result.theme.accent}}>❯</span> theme preview
                                {"\n"}— {name.trim() || "Imported"}
                            </div>
                            <div className="flex">
                                {result.theme.palette16.map((c, i) => (
                                    <span
                                        key={i}
                                        className="h-4 flex-1"
                                        style={{background: c}}
                                        title={`${i}: ${c}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
