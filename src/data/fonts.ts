/**
 * 폰트 환승센터 레지스트리.
 *
 * 각 폰트는 표시용 이름, 사용 가능한 CSS family 문자열, 메타데이터를 가진다.
 * `googleFontUrl`이 있으면 폰트 환승센터에서 자동으로 <link>를 주입해 미리보기.
 * 자체 호스팅 / 라이센스 다운로드가 필요한 폰트(SF Mono, Berkeley Mono 등)는
 * `installNote`로 안내 — 미리보기는 시스템 폴백, export는 이름만 전달.
 */

export type FontCategory = "monospace" | "nerd" | "editorial" | "sans" | "korean";
export type FontTag =
    | "ligatures"
    | "nerd"
    | "popular"
    | "new"
    | "free"
    | "paid"
    | "system"
    | "variable";

export interface FontEntry {
    id: string;
    name: string;
    family: string; // CSS font-family (with fallback)
    author: string;
    description: string;
    category: FontCategory;
    tags: FontTag[];
    weights: number[];
    hasLigatures: boolean;
    hasNerdVariant: boolean;
    /** Google Fonts CSS2 URL — 환승센터가 자동으로 로드 */
    googleFontUrl?: string;
    /** 직접 설치가 필요한 경우의 안내 (라이센스, 다운로드 URL) */
    installNote?: string;
    homepage?: string;
}

