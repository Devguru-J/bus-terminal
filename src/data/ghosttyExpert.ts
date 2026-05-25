// Ghostty 페이지 Expert 모드 설정 카탈로그.
// 페이지 컴포넌트에서 분리 — 데이터 크기 56줄.

export type ExpertKind = "text" | "number" | "boolean" | "select" | "color";

export interface ExpertSetting {
    id: string;
    name: string;
    group: string;
    kind: ExpertKind;
    help: string;
    options?: string[];
}

export const EXPERT_SETTINGS: ExpertSetting[] = [
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
