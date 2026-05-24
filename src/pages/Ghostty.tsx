import {useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {motion} from "framer-motion";
import {StationHeader} from "@/components/shell/StationHeader";
import {Button} from "@/components/ui/Button";
import {Icon} from "@/components/ui/Icon";
import {
    Label,
    Select,
    Segmented,
    Textarea,
    RangeInput,
    TextInput,
    ColorInput
} from "@/components/ui/Field";
import {ToggleRow} from "@/components/ui/ToggleRow";
import {Toggle} from "@/components/ui/Field";
import {Modal} from "@/components/ui/Modal";
import {TerminalPreview} from "@/components/platform/TerminalPreview";
import {StatusDot} from "@/components/ui/Badge";
import {themes} from "@/data/themes";
import {useGhosttyStore} from "@/stores/ghosttyStore";
import {useRoutesStore} from "@/stores/routesStore";
import {toast} from "@/stores/toastStore";
import {cn} from "@/lib/utils";

// Google Fonts에 실제로 로드되는 폰트만 노출. (Cascadia/Iosevka는 GF에 없음)
const FONTS = [
    "JetBrains Mono",
    "Fira Code",
    "Geist Mono",
    "IBM Plex Mono",
    "Source Code Pro",
    "Roboto Mono"
];

type GhosttySection = "basic" | "advanced" | "expert";
type ExpertKind = "text" | "number" | "boolean" | "select" | "color";
interface ExpertSetting {
    id: string;
    name: string;
    group: string;
    kind: ExpertKind;
    help: string;
    options?: string[];
}

const EXPERT_SETTINGS: ExpertSetting[] = [
    {id: "title", name: "Static window title", group: "Application", kind: "text", help: "모든 Ghostty 창에 사용할 고정 제목입니다."},
    {id: "desktop-notifications", name: "Desktop notifications", group: "Application", kind: "boolean", help: "터미널 앱에서 데스크탑 알림을 보낼 수 있게 합니다."},
    {id: "config-file", name: "Additional config file", group: "Application", kind: "text", help: "추가로 불러올 Ghostty 설정 파일 경로입니다."},
    {id: "link-url", name: "Automatically link URLs", group: "Application", kind: "boolean", help: "URL 텍스트를 자동으로 클릭 가능한 링크처럼 처리합니다."},
    {id: "link-previews", name: "Show link previews", group: "Application", kind: "select", options: ["true", "false", "osc8"], help: "링크 위에 올렸을 때 미리보기를 표시할지 정합니다."},
    {id: "undo-timeout", name: "Undo timeout", group: "Application", kind: "text", help: "실수로 닫기/삭제 같은 동작을 되돌릴 수 있는 시간입니다. 예: 5s, 500ms"},
    {id: "command", name: "Command on launch", group: "Startup", kind: "text", help: "Ghostty가 시작될 때 실행할 명령입니다."},
    {id: "initial-command", name: "Initial command", group: "Startup", kind: "text", help: "앱 생명주기에서 첫 실행 시 한 번만 실행할 명령입니다."},
    {id: "env", name: "Environment variables", group: "Startup", kind: "text", help: "Ghostty 세션에 주입할 환경 변수입니다."},
    {id: "working-directory", name: "Working directory", group: "Startup", kind: "text", help: "터미널이 시작될 디렉터리입니다. home, inherit 같은 특수값도 사용할 수 있습니다."},
    {id: "fullscreen", name: "Launch fullscreen", group: "Startup", kind: "boolean", help: "Ghostty를 전체화면으로 시작합니다."},
    {id: "maximize", name: "Launch maximized", group: "Startup", kind: "boolean", help: "Ghostty 창을 최대화 상태로 시작합니다."},
    {id: "scrollback-limit", name: "Scrollback buffer size", group: "Application", kind: "number", help: "터미널이 메모리에 보관할 이전 출력 버퍼 크기입니다."},
    {id: "term", name: "TERM value", group: "Shell", kind: "text", help: "터미널 앱이 프로그램에 알려주는 TERM 환경 변수입니다. 기본은 xterm-ghostty 계열입니다."},
    {id: "shell-integration-features", name: "Shell integration features", group: "Shell", kind: "text", help: "cursor, sudo, title, ssh-env, ssh-terminfo, path 같은 셸 통합 기능을 세밀하게 켜고 끕니다."},
    {id: "window-theme", name: "Window theme", group: "Window", kind: "select", options: ["auto", "system", "light", "dark", "ghostty"], help: "Ghostty 창 UI의 밝은/어두운 테마를 정합니다."},
    {id: "window-decoration", name: "Window decorations", group: "Window", kind: "select", options: ["auto", "none", "client", "server"], help: "운영체제 창 테두리와 타이틀바 장식을 어떻게 그릴지 정합니다."},
    {id: "window-padding-balance", name: "Auto-balance padding", group: "Window", kind: "boolean", help: "창 크기와 셀 크기에 맞춰 패딩을 자동으로 균형 있게 조정합니다."},
    {id: "window-padding-color", name: "Padding color", group: "Window", kind: "select", options: ["background", "extend", "extend-always"], help: "창 패딩 영역을 배경색으로 둘지, 터미널 색을 확장할지 정합니다."},
    {id: "window-save-state", name: "Save window state", group: "Window", kind: "select", options: ["default", "never", "always"], help: "창 위치와 크기 상태를 다음 실행에 복원할지 정합니다."},
    {id: "window-show-tab-bar", name: "Show tab bar", group: "Window", kind: "select", options: ["always", "auto", "never"], help: "탭 바를 항상 보일지, 필요할 때만 보일지, 숨길지 정합니다."},
    {id: "window-new-tab-position", name: "New tab position", group: "Window", kind: "select", options: ["current", "end"], help: "새 탭을 현재 탭 옆에 만들지, 마지막에 붙일지 정합니다."},
    {id: "window-width", name: "Initial width", group: "Window", kind: "number", help: "초기 창 너비입니다. 픽셀이 아니라 터미널 셀 단위입니다."},
    {id: "window-height", name: "Initial height", group: "Window", kind: "number", help: "초기 창 높이입니다. 픽셀이 아니라 터미널 셀 단위입니다."},
    {id: "window-step-resize", name: "Resize by cell increments", group: "Window", kind: "boolean", help: "창 크기를 터미널 셀 단위에 맞춰 조정합니다."},
    {id: "resize-overlay", name: "Resize overlay", group: "Window", kind: "select", options: ["always", "never", "after-first"], help: "창 크기 변경 시 크기 정보를 오버레이로 표시할지 정합니다."},
    {id: "background-image", name: "Background image", group: "Appearance", kind: "text", help: "터미널 배경 이미지 파일 경로입니다."},
    {id: "background-image-opacity", name: "Background image opacity", group: "Appearance", kind: "number", help: "배경 이미지 투명도입니다. 0에서 1 사이 값을 사용합니다."},
    {id: "background-image-position", name: "Background image position", group: "Appearance", kind: "select", options: ["center", "top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"], help: "배경 이미지의 배치 위치입니다."},
    {id: "background-image-fit", name: "Background image fit", group: "Appearance", kind: "select", options: ["contain", "cover", "stretch", "none"], help: "배경 이미지를 창에 맞추는 방식입니다."},
    {id: "scrollbar", name: "Scrollbar visibility", group: "Appearance", kind: "select", options: ["system", "never"], help: "스크롤바 표시 방식입니다. 일부 옵션은 macOS에서만 지원됩니다."},
    {id: "split-divider-color", name: "Split divider color", group: "Appearance", kind: "color", help: "split 사이 구분선 색상입니다."},
    {id: "minimum-contrast", name: "Minimum contrast", group: "Colors", kind: "number", help: "텍스트와 배경의 최소 대비를 강제로 확보합니다. 가독성을 높이는 안전장치입니다."},
    {id: "bold-color", name: "Bold text color", group: "Colors", kind: "text", help: "굵은 글씨에 사용할 색상입니다. bright 또는 hex 색상을 쓸 수 있습니다."},
    {id: "faint-opacity", name: "Faint text opacity", group: "Colors", kind: "number", help: "희미한 텍스트가 얼마나 투명하게 보일지 정합니다."},
    {id: "selection-clear-on-typing", name: "Clear selection on typing", group: "Selection", kind: "boolean", help: "선택 영역이 있을 때 타이핑하면 선택을 해제합니다."},
    {id: "selection-clear-on-copy", name: "Clear selection on copy", group: "Selection", kind: "boolean", help: "복사 후 선택 영역을 자동으로 해제합니다."},
    {id: "selection-word-chars", name: "Word selection characters", group: "Selection", kind: "text", help: "더블클릭으로 단어를 선택할 때 단어 일부로 취급할 문자 목록입니다."},
    {id: "cursor-text", name: "Text under cursor", group: "Cursor", kind: "color", help: "블록 커서 아래 텍스트 색상입니다."},
    {id: "cursor-opacity", name: "Cursor opacity", group: "Cursor", kind: "number", help: "커서 투명도입니다. 0에서 1 사이 값을 사용합니다."},
    {id: "cursor-click-to-move", name: "Click to move cursor", group: "Mouse", kind: "boolean", help: "마우스 클릭으로 터미널 앱 안의 커서 이동을 허용합니다."},
    {id: "mouse-shift-capture", name: "Shift mouse capture", group: "Mouse", kind: "select", options: ["true", "false", "always", "never"], help: "Shift 키와 마우스 클릭 조합을 터미널 앱에 전달하는 방식을 정합니다."},
    {id: "mouse-scroll-multiplier", name: "Mouse scroll multiplier", group: "Mouse", kind: "number", help: "마우스 휠/트랙패드 스크롤 민감도입니다."},
    {id: "right-click-action", name: "Right-click action", group: "Mouse", kind: "select", options: ["context-menu", "copy-or-paste", "copy", "paste", "ignore"], help: "우클릭 시 메뉴, 복사/붙여넣기, 무시 중 어떤 동작을 할지 정합니다."},
    {id: "focus-follows-mouse", name: "Focus follows mouse", group: "Mouse", kind: "boolean", help: "마우스를 올린 split으로 자동 focus를 옮깁니다."},
    {id: "clipboard-read", name: "Clipboard read", group: "Clipboard", kind: "select", options: ["ask", "allow", "deny"], help: "터미널 앱이 클립보드를 읽을 때 허용/질문/거부할지 정합니다."},
    {id: "clipboard-write", name: "Clipboard write", group: "Clipboard", kind: "select", options: ["ask", "allow", "deny"], help: "터미널 앱이 클립보드에 쓸 때 허용/질문/거부할지 정합니다."},
    {id: "clipboard-trim-trailing-spaces", name: "Trim trailing spaces", group: "Clipboard", kind: "boolean", help: "복사할 때 줄 끝 공백을 제거합니다."},
    {id: "clipboard-paste-protection", name: "Paste protection", group: "Clipboard", kind: "boolean", help: "위험할 수 있는 붙여넣기 전에 확인합니다."},
    {id: "macos-option-as-alt", name: "Option as Alt", group: "macOS", kind: "select", options: ["", "true", "false", "left", "right"], help: "macOS Option 키를 Alt 키처럼 사용할지 정합니다."},
    {id: "macos-window-shadow", name: "Window shadow", group: "macOS", kind: "boolean", help: "macOS 창 그림자를 표시합니다."},
    {id: "macos-non-native-fullscreen", name: "Non-native fullscreen", group: "macOS", kind: "select", options: ["visible-menu", "true", "false", "padded-notch"], help: "macOS 네이티브 전체화면 대신 Ghostty 방식 전체화면을 사용합니다."},
    {id: "custom-shader", name: "Custom shader", group: "Expert", kind: "text", help: "Shadertoy 스타일 커스텀 셰이더입니다. 잘못 쓰면 렌더링이 깨질 수 있습니다."},
    {id: "custom-shader-animation", name: "Shader animation", group: "Expert", kind: "select", options: ["false", "true", "always"], help: "커스텀 셰이더 애니메이션을 허용할지 정합니다."},
    {id: "image-storage-limit", name: "Image storage limit", group: "Expert", kind: "number", help: "터미널 이미지 프로토콜용 이미지 버퍼 제한입니다."}
];

export function GhosttyPage() {
    const {config, palette, keybinds, setField, applyTheme, resetColors, importText, exportText} =
        useGhosttyStore();
    const save = useRoutesStore(s => s.save);
    const routesCount = useRoutesStore(s => s.routes.length);
    const navigate = useNavigate();

    const [importOpen, setImportOpen] = useState(false);
    const [importBuffer, setImportBuffer] = useState("");
    const [tabPosition, setTabPosition] = useState<"top" | "bottom">("top");
    const [activeSection, setActiveSection] = useState<GhosttySection>("basic");
    const [expertQuery, setExpertQuery] = useState("");

    // === field bridges
    const fontFamily = String(config["font-family"] ?? "JetBrains Mono");
    const fontSize = Number(config["font-size"] ?? 14);
    const lineHeightPct = parseInt(String(config["adjust-cell-height"] ?? "0"), 10) || 0;
    const lineHeightSlider = 100 + lineHeightPct; // 100 == 기본(1.0배), 200 == 2.0배
    const lineHeightFactor = lineHeightSlider / 100; // 미리보기에 전달용
    const cursorStyle = String(config["cursor-style"] ?? "block") as "block" | "bar" | "underline";
    const cursorBlink = String(config["cursor-style-blink"] ?? "true") === "true";
    const paddingX = Number(config["window-padding-x"] ?? 16);
    const paddingY = Number(config["window-padding-y"] ?? 16);
    const opacity = Number(config["background-opacity"] ?? 1);
    const opacityPct = Math.round(opacity * 100);
    const blur = String(config["background-blur"] ?? "false") !== "false";
    const titlebarHidden = String(config["macos-titlebar-style"] ?? "transparent") === "hidden";

    // 터미널 스타일 — 현재 background와 테마 카탈로그의 background를 매칭.
    // 일치하는 테마가 없으면 "default" (ghostty 무설정 상태)로 표기.
    const currentThemeId = useMemo(() => {
        const bg = String(config["background"] ?? "").toLowerCase();
        const match = themes.find(t => t.background.toLowerCase() === bg);
        return match?.id ?? "default";
    }, [config]);

    const exported = useMemo(() => exportText(), [config, palette, exportText]);
    const expertSettings = useMemo(() => {
        const q = expertQuery.trim().toLowerCase();
        if (!q) return EXPERT_SETTINGS;
        return EXPERT_SETTINGS.filter(item =>
            `${item.id} ${item.name} ${item.group} ${item.help}`.toLowerCase().includes(q)
        );
    }, [expertQuery]);

    function applyLineHeight(sliderVal: number) {
        const pct = sliderVal - 100;
        setField("adjust-cell-height", pct === 0 ? "" : `${pct}%`);
    }
    function setTheme(id: string) {
        if (id === "default") {
            resetColors();
            toast("터미널 색상을 기본값으로 되돌렸어요.", "info");
            return;
        }
        const t = themes.find(x => x.id === id);
        if (!t) return;
        applyTheme(t);
        toast(`"${t.ko}"으로 환승했어요.`, "success");
    }

    function handleImport() {
        if (!importBuffer.trim()) {
            toast("환승할 설정을 붙여넣어 주세요.", "warn");
            return;
        }
        const res = importText(importBuffer);
        toast(
            res.unknownLines.length
                ? `환승 완료. 알 수 없는 줄 ${res.unknownLines.length}개는 건너뛰었어요.`
                : "환승 완료. 모든 옵션을 인식했어요.",
            "success"
        );
        setImportBuffer("");
        setImportOpen(false);
    }

    function handleBoard() {
        const name = window.prompt("차고에 보관할 노선 이름?", "내 Ghostty 노선");
        if (!name) return;
        save({name, platform: "ghostty", text: exported});
        toast(`"${name}" 노선이 차고에 보관되었어요.`, "success");
    }

    function addKeybind() {
        const binding = window.prompt("Ghostty keybind", "ctrl+shift+t=new_tab");
        if (!binding?.trim()) return;
        useGhosttyStore.getState().addKeybind(binding.trim());
        toast(`${binding.trim()} 단축키를 추가했어요.`, "success");
    }

    const themeName = themes.find(t => t.id === currentThemeId)?.ko ?? "BusTerminal Dark";

    return (
        <div className="max-w-7xl mx-auto">
            <StationHeader
                title={
                    <span className="inline-flex items-center gap-3">
                        Ghostty 승강장
                        <StatusDot />
                    </span>
                }
                eyebrow="Platform 1 Active"
                subtitle="가장 사람이 가까운 터미널. 폰트·색·창 패딩을 슬라이더로 잡고, 우측 미리보기에서 즉시 확인. 완성하면 ghostty config 한 줄로 출발합니다."
                actions={
                    <>
                        <Button variant="outline" size="md" onClick={() => setImportOpen(true)}>
                            <Icon name="sync_alt" className="text-[16px]" /> 환승하기
                        </Button>
                        <Button variant="outline" size="md" onClick={handleBoard}>
                            <Icon name="bookmark_add" className="text-[16px]" /> 차고 보관
                        </Button>
                        <Button size="md" onClick={() => navigate("/export")}>
                            <Icon name="rocket_launch" className="text-[16px]" /> 출발 완료
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,560px)_minmax(520px,1fr)] gap-6 items-start">
                {/* === Left: sectioned controls === */}
                <div className="min-w-0">
                    <div className="sticky top-[72px] z-20 mb-5 rounded-xl border border-white/[0.06] bg-surface-container/95 p-2">
                        <div className="grid grid-cols-3 gap-1">
                            <SectionTab
                                active={activeSection === "basic"}
                                icon="tune"
                                label="기본"
                                onClick={() => setActiveSection("basic")}
                            />
                            <SectionTab
                                active={activeSection === "advanced"}
                                icon="manufacturing"
                                label="고급"
                                onClick={() => setActiveSection("advanced")}
                            />
                            <SectionTab
                                active={activeSection === "expert"}
                                icon="search"
                                label="전문가"
                                onClick={() => setActiveSection("expert")}
                            />
                        </div>
                    </div>

                    <div className="space-y-5">
                    {activeSection === "basic" && (
                        <>
                    {/* 1. 폰트 */}
                    <Panel title="폰트">
                        <Label help="터미널에서 사용할 글꼴입니다. 코딩용 monospace 폰트를 고르면 줄 정렬과 기호 표시가 안정적입니다.">폰트</Label>
                        <Select
                            value={fontFamily}
                            onChange={e => setField("font-family", e.target.value)}
                            className="mb-5"
                        >
                            {FONTS.map(f => (
                                <option key={f} value={f}>
                                    {f}
                                </option>
                            ))}
                        </Select>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="min-w-0">
                                <Label help="터미널 글자 크기입니다. 작게 하면 한 화면에 더 많이 보이고, 크게 하면 장시간 읽기 편합니다.">폰트 크기</Label>
                                <RangeInput
                                    value={fontSize}
                                    min={10}
                                    max={24}
                                    onChange={v => setField("font-size", v)}
                                />
                            </div>
                            <div className="min-w-0">
                                <Label help="줄 사이 간격입니다. 코드와 로그가 빽빽해 보이면 값을 올리세요.">줄간격</Label>
                                <RangeInput
                                    value={lineHeightSlider}
                                    min={100}
                                    max={200}
                                    onChange={applyLineHeight}
                                    suffix="%"
                                />
                            </div>
                        </div>
                    </Panel>

                    {/* 2. 커서 */}
                    <Panel title="커서">
                        <Label help="입력 위치를 보여주는 커서 모양입니다. block은 눈에 잘 띄고, bar는 에디터 느낌에 가깝습니다.">Style</Label>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <Segmented
                                value={cursorStyle}
                                onChange={v => setField("cursor-style", v)}
                                options={[
                                    {value: "block", label: "Block"},
                                    {value: "bar", label: "Bar"},
                                    {value: "underline", label: "Underline"}
                                ]}
                            />
                        </div>
                        <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-white/[0.05]">
                            <div>
                                <h4 className="font-mono text-code-sm text-on-surface">깜빡임</h4>
                                <p className="text-[11px] text-on-surface-variant/80 mt-1">
                                    커서가 입력 대기 중 깜빡이도록 설정
                                </p>
                            </div>
                            <Toggle
                                checked={cursorBlink}
                                onChange={v =>
                                    setField("cursor-style-blink", v ? "true" : "false")
                                }
                            />
                        </div>
                    </Panel>

                    {/* 3. 윈도우 */}
                    <Panel title="윈도우">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="min-w-0">
                                <Label help="터미널 내용과 창 좌우 가장자리 사이 여백입니다. 값이 클수록 화면이 여유로워 보입니다.">패딩 X</Label>
                                <RangeInput
                                    value={paddingX}
                                    min={0}
                                    max={48}
                                    onChange={v => setField("window-padding-x", v)}
                                />
                            </div>
                            <div className="min-w-0">
                                <Label help="터미널 내용과 창 위아래 가장자리 사이 여백입니다. 작은 값은 정보 밀도가 높고, 큰 값은 보기 편합니다.">패딩 Y</Label>
                                <RangeInput
                                    value={paddingY}
                                    min={0}
                                    max={48}
                                    onChange={v => setField("window-padding-y", v)}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <div className="flex justify-between mb-2">
                                <span className="font-mono text-label-xs uppercase tracking-[0.12em] text-on-surface-variant">
                                    투명도
                                </span>
                                <span className="font-mono text-code-sm text-primary-fixed-dim">
                                    {opacityPct}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={opacityPct}
                                onChange={e =>
                                    setField("background-opacity", Number(e.target.value) / 100)
                                }
                                className="w-full accent-primary-fixed-dim"
                            />
                        </div>
                        <div className="space-y-3">
                            <ToggleRow
                                title="블러"
                                description="배경에 backdrop-filter 적용"
                                checked={blur}
                                onChange={on => setField("background-blur", on ? "true" : "false")}
                            />
                            <ToggleRow
                                title="타이틀바"
                                description={titlebarHidden ? "Hidden (테두리 없음)" : "Transparent"}
                                checked={titlebarHidden}
                                onChange={on =>
                                    setField(
                                        "macos-titlebar-style",
                                        on ? "hidden" : "transparent"
                                    )
                                }
                            />
                        </div>
                    </Panel>

                    {/* 4. 터미널 스타일 */}
                    <Panel title="터미널 스타일">
                        <div className="space-y-4">
                            <div>
                                <Label help="배경, 글자, 커서, ANSI 16색 팔레트를 한 번에 바꾸는 색상 프리셋입니다.">테마</Label>
                                <Select
                                    value={currentThemeId}
                                    onChange={e => setTheme(e.target.value)}
                                >
                                    <option value="default">Default (테마 없음)</option>
                                    {themes.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.ko}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Label help="미리보기에서 탭 표시줄을 위 또는 아래에 배치합니다. Ghostty 탭 UI 느낌을 확인하는 용도입니다.">탭 위치</Label>
                                <Select
                                    value={tabPosition}
                                    onChange={e =>
                                        setTabPosition(e.target.value as "top" | "bottom")
                                    }
                                >
                                    <option value="top">Top</option>
                                    <option value="bottom">Bottom</option>
                                </Select>
                            </div>
                        </div>
                    </Panel>
                        </>
                    )}

                    {activeSection === "advanced" && (
                    <Panel title="고급 설정">
                        <div className="space-y-4">
                            <ToggleRow
                                title="폰트 굵기 보정"
                                description="font-thicken"
                                checked={String(config["font-thicken"] ?? "false") === "true"}
                                onChange={v => setField("font-thicken", v)}
                            />
                            <ToggleRow
                                title="선택 즉시 복사"
                                description="copy-on-select"
                                checked={String(config["copy-on-select"] ?? "false") === "true"}
                                onChange={v => setField("copy-on-select", v)}
                            />
                            <ToggleRow
                                title="타이핑 중 마우스 숨김"
                                description="mouse-hide-while-typing"
                                checked={
                                    String(config["mouse-hide-while-typing"] ?? "true") === "true"
                                }
                                onChange={v => setField("mouse-hide-while-typing", v)}
                            />
                            <ToggleRow
                                title="창 닫기 전 확인"
                                description="confirm-close-surface"
                                checked={String(config["confirm-close-surface"] ?? "true") === "true"}
                                onChange={v => setField("confirm-close-surface", v)}
                            />
                            <div>
                                <Label hint="shell-integration" help="Ghostty가 zsh, fish, bash 같은 셸과 통합되어 현재 디렉터리, 프롬프트, 명령 상태 등을 더 잘 인식하게 합니다.">셸 통합</Label>
                                <Select
                                    value={String(config["shell-integration"] ?? "detect")}
                                    onChange={e => setField("shell-integration", e.target.value)}
                                >
                                    <option value="detect">detect</option>
                                    <option value="zsh">zsh</option>
                                    <option value="fish">fish</option>
                                    <option value="bash">bash</option>
                                    <option value="none">none</option>
                                </Select>
                            </div>
                            <div>
                                <Label hint="font-feature" help="폰트의 합자나 스타일 세트를 켜고 끕니다. 예를 들어 +liga는 != 같은 조합을 한 기호처럼 보이게 할 수 있습니다.">폰트 기능</Label>
                                <Textarea
                                    className="min-h-[72px]"
                                    placeholder="+liga\n+calt\n+ss01"
                                    value={String(config["font-feature"] ?? "")}
                                    onChange={e => setField("font-feature", e.target.value)}
                                />
                            </div>
                            <div className="rounded-lg border border-white/[0.06] bg-surface-container-lowest p-3">
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <Label hint={`${keybinds.length} bindings`} help="Ghostty 자체 단축키입니다. 새 탭 열기, 창 나누기 같은 터미널 동작을 키 조합에 연결합니다.">Keybinds</Label>
                                    <Button variant="outline" size="sm" onClick={addKeybind}>
                                        <Icon name="add" className="text-[14px]" /> 추가
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {keybinds.length === 0 && (
                                        <p className="text-[12px] text-on-surface-variant/60">
                                            등록된 keybind가 없어요.
                                        </p>
                                    )}
                                    {keybinds.map(kb => (
                                        <div
                                            key={kb}
                                            className="flex items-center justify-between gap-2 rounded bg-white/[0.03] px-3 py-2"
                                        >
                                            <span className="font-mono text-[12px] text-on-surface-variant truncate">
                                                {kb}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => useGhosttyStore.getState().removeKeybind(kb)}
                                                className="text-on-surface-variant hover:text-error"
                                                aria-label={`${kb} 삭제`}
                                            >
                                                <Icon name="close" className="text-[14px]" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Panel>
                    )}

                    {activeSection === "expert" && (
                        <Panel title="전문가 설정 검색">
                            <div className="space-y-4">
                                <div>
                                    <Label help="레퍼런스 Ghostty Config처럼 더 많은 Ghostty 옵션을 검색해서 직접 설정합니다. 값이 비어 있으면 export에 포함되지 않습니다.">
                                        설정 검색
                                    </Label>
                                    <TextInput
                                        value={expertQuery}
                                        onChange={e => setExpertQuery(e.target.value)}
                                        placeholder="clipboard, window, font, macos..."
                                    />
                                </div>
                                <div className="max-h-[680px] space-y-3 overflow-y-auto pr-1">
                                    {expertSettings.map(item => (
                                        <ExpertSettingRow
                                            key={item.id}
                                            item={item}
                                            value={config[item.id]}
                                            onChange={value => setField(item.id, value)}
                                        />
                                    ))}
                                    {expertSettings.length === 0 && (
                                        <p className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-body-md text-on-surface-variant">
                                            검색 결과가 없습니다.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Panel>
                    )}
                    </div>
                </div>

                {/* === Right: Preview === */}
                <section className="min-w-0 xl:sticky xl:top-[72px]">
                    {/* Info tab strip */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <span className="inline-flex items-center gap-2 px-3 h-8 rounded bg-primary-fixed-dim/15 border border-primary-fixed-dim/30 font-mono text-label-xs uppercase tracking-[0.14em] text-primary-fixed-dim">
                            <Icon name="visibility" className="text-[14px]" /> 현재 구성
                        </span>
                        <InfoChip label="Theme" value={themeName} />
                        <InfoChip label="Font" value={`${fontFamily} ${fontSize}`} />
                        <InfoChip label="생성 파일" value={String(routesCount)} />
                    </div>

                    <motion.div layout>
                        <TerminalPreview
                            background={String(config["background"] ?? "#0e0e0e")}
                            foreground={String(config["foreground"] ?? "#e5e2e1")}
                            cursor={String(config["cursor-color"] ?? "#00e55b")}
                            selectionBg={String(config["selection-background"] ?? "#264f78")}
                            selectionFg={String(config["selection-foreground"] ?? "#ffffff")}
                            fontFamily={fontFamily}
                            fontSize={fontSize}
                            lineHeight={lineHeightFactor}
                            paddingX={paddingX}
                            paddingY={paddingY}
                            opacity={opacity}
                            cursorStyle={cursorStyle}
                            cursorBlink={cursorBlink}
                            blur={blur}
                            hideTitlebar={titlebarHidden}
                            tabPosition={tabPosition}
                            title="user@busterminal:~ — ghostty"
                        />
                    </motion.div>
                </section>
            </div>

            {/* Import modal */}
            <Modal
                open={importOpen}
                onClose={() => setImportOpen(false)}
                title="환승하기 · Import Existing Config"
                footer={
                    <>
                        <Button variant="ghost" size="sm" onClick={() => setImportOpen(false)}>
                            취소
                        </Button>
                        <Button size="sm" onClick={handleImport}>
                            <Icon name="sync_alt" className="text-[14px]" /> 환승하기
                        </Button>
                    </>
                }
            >
                <p className="text-body-md text-on-surface-variant mb-3">
                    기존{" "}
                    <code className="font-mono text-primary-fixed-dim">ghostty config</code>{" "}
                    내용을 그대로 붙여넣으세요.
                </p>
                <Textarea
                    placeholder={`font-family = JetBrains Mono\nfont-size = 14\nbackground = 1a1b26`}
                    value={importBuffer}
                    onChange={e => setImportBuffer(e.target.value)}
                />
            </Modal>
        </div>
    );
}

function Panel({title, children}: {title: string; children: React.ReactNode}) {
    return (
        <section className="rounded-xl glass-panel p-5">
            <header className="flex items-center justify-between pb-3 mb-5 border-b border-white/10">
                <h3 className="font-mono text-label-xs uppercase tracking-[0.16em] text-primary-fixed-dim">
                    {title}
                </h3>
            </header>
            {children}
        </section>
    );
}

function SectionTab({
    active,
    icon,
    label,
    onClick
}: {
    active: boolean;
    icon: string;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "h-10 rounded-lg font-mono text-label-xs uppercase tracking-[0.12em] transition inline-flex items-center justify-center gap-2",
                active
                    ? "bg-primary-fixed-dim text-on-primary"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-white/[0.04]"
            )}
        >
            <Icon name={icon} className="text-[15px]" />
            {label}
        </button>
    );
}

function ExpertSettingRow({
    item,
    value,
    onChange
}: {
    item: ExpertSetting;
    value: string | number | boolean | undefined;
    onChange: (value: string | number | boolean) => void;
}) {
    const label = (
        <Label hint={item.id} help={item.help}>
            {item.name}
        </Label>
    );

    return (
        <div className="rounded-lg border border-white/[0.06] bg-surface-container-lowest p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded border border-white/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-on-surface-variant/70">
                    {item.group}
                </span>
            </div>
            {item.kind === "boolean" ? (
                <ToggleRow
                    title={item.name}
                    description={item.id}
                    help={item.help}
                    checked={value === true || String(value) === "true"}
                    onChange={onChange}
                />
            ) : (
                <>
                    {label}
                    {item.kind === "select" ? (
                        <Select
                            value={String(value ?? "")}
                            onChange={e => onChange(e.target.value)}
                        >
                            <option value="">기본값 사용</option>
                            {item.options?.map(option => (
                                <option key={option || "empty"} value={option}>
                                    {option || "(empty)"}
                                </option>
                            ))}
                        </Select>
                    ) : item.kind === "color" ? (
                        <ColorInput
                            value={String(value ?? "")}
                            onChange={onChange}
                        />
                    ) : item.kind === "number" ? (
                        <TextInput
                            inputMode="decimal"
                            value={String(value ?? "")}
                            onChange={e => onChange(e.target.value)}
                            placeholder="기본값 사용"
                        />
                    ) : (
                        <TextInput
                            value={String(value ?? "")}
                            onChange={e => onChange(e.target.value)}
                            placeholder="기본값 사용"
                        />
                    )}
                </>
            )}
        </div>
    );
}

function InfoChip({label, value}: {label: string; value: string}) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-2 px-3 h-8 rounded",
                "bg-surface-container-low border border-white/[0.06]",
                "font-mono text-[11px] text-on-surface-variant"
            )}
        >
            <span className="uppercase tracking-[0.12em] text-on-surface-variant/60">
                {label}:
            </span>
            <span className="text-on-surface truncate max-w-[180px]">{value}</span>
        </span>
    );
}