export const fonts: FontEntry[] = [
    {
        id: "jetbrains-mono",
        name: "JetBrains Mono",
        family: '"JetBrains Mono", monospace',
        author: "JetBrains",
        description: "코드 가독성에 최적화. 폭넓은 ligature, 변수 폰트, 무료.",
        category: "monospace",
        tags: ["ligatures", "popular", "free", "variable", "nerd"],
        weights: [100, 200, 300, 400, 500, 600, 700, 800],
        hasLigatures: true,
        hasNerdVariant: true,
        googleFontUrl: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap",
        homepage: "https://www.jetbrains.com/lp/mono/"
    },
    {
        id: "fira-code",
        name: "Fira Code",
        family: '"Fira Code", monospace',
        author: "Tonsky",
        description: "ligature의 시초. 프로그래밍 폰트의 표준 중 하나.",
        category: "monospace",
        tags: ["ligatures", "popular", "free", "nerd"],
        weights: [300, 400, 500, 600, 700],
        hasLigatures: true,
        hasNerdVariant: true,
        googleFontUrl: "https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&display=swap",
        homepage: "https://github.com/tonsky/FiraCode"
    },
    {
        id: "geist-mono",
        name: "Geist Mono",
        family: '"Geist Mono", monospace',
        author: "Vercel",
        description: "Vercel의 시그니처 등폭. 깔끔하고 현대적.",
        category: "monospace",
        tags: ["new", "free", "popular"],
        weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        hasLigatures: false,
        hasNerdVariant: false,
        googleFontUrl: "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap",
        homepage: "https://vercel.com/font"
    },
    {
        id: "berkeley-mono",
        name: "Berkeley Mono",
        family: '"Berkeley Mono", "JetBrains Mono", monospace',
        author: "Berkeley Graphics",
        description: "유료 프리미엄 등폭. 손글씨 같은 따뜻함 + 정밀함.",
        category: "monospace",
        tags: ["paid", "popular"],
        weights: [400, 700],
        hasLigatures: false,
        hasNerdVariant: false,
        installNote: "berkeleygraphics.com에서 라이센스 구매 후 시스템에 설치",
        homepage: "https://berkeleygraphics.com/typefaces/berkeley-mono/"
    },
    {
        id: "maple-mono",
        name: "Maple Mono",
        family: '"Maple Mono", monospace',
        author: "Subframe7536",
        description: "둥근 모서리. 한·중·일 글자도 잘 어울리는 무료 폰트.",
        category: "monospace",
        tags: ["ligatures", "new", "free", "nerd", "variable"],
        weights: [300, 400, 500, 600, 700],
        hasLigatures: true,
        hasNerdVariant: true,
        installNote: "github.com/subframe7536/maple-font에서 직접 다운로드 (Google Fonts 미배포)",
        homepage: "https://github.com/subframe7536/maple-font"
    },
    {
        id: "commit-mono",
        name: "Commit Mono",
        family: '"Commit Mono", monospace',
        author: "Eigil Nikolajsen",
        description: "수동 힌팅 없이도 또렷한 신생 무료 폰트.",
        category: "monospace",
        tags: ["new", "free", "ligatures"],
        weights: [400, 700],
        hasLigatures: true,
        hasNerdVariant: false,
        installNote: "commitmono.com에서 직접 다운로드",
        homepage: "https://commitmono.com"
    },
    {
        id: "ibm-plex-mono",
        name: "IBM Plex Mono",
        family: '"IBM Plex Mono", monospace',
        author: "IBM",
        description: "IBM 디자인 시스템 표준. 진지하고 안정적인 톤.",
        category: "monospace",
        tags: ["popular", "free"],
        weights: [100, 200, 300, 400, 500, 600, 700],
        hasLigatures: false,
        hasNerdVariant: false,
        googleFontUrl: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
    },
    {
        id: "monaco",
        name: "Monaco",
        family: 'Monaco, monospace',
        author: "Apple",
        description: "Apple의 오리지널 시스템 등폭. macOS 전통의 정석.",
        category: "monospace",
        tags: ["system"],
        weights: [400],
        hasLigatures: false,
        hasNerdVariant: false,
        installNote: "macOS에 기본 설치됨"
    },
    {
        id: "sf-mono",
        name: "SF Mono",
        family: '"SF Mono", "SFMono-Regular", monospace',
        author: "Apple",
        description: "Apple의 모던 등폭. Terminal/Xcode 기본.",
        category: "monospace",
        tags: ["system"],
        weights: [300, 400, 500, 600, 700, 800, 900],
        hasLigatures: false,
        hasNerdVariant: false,
        installNote: "macOS Terminal/Xcode와 함께 설치됨"
    },
    {
        id: "hack",
        name: "Hack",
        family: 'Hack, monospace',
        author: "Source Foundry",
        description: "코드용으로 명확하게 디자인된 무료 폰트.",
        category: "monospace",
        tags: ["free", "nerd"],
        weights: [400, 700],
        hasLigatures: false,
        hasNerdVariant: true,
        installNote: "sourcefoundry.org/hack 또는 Nerd Fonts에서 설치",
        homepage: "https://sourcefoundry.org/hack/"
    },
    {
        id: "cascadia-code",
        name: "Cascadia Code",
        family: '"Cascadia Code", monospace',
        author: "Microsoft",
        description: "Windows Terminal의 시그니처. 손글씨 풍 ligature.",
        category: "monospace",
        tags: ["ligatures", "free", "nerd"],
        weights: [200, 300, 400, 500, 600, 700],
        hasLigatures: true,
        hasNerdVariant: true,
        installNote: "github.com/microsoft/cascadia-code"
    },
    {
        id: "input-mono",
        name: "Input Mono",
        family: '"Input Mono", monospace',
        author: "DJR / David Jonathan Ross",
        description: "코드를 위해 다시 설계된 등폭. 7가지 폭과 다양한 변종.",
        category: "monospace",
        tags: ["popular"],
        weights: [200, 300, 400, 500, 600, 700, 800, 900],
        hasLigatures: false,
        hasNerdVariant: false,
        installNote: "input.djr.com에서 개인용 무료 / 상업용 라이센스"
    },
    {
        id: "iosevka",
        name: "Iosevka",
        family: 'Iosevka, monospace',
        author: "Belleve Invis",
        description: "좁은 셀폭. 한 화면에 더 많은 코드. 변종이 매우 다양.",
        category: "monospace",
        tags: ["ligatures", "free", "nerd", "variable"],
        weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        hasLigatures: true,
        hasNerdVariant: true,
        installNote: "github.com/be5invis/Iosevka",
        homepage: "https://typeof.net/Iosevka/"
    },
    {
        id: "victor-mono",
        name: "Victor Mono",
        family: '"Victor Mono", monospace',
        author: "Rune Bjørnerås",
        description: "이탤릭이 손글씨처럼 흐른다. 주석이 살아남.",
        category: "monospace",
        tags: ["ligatures", "free"],
        weights: [100, 200, 300, 400, 500, 600, 700],
        hasLigatures: true,
        hasNerdVariant: false,
        googleFontUrl: "https://fonts.googleapis.com/css2?family=Victor+Mono:ital,wght@0,100..700;1,100..700&display=swap",
        homepage: "https://rubjo.github.io/victor-mono/"
    },
    {
        id: "dank-mono",
        name: "Dank Mono",
        family: '"Dank Mono", monospace',
        author: "Phil Plückthun",
        description: "코딩용 이탤릭이 미려한 유료 폰트. 디자이너에게 인기.",
        category: "monospace",
        tags: ["paid", "ligatures"],
        weights: [400, 700],
        hasLigatures: true,
        hasNerdVariant: false,
        installNote: "dank.sh에서 라이센스 구매"
    },
    {
        id: "operator-mono",
        name: "Operator Mono",
        family: '"Operator Mono", monospace',
        author: "Hoefler & Co",
        description: "프리미엄 디자인. 이탤릭이 손글씨처럼 흐른다.",
        category: "monospace",
        tags: ["paid"],
        weights: [200, 300, 400, 500, 700, 800],
        hasLigatures: false,
        hasNerdVariant: false,
        installNote: "typography.com에서 라이센스 구매"
    },
    {
        id: "ubuntu-mono",
        name: "Ubuntu Mono",
        family: '"Ubuntu Mono", monospace',
        author: "Canonical",
        description: "Ubuntu의 시스템 등폭. 친근한 곡선.",
        category: "monospace",
        tags: ["free"],
        weights: [400, 700],
        hasLigatures: false,
        hasNerdVariant: false,
        googleFontUrl: "https://fonts.googleapis.com/css2?family=Ubuntu+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap"
    },
    {
        id: "source-code-pro",
        name: "Source Code Pro",
        family: '"Source Code Pro", monospace',
        author: "Adobe",
        description: "Adobe의 무료 코딩용. 안정적이고 가독성 좋음.",
        category: "monospace",
        tags: ["free", "popular"],
        weights: [200, 300, 400, 500, 600, 700, 800, 900],
        hasLigatures: false,
        hasNerdVariant: false,
        googleFontUrl: "https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap"
    },
    {
        id: "meslo-lg-nf",
        name: "MesloLGS NF",
        family: '"MesloLGS NF", monospace',
        author: "Powerlevel10k",
        description: "Powerlevel10k의 권장 폰트. 아이콘 풍부.",
        category: "nerd",
        tags: ["nerd", "free", "popular"],
        weights: [400, 700],
        hasLigatures: false,
        hasNerdVariant: true,
        installNote: "p10k 설치 스크립트가 자동으로 설치 권장"
    },
    {
        id: "pragmata-pro",
        name: "PragmataPro",
        family: '"PragmataPro", monospace',
        author: "Fabrizio Schiavi",
        description: "초고밀도 등폭. 한 화면에 어마어마한 양의 코드.",
        category: "monospace",
        tags: ["paid", "ligatures"],
        weights: [300, 400, 700],
        hasLigatures: true,
        hasNerdVariant: false,
        installNote: "fsd.it에서 라이센스 구매"
    },
    {
        id: "recursive",
        name: "Recursive Mono",
        family: '"Recursive", monospace',
        author: "Arrow Type",
        description: "변수 폰트. 한 폰트로 등폭과 casual을 자유롭게.",
        category: "monospace",
        tags: ["variable", "free", "new", "ligatures"],
        weights: [300, 400, 500, 600, 700, 800, 900, 1000],
        hasLigatures: true,
        hasNerdVariant: false,
        googleFontUrl: "https://fonts.googleapis.com/css2?family=Recursive:wght@300..1000&display=swap",
        homepage: "https://www.recursive.design"
    },
    {
        id: "comic-mono",
        name: "Comic Mono",
        family: '"Comic Mono", monospace',
        author: "Shannon Miwa",
        description: "Comic Sans의 등폭 변종. 진지함을 잠시 내려놓을 때.",
        category: "monospace",
        tags: ["free"],
        weights: [400, 700],
        hasLigatures: false,
        hasNerdVariant: false,
        installNote: "github.com/dtinth/comic-mono-font"
    },
    {
        id: "noto-sans-mono",
        name: "Noto Sans Mono",
        family: '"Noto Sans Mono", monospace',
        author: "Google",
        description: "Google의 다국어 지원 등폭. 모든 언어가 안전.",
        category: "monospace",
        tags: ["free", "variable"],
        weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        hasLigatures: false,
        hasNerdVariant: false,
        googleFontUrl: "https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wght@100..900&display=swap"
    },
    {
        id: "roboto-mono",
        name: "Roboto Mono",
        family: '"Roboto Mono", monospace',
        author: "Christian Robertson",
        description: "Material 시스템의 등폭. 균형 잡힌 무난함.",
        category: "monospace",
        tags: ["free", "variable"],
        weights: [100, 200, 300, 400, 500, 600, 700],
        hasLigatures: false,
        hasNerdVariant: false,
        googleFontUrl: "https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap"
    },

    // --- Korean / sans editorial ---
    {
        id: "pretendard",
        name: "Pretendard",
        family: 'Pretendard, sans-serif',
        author: "길형진 (orioncactus)",
        description: "한국어 시스템 폰트의 표준. 본 사이트의 UI 폰트.",
        category: "korean",
        tags: ["free", "popular", "variable"],
        weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        hasLigatures: false,
        hasNerdVariant: false,
        installNote: "이미 BusTerminal 본문에 로드됨",
        homepage: "https://github.com/orioncactus/pretendard"
    },
    {
        id: "inter",
        name: "Inter",
        family: 'Inter, sans-serif',
        author: "Rasmus Andersson",
        description: "스크린에 최적화된 무료 sans. 변수 폰트 지원.",
        category: "sans",
        tags: ["free", "popular", "variable"],
        weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        hasLigatures: false,
        hasNerdVariant: false,
        googleFontUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap",
        homepage: "https://rsms.me/inter/"
    }
];

