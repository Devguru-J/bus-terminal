/**
 * Ghostty 설정 스키마 (초보 친화 핵심 셋).
 * 레퍼런스의 1600줄 schema 대신, "탑승 안내"에 필요한 핵심만 노출.
 * "고급 옵션은 자유 텍스트 영역으로" — 안전하게 raw도 보존.
 */

export type GhosttyField =
    | {id: string; ko: string; kind: "string"; default: string; help?: string; placeholder?: string}
    | {id: string; ko: string; kind: "number"; default: number; min?: number; max?: number; step?: number; help?: string}
    | {id: string; ko: string; kind: "boolean"; default: boolean; help?: string}
    | {id: string; ko: string; kind: "color"; default: string; help?: string}
    | {id: string; ko: string; kind: "select"; default: string; options: Array<{value: string; ko: string}>; help?: string};

export interface GhosttyGroup {
    id: string;
    ko: string;
    desc: string;
    fields: GhosttyField[];
}

export const ghosttySchema: GhosttyGroup[] = [
    {
        id: "font",
        ko: "폰트 안내",
        desc: "탑승 환경에서 사용할 글자 모양을 정합니다.",
        fields: [
            // Ghostty 기본 폰트는 내장(JetBrainsMonoNL 패밀리) — 가까운 GF 폰트로 매핑
            {id: "font-family", ko: "폰트 (font-family)", kind: "string", default: "JetBrains Mono", placeholder: "예: JetBrains Mono"},
            // ghostty 기본은 macOS 13pt
            {id: "font-size", ko: "폰트 크기 (font-size)", kind: "number", default: 13, min: 6, max: 64, step: 1},
            {id: "font-thicken", ko: "글자 굵게 보정", kind: "boolean", default: false, help: "macOS에서 가는 글자가 답답할 때 켜세요."},
            {id: "adjust-cell-height", ko: "줄 간격 보정", kind: "string", default: "", placeholder: "예: 10%"}
        ]
    },
    {
        id: "color",
        ko: "색상 도장",
        desc: "터미널의 분위기를 결정합니다.",
        fields: [
            {id: "theme", ko: "기본 테마", kind: "string", default: "", help: "Ghostty 내장 테마 이름. 비워두면 아래 색이 적용됩니다."},
            // Ghostty 기본 색상 (Xterm 계열)
            {id: "background", ko: "배경색", kind: "color", default: "#1d1f21"},
            {id: "foreground", ko: "글자색", kind: "color", default: "#ffffff"},
            {id: "cursor-color", ko: "커서 색", kind: "color", default: "#ffffff"},
            {id: "selection-background", ko: "선택 배경", kind: "color", default: "#44475a"},
            {id: "selection-foreground", ko: "선택 글자", kind: "color", default: "#ffffff"}
        ]
    },
    {
        id: "window",
        ko: "창 인테리어",
        desc: "창 패딩과 외관을 조정합니다.",
        fields: [
            // ghostty 기본 padding: 2px
            {id: "window-padding-x", ko: "가로 여백", kind: "number", default: 2, min: 0, max: 64, step: 1},
            {id: "window-padding-y", ko: "세로 여백", kind: "number", default: 2, min: 0, max: 64, step: 1},
            {id: "background-opacity", ko: "배경 투명도", kind: "number", default: 1, min: 0, max: 1, step: 0.05},
            {id: "background-blur", ko: "배경 블러", kind: "select", default: "false", options: [
                {value: "false", ko: "끄기"},
                {value: "true", ko: "켜기"},
                {value: "20", ko: "강하게 (20)"}
            ]},
            {id: "macos-titlebar-style", ko: "macOS 타이틀바", kind: "select", default: "transparent", options: [
                {value: "native", ko: "기본"},
                {value: "transparent", ko: "투명"},
                {value: "tabs", ko: "탭과 통합"},
                {value: "hidden", ko: "숨김"}
            ]}
        ]
    },
    {
        id: "cursor",
        ko: "커서 거동",
        desc: "타이핑 중 커서의 행동을 조정합니다.",
        fields: [
            {id: "cursor-style", ko: "커서 모양", kind: "select", default: "block", options: [
                {value: "block", ko: "블록 ▮"},
                {value: "bar", ko: "막대 ▏"},
                {value: "underline", ko: "밑줄 _"}
            ]},
            {id: "cursor-style-blink", ko: "커서 깜빡임", kind: "select", default: "true", options: [
                {value: "true", ko: "깜빡임"},
                {value: "false", ko: "멈춤"}
            ]},
            {id: "mouse-hide-while-typing", ko: "타이핑 중 마우스 숨김", kind: "boolean", default: true}
        ]
    },
    {
        id: "shell",
        ko: "탑승 동작",
        desc: "셸 통합과 알림 동작.",
        fields: [
            {id: "shell-integration", ko: "셸 통합", kind: "select", default: "detect", options: [
                {value: "detect", ko: "자동 감지"},
                {value: "fish", ko: "fish"},
                {value: "zsh", ko: "zsh"},
                {value: "bash", ko: "bash"},
                {value: "none", ko: "끄기"}
            ]},
            {id: "confirm-close-surface", ko: "창 닫기 전 확인", kind: "boolean", default: true},
            {id: "copy-on-select", ko: "선택 시 자동 복사", kind: "boolean", default: false}
        ]
    }
];

/** 평탄한 (key -> default) 맵 */
export function ghosttyDefaults(): Record<string, string | number | boolean> {
    const d: Record<string, string | number | boolean> = {};
    for (const g of ghosttySchema) for (const f of g.fields) d[f.id] = f.default;
    return d;
}

/**
 * Ghostty 기본 팔레트 (xterm 호환 16색).
 * 0–7: 일반, 8–15: bright. 나머지 16–255는 빈 칸 — ghostty가 알아서 채움.
 */
export const PALETTE_DEFAULT: Array<string | ""> = (() => {
    const p: Array<string | ""> = Array(256).fill("");
    const base = [
        "#000000", "#cc0000", "#4e9a06", "#c4a000",
        "#3465a4", "#75507b", "#06989a", "#d3d7cf",
        "#555753", "#ef2929", "#8ae234", "#fce94f",
        "#729fcf", "#ad7fa8", "#34e2e2", "#eeeeec"
    ];
    for (let i = 0; i < 16; i++) p[i] = base[i];
    return p;
})();
