import {useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {StationHeader} from "@/components/shell/StationHeader";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {ConfigPanel} from "@/components/platform/ConfigPanel";
import {
    Label,
    NumberInput,
    Segmented,
    Select,
    RangeInput,
    TextInput
} from "@/components/ui/Field";
import {ToggleRow} from "@/components/ui/ToggleRow";
import {Badge} from "@/components/ui/Badge";
import {TerminalPreview} from "@/components/platform/TerminalPreview";
import {ITERM_FONT_FAMILIES} from "@/data/iterm2";
import {useIterm2Store} from "@/stores/iterm2Store";
import {useRoutesStore} from "@/stores/routesStore";
import {toast} from "@/stores/toastStore";

export function Iterm2Page() {
    const {profile, setField, setAnsi, exportColors, exportProfile} = useIterm2Store();
    const save = useRoutesStore(s => s.save);
    const navigate = useNavigate();
    const colorsText = useMemo(() => exportColors(), [profile, exportColors]);

    function handleSave() {
        const name = window.prompt("차고에 보관할 프로파일 이름?", profile.profileName);
        if (!name) return;
        save({name, platform: "iterm2", text: colorsText});
        toast(`"${name}" 프로파일이 차고에 보관되었어요.`, "success");
    }

    function importItermColors() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".itermcolors,.xml,.plist";
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            const text = await file.text();
            const colors = parseItermColors(text);
            if (!colors) {
                toast("색상 파일을 읽지 못했어요.", "warn");
                return;
            }
            applyParsedColors(colors);
            toast(`${file.name}에서 ${Object.keys(colors).length}개의 색상을 가져왔어요.`, "success");
        };
        input.click();
    }

    function applyParsedColors(map: Record<string, string>) {
        const ansiMatches: Array<[number, string]> = [];
        for (const [k, v] of Object.entries(map)) {
            const m = k.match(/^Ansi (\d+) Color$/);
            if (m) ansiMatches.push([Number(m[1]), v]);
        }
        ansiMatches.forEach(([i, c]) => setAnsi(i, c));
        const mapField = (key: string, field: keyof typeof profile) => {
            if (map[key]) setField(field, map[key] as never);
        };
        mapField("Background Color", "background");
        mapField("Foreground Color", "foreground");
        mapField("Cursor Color", "cursor");
        mapField("Cursor Text Color", "cursorText");
        mapField("Selection Color", "selection");
        mapField("Selected Text Color", "selectedText");
        mapField("Bold Color", "bold");
        mapField("Link Color", "link");
        mapField("Badge Color", "badge");
        mapField("Tab Color", "tabColor");
        mapField("Underline Color", "underline");
    }

    return (
        <div className="max-w-7xl mx-auto">
            <StationHeader
                title="iTerm2 승강장"
                eyebrow="Platform 3 Active"
                subtitle="macOS 대표 터미널. .itermcolors 컬러 프리셋과 Dynamic Profile JSON 두 벌이 출발권에 함께 실립니다."
                actions={
                    <>
                        <Button variant="outline" size="sm" onClick={importItermColors}>
                            <Icon name="file_upload" className="text-[16px]" /> .itermcolors 가져오기
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleSave}>
                            <Icon name="bookmark_add" className="text-[16px]" /> 차고 보관
                        </Button>
                        <Button size="sm" onClick={() => navigate("/export")}>
                            <Icon name="rocket_launch" className="text-[16px]" /> 출발권 만들기
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
                <div className="space-y-5 min-w-0">
                    <ConfigPanel
                        title="Profile / Font"
                        actions={
                            <span className="font-mono text-[10px] text-on-surface-variant/60">
                                Profiles › Text
                            </span>
                        }
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <Label hint="profileName" help="iTerm2에서 표시될 프로파일 이름.">
                                    Profile Name
                                </Label>
                                <TextInput
                                    value={profile.profileName}
                                    onChange={e => setField("profileName", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label
                                    hint="Normal Font"
                                    help="등폭 폰트 권장. Nerd Font를 쓰면 아이콘이 함께 표시됩니다."
                                >
                                    Font Family
                                </Label>
                                <Select
                                    value={profile.fontFamily}
                                    onChange={e => setField("fontFamily", e.target.value)}
                                >
                                    {ITERM_FONT_FAMILIES.map(f => (
                                        <option key={f} value={f}>
                                            {f}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Label hint="size" help="폰트 크기 (pt)">
                                    Font Size
                                </Label>
                                <NumberInput
                                    value={profile.fontSize}
                                    min={8}
                                    max={36}
                                    onChange={e =>
                                        setField("fontSize", Number(e.target.value) || 12)
                                    }
                                />
                            </div>
                            <div>
                                <Label
                                    hint="Thin Strokes"
                                    help="가는 글자의 anti-aliasing 강도. 어두운 배경에 글자가 흐려 보이면 always 권장."
                                >
                                    Thin Strokes
                                </Label>
                                <Select
                                    value={profile.useThinStrokes}
                                    onChange={e =>
                                        setField(
                                            "useThinStrokes",
                                            e.target.value as typeof profile.useThinStrokes
                                        )
                                    }
                                >
                                    <option value="never">Never</option>
                                    <option value="dark-bg">Dark Background Only</option>
                                    <option value="retina">Retina Only</option>
                                    <option value="always">Always</option>
                                </Select>
                            </div>
                            <div>
                                <Label hint="horizontal-spacing" help="문자 가로 간격 배율">
                                    Horizontal Spacing
                                </Label>
                                <RangeInput
                                    value={profile.horizontalSpacing}
                                    min={0.5}
                                    max={2}
                                    step={0.05}
                                    onChange={v => setField("horizontalSpacing", v)}
                                />
                            </div>
                            <div>
                                <Label hint="vertical-spacing" help="줄 높이 배율">
                                    Vertical Spacing
                                </Label>
                                <RangeInput
                                    value={profile.verticalSpacing}
                                    min={0.5}
                                    max={2}
                                    step={0.05}
                                    onChange={v => setField("verticalSpacing", v)}
                                />
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <ToggleRow
                                title="Bold Font"
                                description="굵은 글자에 굵은 폰트 사용"
                                checked={profile.useBoldFont}
                                onChange={v => setField("useBoldFont", v)}
                            />
                            <ToggleRow
                                title="Italic Font"
                                description="이탤릭 글자에 이탤릭 폰트 사용"
                                checked={profile.useItalicFont}
                                onChange={v => setField("useItalicFont", v)}
                            />
                        </div>
                    </ConfigPanel>

                    <ConfigPanel
                        title="Window & Transparency"
                        actions={<Badge tone="info">Window</Badge>}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <Label hint="columns" help="기본 윈도우 가로 글자 수">
                                    Columns
                                </Label>
                                <NumberInput
                                    value={profile.columns}
                                    min={20}
                                    max={300}
                                    onChange={e =>
                                        setField("columns", Number(e.target.value) || 80)
                                    }
                                />
                            </div>
                            <div>
                                <Label hint="rows" help="기본 윈도우 세로 줄 수">
                                    Rows
                                </Label>
                                <NumberInput
                                    value={profile.rows}
                                    min={5}
                                    max={120}
                                    onChange={e =>
                                        setField("rows", Number(e.target.value) || 25)
                                    }
                                />
                            </div>
                            <div>
                                <Label hint="transparency" help="0=불투명, 1=완전 투명">
                                    Transparency
                                </Label>
                                <RangeInput
                                    value={profile.transparency}
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    onChange={v => setField("transparency", v)}
                                />
                            </div>
                            <div>
                                <Label hint="blur-radius" help="배경 블러 강도 (0-30)">
                                    Blur Radius
                                </Label>
                                <RangeInput
                                    value={profile.blurRadius}
                                    min={0}
                                    max={30}
                                    step={1}
                                    onChange={v => setField("blurRadius", v)}
                                />
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <ToggleRow
                                title="배경 블러"
                                description="투명 윈도우 + 배경 블러"
                                checked={profile.blur}
                                onChange={v => setField("blur", v)}
                            />
                            <ToggleRow
                                title="블링킹 커서"
                                description="커서 깜빡임"
                                checked={profile.blinkingCursor}
                                onChange={v => setField("blinkingCursor", v)}
                            />
                        </div>
                    </ConfigPanel>

                    <ConfigPanel
                        title="Cursor & Keys"
                        actions={<Badge tone="warn">behavior</Badge>}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <Label hint="cursor-type" help="커서 모양">
                                    Cursor Type
                                </Label>
                                <Segmented
                                    value={profile.cursorType}
                                    onChange={v => setField("cursorType", v)}
                                    options={[
                                        {value: "block", label: "Block"},
                                        {value: "vertical-bar", label: "Bar"},
                                        {value: "underline", label: "Under"}
                                    ]}
                                />
                            </div>
                            <div>
                                <Label
                                    hint="minimum-contrast"
                                    help="배경과 글자 색 대비 최소값. 가독성 강제 보정."
                                >
                                    Min Contrast
                                </Label>
                                <RangeInput
                                    value={profile.minimumContrast}
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    onChange={v => setField("minimumContrast", v)}
                                />
                            </div>
                            <div>
                                <Label
                                    hint="left-option"
                                    help="Vim/tmux에서 Meta 키를 쓰려면 Esc+ 권장"
                                >
                                    Left Option
                                </Label>
                                <Select
                                    value={profile.optionAsMeta}
                                    onChange={e =>
                                        setField(
                                            "optionAsMeta",
                                            e.target.value as typeof profile.optionAsMeta
                                        )
                                    }
                                >
                                    <option value="normal">Normal</option>
                                    <option value="esc-plus">Esc+</option>
                                    <option value="meta">Meta</option>
                                </Select>
                            </div>
                            <div>
                                <Label hint="right-option" help="오른쪽 Option 키 동작">
                                    Right Option
                                </Label>
                                <Select
                                    value={profile.rightOptionAsMeta}
                                    onChange={e =>
                                        setField(
                                            "rightOptionAsMeta",
                                            e.target
                                                .value as typeof profile.rightOptionAsMeta
                                        )
                                    }
                                >
                                    <option value="normal">Normal</option>
                                    <option value="esc-plus">Esc+</option>
                                    <option value="meta">Meta</option>
                                </Select>
                            </div>
                        </div>
                    </ConfigPanel>

                    <ConfigPanel
                        title="Hotkey Window"
                        actions={
                            <Badge tone={profile.hotkeyEnabled ? "active" : "muted"}>
                                {profile.hotkeyEnabled ? "ON" : "OFF"}
                            </Badge>
                        }
                    >
                        <ToggleRow
                            title="핫키 윈도우 활성화"
                            description="단축키로 어디서든 호출되는 드롭다운 터미널"
                            checked={profile.hotkeyEnabled}
                            onChange={v => setField("hotkeyEnabled", v)}
                        />
                        {profile.hotkeyEnabled && (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <Label hint="key" help="단축키 메인 키 (F12, `, space 등)">
                                        Key
                                    </Label>
                                    <TextInput
                                        value={profile.hotkeyKey}
                                        onChange={e => setField("hotkeyKey", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label
                                        hint="modifiers"
                                        help="콤마 구분 (cmd, opt, ctrl, shift)"
                                    >
                                        Modifiers
                                    </Label>
                                    <TextInput
                                        value={profile.hotkeyModifiers.join(",")}
                                        onChange={e =>
                                            setField(
                                                "hotkeyModifiers",
                                                e.target.value
                                                    .split(",")
                                                    .map(x => x.trim())
                                                    .filter(Boolean)
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        )}
                    </ConfigPanel>

                    <ConfigPanel
                        title="ANSI Palette"
                        actions={
                            <span className="font-mono text-[10px] text-on-surface-variant/60">
                                16 colors
                            </span>
                        }
                    >
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                            {profile.ansi.map((c, i) => (
                                <label
                                    key={i}
                                    className="flex flex-col items-center gap-1 text-[10px] text-on-surface-variant"
                                >
                                    <input
                                        type="color"
                                        value={c}
                                        onChange={e => setAnsi(i, e.target.value)}
                                        className="h-10 w-full rounded border border-white/10 bg-transparent cursor-pointer"
                                    />
                                    <span className="font-mono">{i.toString(16)}</span>
                                </label>
                            ))}
                        </div>
                    </ConfigPanel>
                </div>

                <div className="space-y-5">
                    <ConfigPanel
                        title="실시간 미리보기"
                        actions={<Badge tone="info">iTerm2</Badge>}
                    >
                        <TerminalPreview
                            background={profile.background}
                            foreground={profile.foreground}
                            cursor={profile.cursor}
                            selectionBg={profile.selection}
                            selectionFg={profile.selectedText}
                            fontFamily={profile.fontFamily}
                            fontSize={profile.fontSize}
                            paddingX={12}
                            paddingY={12}
                            opacity={1 - profile.transparency}
                            title={profile.profileName}
                            cursorStyle={
                                profile.cursorType === "vertical-bar"
                                    ? "bar"
                                    : profile.cursorType === "underline"
                                      ? "underline"
                                      : "block"
                            }
                            cursorBlink={profile.blinkingCursor}
                            blur={profile.blur}
                            hideTitlebar={false}
                            tabPosition="top"
                        />
                    </ConfigPanel>

                    <ConfigPanel title="UI 색상">
                        <div className="space-y-2">
                            {(
                                [
                                    ["background", "Background"],
                                    ["foreground", "Foreground"],
                                    ["cursor", "Cursor"],
                                    ["selection", "Selection"],
                                    ["bold", "Bold"],
                                    ["link", "Link"],
                                    ["badge", "Badge"],
                                    ["tabColor", "Tab"]
                                ] as const
                            ).map(([k, label]) => (
                                <label
                                    key={k}
                                    className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-surface-container-lowest px-3 py-2"
                                >
                                    <span className="font-mono text-[12px] text-on-surface-variant">
                                        {label}
                                    </span>
                                    <input
                                        type="color"
                                        value={profile[k]}
                                        onChange={e => setField(k, e.target.value)}
                                        className="h-7 w-12 rounded border border-white/10 bg-transparent cursor-pointer"
                                    />
                                </label>
                            ))}
                        </div>
                    </ConfigPanel>
                </div>
            </div>
        </div>
    );
}

/** .itermcolors plist XML 파서 (느슨한 정규식 기반 — 폼/색 키만 추출). */
function parseItermColors(xml: string): Record<string, string> | null {
    try {
        const result: Record<string, string> = {};
        const dictRe =
            /<key>([^<]+)<\/key>\s*<dict>([\s\S]*?)<\/dict>/g;
        let m: RegExpExecArray | null;
        while ((m = dictRe.exec(xml))) {
            const [, key, body] = m;
            const r = extractReal(body, "Red Component");
            const g = extractReal(body, "Green Component");
            const b = extractReal(body, "Blue Component");
            if (r != null && g != null && b != null) {
                result[key] = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
            }
        }
        return Object.keys(result).length ? result : null;
    }
    catch {
        return null;
    }
}

function extractReal(body: string, key: string): number | null {
    const re = new RegExp(
        `<key>${key}<\\/key>\\s*<real>([0-9eE.+\\-]+)<\\/real>`
    );
    const m = body.match(re);
    if (!m) return null;
    const n = Number(m[1]);
    return isNaN(n) ? null : n;
}

function toHex(v: number): string {
    return Math.round(Math.max(0, Math.min(1, v)) * 255)
        .toString(16)
        .padStart(2, "0");
}