export const fontCategories: Array<{id: FontCategory; label: string; ko: string; icon: string}> = [
    {id: "monospace", label: "Monospace", ko: "등폭", icon: "code"},
    {id: "nerd", label: "Nerd Fonts", ko: "아이콘", icon: "memory"},
    {id: "sans", label: "Sans", ko: "산세리프", icon: "text_fields"},
    {id: "korean", label: "Korean", ko: "한글", icon: "translate"},
    {id: "editorial", label: "Editorial", ko: "에디토리얼", icon: "menu_book"}
];

export const fontTags: Array<{id: FontTag; label: string; tone?: "active" | "info" | "warn"}> = [
    {id: "ligatures", label: "ligatures", tone: "active"},
    {id: "nerd", label: "Nerd Font", tone: "info"},
    {id: "variable", label: "variable", tone: "info"},
    {id: "popular", label: "popular", tone: "active"},
    {id: "new", label: "new", tone: "warn"},
    {id: "free", label: "free"},
    {id: "paid", label: "paid", tone: "warn"},
    {id: "system", label: "system"}
];

/** 미리보기용 샘플 문장. */
export const PREVIEW_SAMPLES = {
    english: "The quick brown fox jumps over the lazy dog. 0123456789",
    korean: "다람쥐 헌 쳇바퀴에 타고파. 한글 가나다라 0123 ABC",
    code: `function fibonacci(n: number): number {
    if (n < 2) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
const result = fibonacci(10); // == 55
// ligature test: => !== >= <= -> |> :=`,
    terminal: `$ git status
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  modified:   src/data/themes.ts
  modified:   src/data/fonts.ts

no changes added to commit (use "git add" and/or "git commit -a")`
};
