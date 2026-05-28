/**
 * 각 플랫폼별 시작 프리셋. 모든 프리셋은 기본 설정에서 적용 가능한 부분 집합.
 * 적용 후에도 사용자가 슬라이더/체크박스로 다듬을 수 있다.
 */

export interface PresetDef {
    id: string;
    name: string;
    description: string;
    badge?: string;
}

export const ghosttyPresets: PresetDef[] = [
    {id: "starter", name: "입문자 추천", description: "JetBrains Mono · 13pt · Tokyo Night · 적당한 여백", badge: "처음"},
    {id: "night", name: "눈 편한 야간용", description: "Gruvbox Dark · 부드러운 대비 · 배경 살짝 투명", badge: "야간"},
    {id: "minimal", name: "미니멀 터미널", description: "여백 0 · 타이틀바 숨김 · Default 단색 배경", badge: "미니"}
];

export interface GhosttyPresetApply {
    config: Record<string, string | number | boolean>;
    themeId?: string;
}

export function getGhosttyPreset(id: string): GhosttyPresetApply | null {
    switch (id) {
        case "starter":
            return {
                config: {"font-family": "JetBrains Mono", "font-size": 13, "window-padding-x": 8, "window-padding-y": 8, "background-opacity": 1},
                themeId: "tokyo-night"
            };
        case "night":
            return {
                config: {"font-family": "JetBrains Mono", "font-size": 14, "window-padding-x": 10, "window-padding-y": 10, "background-opacity": 0.95},
                themeId: "gruvbox-dark"
            };
        case "minimal":
            return {
                config: {"font-family": "JetBrains Mono", "font-size": 13, "window-padding-x": 0, "window-padding-y": 0, "background-opacity": 1, "window-decoration": "false"}
            };
        default:
            return null;
    }
}

export const tmuxPresets: PresetDef[] = [
    {id: "starter", name: "입문자 추천", description: "상태바 표시 · 마우스 켜기 · 베이스 인덱스 1", badge: "처음"},
    {id: "minimal", name: "미니멀", description: "상태바 숨김 · 알림 끔", badge: "미니"}
];

export const neovimPresets: PresetDef[] = [
    {id: "starter", name: "Neovim 입문 세트", description: "Tokyo Night · 줄 번호 · 클립보드 공유", badge: "처음"}
];

export const zshPresets: PresetDef[] = [
    {id: "starter", name: "입문자 추천", description: "starship 스타일 프롬프트 · git alias", badge: "처음"}
];

export const helixPresets: PresetDef[] = [
    {id: "starter", name: "입문자 추천", description: "Tokyo Night · 줄 번호 · 자동 저장", badge: "처음"}
];

export const warpPresets: PresetDef[] = [
    {id: "starter", name: "입문자 추천", description: "Tokyo Night · AI 켜기 · 기본 워크플로우", badge: "처음"}
];

export const iterm2Presets: PresetDef[] = [
    {id: "starter", name: "입문자 추천", description: "JetBrains Mono · Tokyo Night", badge: "처음"},
    {id: "minimal", name: "미니멀", description: "여백 최소 · 기본 색상", badge: "미니"}
];
