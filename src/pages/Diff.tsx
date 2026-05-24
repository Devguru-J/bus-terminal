import {useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {StationHeader} from "@/components/shell/StationHeader";
import {DiffViewer, type DiffLine} from "@/components/platform/DiffViewer";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {Badge} from "@/components/ui/Badge";
import {ghosttyDefaults} from "@/data/ghosttySchema";
import {useGhosttyStore} from "@/stores/ghosttyStore";
import {useRoutesStore} from "@/stores/routesStore";
import {toast} from "@/stores/toastStore";

export function DiffPage() {
    const {config, exportText} = useGhosttyStore();
    const save = useRoutesStore(s => s.save);
    const [changedOnly, setChangedOnly] = useState(false);
    const navigate = useNavigate();
    const defaults = ghosttyDefaults();

    const {base, target, removed, added, mutated} = useMemo(() => {
        const baseLines: DiffLine[] = [];
        const targetLines: DiffLine[] = [];
        let n = 1;
        let removedCount = 0;
        let addedCount = 0;
        let mutatedCount = 0;
        const keys = Object.keys(defaults);
        for (const k of keys) {
            const d = defaults[k];
            const v = config[k];
            const sameDef = d === v;
            // Only show keys that are not the default OR are interesting (color/font)
            const interesting =
                k === "font-family" ||
                k === "font-size" ||
                k === "window-padding-x" ||
                k === "window-padding-y" ||
                k === "background" ||
                k === "background-opacity" ||
                k === "cursor-style" ||
                k === "cursor-color" ||
                k === "theme";
            if (!interesting || (changedOnly && sameDef)) continue;
            if (sameDef) {
                baseLines.push({n: n, type: "context", text: `${k} = ${formatVal(d)}`});
                targetLines.push({n: n, type: "context", text: `${k} = ${formatVal(v)}`});
            }
            else {
                baseLines.push({n: n, type: "remove", text: `${k} = ${formatVal(d)}`});
                targetLines.push({n: n, type: "add", text: `${k} = ${formatVal(v)}`});
                mutatedCount++;
            }
            n++;
        }
        // Added cursor-blink as illustration
        if (config["cursor-style-blink"] && config["cursor-style-blink"] !== defaults["cursor-style-blink"]) {
            targetLines.push({n: n, type: "add", text: `cursor-blink = true`});
            addedCount++;
        }
        return {
            base: baseLines,
            target: targetLines,
            removed: removedCount,
            added: addedCount,
            mutated: mutatedCount
        };
    }, [changedOnly, config, defaults]);

    return (
        <div className="max-w-7xl mx-auto">
            <StationHeader
                title="설정 비교"
                eyebrow="Diff Analysis Active"
                subtitle={
                    <span className="inline-flex items-center gap-3">
                        <Badge tone="active">{mutated} 변경</Badge>
                        <Badge tone="info">{added} 추가</Badge>
                        <Badge tone="danger">{removed} 제거</Badge>
                    </span>
                }
                actions={
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setChangedOnly(v => !v)}
                        >
                            <Icon name="tune" className="text-[14px]" />
                            {changedOnly ? "Show Context" : "Changes Only"}
                        </Button>
                        <Button size="sm" onClick={() => navigate("/export")}>
                            <Icon name="upload" className="text-[14px]" /> Export
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <DiffViewer title="Base · Work Route" filename="ghostty.conf" lines={base} />
                <DiffViewer title="Target · Personal Route" filename="ghostty.conf" lines={target} />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 rounded-xl border border-white/[0.06] bg-surface-container-lowest/60 px-5 py-4">
                <p className="text-body-md text-on-surface-variant">
                    변경 사항을 새 노선으로 병합하거나 출발권으로 바로 보냅니다.
                </p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate("/ghostty")}>
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => {
                            save({
                                name: `Diff merged ${new Date().toLocaleTimeString()}`,
                                platform: "ghostty",
                                text: exportText()
                            });
                            toast("변경사항을 새 Ghostty 노선으로 보관했어요.", "success");
                            navigate("/export");
                        }}
                    >
                        Save Merged Route
                    </Button>
                </div>
            </div>
        </div>
    );
}

function formatVal(v: unknown): string {
    if (typeof v === "string") {
        if (v === "") return '""';
        if (/[a-zA-Z]/.test(v) && !v.startsWith("#")) return `"${v}"`;
        return v;
    }
    return String(v);
}
