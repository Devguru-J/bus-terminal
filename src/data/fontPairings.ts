/**
 * 폰트 페어링 추천 — 코드용 monospace + UI/문서용 sans 짝.
 *
 * 큐레이션 기준: 같은 그로테스크 어휘권에 있거나, 시각적 균형이 검증된 조합.
 */

export interface FontPairing {
    id: string;
    mono: string; // FontEntry.id (monospace)
    sans: string; // FontEntry.id (sans)
    name: string;
    description: string;
    vibe: "classic" | "modern" | "warm" | "editorial" | "korean";
}

export const fontPairings: FontPairing[] = [
    {
        id: "geist-pair",
        mono: "geist-mono",
        sans: "inter",
        name: "Geist Mono · Inter",
        description:
            "Vercel의 Geist Mono와 Inter는 둘 다 화면 가독성을 우선한 현대적 그로테스크. 가장 안전한 모던 조합.",
        vibe: "modern"
    },
    {
        id: "jetbrains-pair",
        mono: "jetbrains-mono",
        sans: "inter",
        name: "JetBrains Mono · Inter",
        description:
            "코드 가독성의 표준 + UI 가독성의 표준. 어느 프로젝트에도 잘 어울리는 조합.",
        vibe: "modern"
    },
    {
        id: "berkeley-pair",
        mono: "berkeley-mono",
        sans: "inter",
        name: "Berkeley Mono · Inter",
        description:
            "유료 프리미엄 모노와 무료 모던 sans. 손글씨 같은 따스함과 정밀한 산세리프의 대비.",
        vibe: "warm"
    },
    {
        id: "ibm-plex-pair",
        mono: "ibm-plex-mono",
        sans: "inter",
        name: "IBM Plex Mono · Inter",
        description:
            "IBM 디자인 시스템의 진지함을 그대로 — 진지한 엔터프라이즈 톤. Plex Sans를 갖춰두면 더 좋음.",
        vibe: "editorial"
    },
    {
        id: "fira-pair",
        mono: "fira-code",
        sans: "inter",
        name: "Fira Code · Inter",
        description:
            "ligature의 시초인 Fira Code와 군더더기 없는 Inter. 가장 친숙한 무료 조합.",
        vibe: "classic"
    },
    {
        id: "iosevka-pair",
        mono: "iosevka",
        sans: "inter",
        name: "Iosevka · Inter",
        description:
            "좁은 셀폭 Iosevka로 한 화면에 더 많은 코드, UI는 Inter. 정보 밀도 우선형.",
        vibe: "modern"
    },
    {
        id: "maple-pair",
        mono: "maple-mono",
        sans: "pretendard",
        name: "Maple Mono · Pretendard",
        description:
            "둥근 모서리 Maple Mono와 한국어 본문의 표준 Pretendard. 한국어 인터페이스에 최적.",
        vibe: "korean"
    },
    {
        id: "victor-pair",
        mono: "victor-mono",
        sans: "inter",
        name: "Victor Mono · Inter",
        description:
            "흐르는 이탤릭의 Victor Mono로 주석을 살리고 본문은 Inter. 문학적 코드.",
        vibe: "editorial"
    },
    {
        id: "monaco-pair",
        mono: "monaco",
        sans: "inter",
        name: "Monaco · Inter",
        description:
            "Apple 클래식 등폭 + 모던 sans. 시스템과의 일관성 우선.",
        vibe: "classic"
    },
    {
        id: "commit-pair",
        mono: "commit-mono",
        sans: "inter",
        name: "Commit Mono · Inter",
        description:
            "신생 무료 폰트 둘. 가장 새로운 조합을 시도하고 싶을 때.",
        vibe: "modern"
    }
];
