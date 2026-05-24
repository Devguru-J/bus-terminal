import {useState} from "react";
import {Modal} from "@/components/ui/Modal";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {Textarea} from "@/components/ui/Field";
import {Badge} from "@/components/ui/Badge";
import type {ImportResult} from "@/lib/importers";

interface Props<T> {
    open: boolean;
    onClose: () => void;
    title: string;
    /** 파일 input의 accept (확장자) */
    accept: string;
    /** 텍스트 placeholder */
    placeholder?: string;
    /** 텍스트 → 파싱 결과 */
    parse: (text: string) => ImportResult<T>;
    /** "환승하기" 클릭 시 호출 — 파서 결과의 value를 받음 */
    onApply: (result: ImportResult<T>) => void;
    /** 안내 문구 */
    hint?: string;
}

/**
 * 범용 환승하기(Import) 마법사.
 * - 텍스트 붙여넣기 또는 파일 업로드
 * - 실시간으로 파싱 통계 (applied / unknown / warning) 표시
 * - "환승하기" 클릭 시 onApply 호출
 */
export function ImportWizard<T>({
    open,
    onClose,
    title,
    accept,
    placeholder,
    parse,
    onApply,
    hint
}: Props<T>) {
    const [text, setText] = useState("");
    const [filename, setFilename] = useState<string | null>(null);

    const result = text.trim() ? parse(text) : null;

    function handleFile() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = accept;
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            const content = await file.text();
            setText(content);
            setFilename(file.name);
        };
        input.click();
    }

    function reset() {
        setText("");
        setFilename(null);
    }

    function handleApply() {
        if (!result) return;
        onApply(result);
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
            title={title}
            footer={
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            reset();
                            onClose();
                        }}
                    >
                        취소
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleApply}
                        disabled={!result || result.applied === 0}
                    >
                        <Icon name="sync_alt" className="text-[14px]" />
                        환승하기 ({result?.applied ?? 0}개 적용)
                    </Button>
                </>
            }
        >
            <div className="space-y-3">
                {hint && (
                    <p className="text-[12px] text-on-surface-variant">{hint}</p>
                )}
                <div className="flex items-center justify-between gap-3">
                    <Button variant="outline" size="sm" onClick={handleFile}>
                        <Icon name="file_upload" className="text-[14px]" />
                        파일 선택
                    </Button>
                    {filename && (
                        <span className="font-mono text-[11px] text-on-surface-variant truncate">
                            {filename}
                        </span>
                    )}
                </div>
                <Textarea
                    value={text}
                    onChange={e => {
                        setText(e.target.value);
                        if (filename) setFilename(null);
                    }}
                    placeholder={
                        placeholder ?? "여기에 설정 파일 내용을 붙여넣거나 파일을 선택하세요."
                    }
                    rows={10}
                    className="font-mono text-[12px]"
                />
                {result && (
                    <div className="flex flex-wrap gap-2">
                        <Badge tone={result.applied ? "active" : "muted"}>
                            ✓ {result.applied} 적용
                        </Badge>
                        <Badge tone={result.unknownLines.length ? "warn" : "muted"}>
                            ? {result.unknownLines.length} 미인식
                        </Badge>
                        {result.warnings.length > 0 && (
                            <Badge tone="warn">! {result.warnings.length} 경고</Badge>
                        )}
                    </div>
                )}
                {result && result.unknownLines.length > 0 && (
                    <details className="rounded-lg border border-white/[0.06] bg-surface-container-lowest p-3">
                        <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                            미인식 줄 {result.unknownLines.length}개 보기
                        </summary>
                        <pre className="mt-2 text-[11px] font-mono text-on-surface-variant/80 whitespace-pre-wrap max-h-40 overflow-y-auto">
                            {result.unknownLines.slice(0, 100).join("\n")}
                            {result.unknownLines.length > 100 && "\n..."}
                        </pre>
                    </details>
                )}
            </div>
        </Modal>
    );
}
