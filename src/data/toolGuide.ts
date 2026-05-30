/**
 * 툴 소개 페이지 데이터 — 완전 초보자를 위한 7개 도구 입문 + 비교.
 * 각 도구가 무엇인지, 장단점, 누구에게 맞는지, 공식 홈페이지 링크,
 * 그리고 BusTerminal 안에서 바로 설정하러 가는 내부 경로를 담는다.
 */

export type ToolCategory = "terminal" | "editor" | "shell" | "multiplexer";

export type ToolGuideEntry = {
    id: string;
    name: string;
    /** 한 줄 소개 (목록/카드 상단) */
    tagline: string;
    category: ToolCategory;
    icon: string;
    /** 동작하는 운영체제 */
    platforms: string[];
    /** "이게 뭐예요?" — 초보자도 이해할 수 있게 풀어쓴 설명 */
    what: string;
    pros: string[];
    cons: string[];
    /** "이런 분께 맞아요" */
    bestFor: string;
    officialUrl: string;
    /** BusTerminal 안의 설정 페이지 경로 */
    to: string;
};

export const TOOL_CATEGORIES: {
    id: ToolCategory;
    label: string;
    blurb: string;
    /** 선택 가이드에 쓰는 한 줄 도움말 */
    pickHint: string;
}[] = [
    {
        id: "terminal",
        label: "터미널",
        blurb: "명령어를 입력하고 결과를 보는 검은 창. 모든 작업의 출발점이에요.",
        pickHint: "터미널 창 자체를 고르는 중이라면 — 빠르고 깔끔한 Ghostty, AI 도움이 필요하면 Warp, macOS에서 안정적인 올라운더는 iTerm2."
    },
    {
        id: "editor",
        label: "에디터",
        blurb: "터미널 안에서 코드를 작성하는 도구. 키보드만으로 빠르게 편집해요.",
        pickHint: "코드 편집기를 고르는 중이라면 — 무한히 커스터마이징하려면 Neovim, 설정 없이 바로 똑똑하게 쓰려면 Helix."
    },
    {
        id: "shell",
        label: "셸",
        blurb: "터미널 안에서 명령어를 해석하는 프로그램. 프롬프트와 자동완성을 담당해요.",
        pickHint: "프롬프트·자동완성을 꾸미고 싶다면 — macOS 기본이자 생태계가 가장 풍부한 Zsh."
    },
    {
        id: "multiplexer",
        label: "멀티플렉서",
        blurb: "터미널 창 하나를 여러 칸으로 쪼개고 작업을 유지해주는 도구예요.",
        pickHint: "화면 분할·세션 유지가 필요하다면 — 사실상 표준인 tmux."
    }
];

export const TOOL_GUIDE: ToolGuideEntry[] = [
    {
        id: "ghostty",
        name: "Ghostty",
        tagline: "GPU로 그리는 빠르고 모던한 터미널",
        category: "terminal",
        icon: "terminal",
        platforms: ["macOS", "Linux"],
        what: "HashiCorp 창업자가 만든 오픈소스 터미널이에요. GPU로 화면을 그려서 아주 빠르고, 기본 설정만으로도 깔끔해서 처음 쓰기 좋아요. 설정은 텍스트 파일 한 장으로 끝납니다.",
        pros: [
            "GPU 가속으로 입력·스크롤이 매우 부드러움",
            "기본값이 예뻐서 손댈 게 적음",
            "설정이 단일 텍스트 파일로 단순함",
            "완전 무료 · 오픈소스"
        ],
        cons: [
            "2024년 정식 공개라 생태계가 아직 성장 중",
            "Windows는 아직 미지원",
            "그래픽 설정 화면 없이 파일을 직접 편집"
        ],
        bestFor: "빠르고 모던한 터미널을 복잡한 설정 없이 깔끔하게 시작하고 싶은 분",
        officialUrl: "https://ghostty.org",
        to: "/ghostty"
    },
    {
        id: "warp",
        name: "Warp",
        tagline: "AI가 내장된 차세대 터미널",
        category: "terminal",
        icon: "bolt",
        platforms: ["macOS", "Linux", "Windows"],
        what: "명령어 추천 AI와 블록 단위 출력 같은 현대적인 사용성을 갖춘 터미널이에요. 명령어를 잘 몰라도 AI에게 물어보며 작업할 수 있어 입문자에게 친절합니다.",
        pros: [
            "AI가 명령어를 추천·설명해 줌",
            "명령과 결과가 블록으로 묶여 보기 쉬움",
            "강력한 자동완성과 워크플로우",
            "macOS · Linux · Windows 모두 지원"
        ],
        cons: [
            "계정 로그인이 필요 (프라이버시가 신경 쓰일 수 있음)",
            "일부 고급 기능은 유료",
            "완전한 오픈소스는 아님",
            "기능이 많은 만큼 다소 무거움"
        ],
        bestFor: "AI의 도움을 받으며 편하게 터미널에 입문하고 싶은 분",
        officialUrl: "https://www.warp.dev",
        to: "/warp"
    },
    {
        id: "iterm2",
        name: "iTerm2",
        tagline: "macOS의 검증된 올라운더 터미널",
        category: "terminal",
        icon: "terminal",
        platforms: ["macOS"],
        what: "macOS에서 오랫동안 표준처럼 쓰여온 터미널이에요. 창 분할, 검색, 핫키 창 등 기능이 매우 풍부하고, 설정을 그래픽 화면에서 클릭으로 바꿀 수 있어요.",
        pros: [
            "오랜 기간 검증된 안정성",
            "분할 창 · 검색 · 핫키 등 기능이 풍부",
            "그래픽 설정 화면 제공",
            "무료이고 한국어 자료도 많음"
        ],
        cons: [
            "macOS 전용",
            "설정 항목이 방대해 처음엔 복잡하게 느껴짐",
            "디자인이 비교적 올드한 편"
        ],
        bestFor: "macOS에서 안정적이고 기능 많은 만능 터미널을 원하는 분",
        officialUrl: "https://iterm2.com",
        to: "/iterm2"
    },
    {
        id: "neovim",
        name: "Neovim",
        tagline: "끝까지 커스터마이징하는 터미널 에디터",
        category: "editor",
        icon: "edit_note",
        platforms: ["macOS", "Linux", "Windows"],
        what: "전설적인 에디터 Vim을 현대화한 코드 편집기예요. 마우스 없이 키보드만으로 빠르게 편집하고, Lua 설정과 플러그인으로 나만의 개발환경을 거의 무한히 만들 수 있어요.",
        pros: [
            "거의 무한한 커스터마이징",
            "키보드 중심의 초고속 편집",
            "방대한 플러그인 생태계",
            "가벼워서 원격 서버(SSH)에서도 쾌적"
        ],
        cons: [
            "학습 곡선이 가파름",
            "처음에 환경을 갖추는 데 시간 투자 필요",
            "모달 편집 방식에 적응이 필요"
        ],
        bestFor: "키보드만으로 빠르게 코딩하고 환경을 내 맘대로 빚고 싶은 분",
        officialUrl: "https://neovim.io",
        to: "/neovim"
    },
    {
        id: "helix",
        name: "Helix",
        tagline: "설정 없이 바로 똑똑한 모달 에디터",
        category: "editor",
        icon: "edit_square",
        platforms: ["macOS", "Linux", "Windows"],
        what: "Rust로 만든 모달 에디터예요. 코드 자동완성(LSP)과 문법 강조가 기본으로 내장돼 있어서, 복잡한 설정 없이 설치 직후부터 똑똑하게 동작합니다.",
        pros: [
            "설치 즉시 LSP · 문법 강조가 동작 (설정 거의 불필요)",
            "빠르고 가벼움",
            "선택 먼저(selection-first) 방식이 직관적",
            "설정이 config.toml 한 장으로 단순"
        ],
        cons: [
            "키 조작이 Vim과 달라 기존 Vim 유저는 적응 필요",
            "플러그인 생태계가 아직 작음",
            "한국어 자료가 적은 편"
        ],
        bestFor: "Neovim의 강력함은 원하지만 복잡한 초기 설정은 피하고 싶은 분",
        officialUrl: "https://helix-editor.com",
        to: "/helix"
    },
    {
        id: "zsh",
        name: "Zsh",
        tagline: "macOS 기본 셸, 프롬프트를 내 손에",
        category: "shell",
        icon: "code_blocks",
        platforms: ["macOS", "Linux", "Windows (WSL)"],
        what: "터미널 안에서 명령어를 해석하는 '셸'이에요. macOS의 기본 셸이며, 자동완성·테마·플러그인을 더해 프롬프트와 명령줄 경험을 한층 끌어올릴 수 있어요.",
        pros: [
            "macOS 기본이라 따로 설치할 필요 없음",
            "Oh My Zsh 등 풍부한 생태계",
            "강력한 자동완성과 테마",
            "기존 bash와 거의 호환"
        ],
        cons: [
            "플러그인을 많이 얹으면 느려질 수 있음",
            "설정 파일(.zshrc) 관리가 필요",
            "'터미널'과 개념을 혼동하기 쉬움"
        ],
        bestFor: "터미널 프롬프트와 자동완성을 예쁘고 편하게 꾸미고 싶은 분",
        officialUrl: "https://www.zsh.org",
        to: "/zsh"
    },
    {
        id: "tmux",
        name: "tmux",
        tagline: "한 창을 여러 칸으로, 세션은 그대로",
        category: "multiplexer",
        icon: "grid_view",
        platforms: ["macOS", "Linux", "Windows (WSL)"],
        what: "터미널 창 하나를 여러 패널·창으로 쪼개주는 도구예요. 세션을 유지해줘서 SSH 연결이 끊겨도 작업이 그대로 남아 있고, 서버 작업에 특히 강합니다.",
        pros: [
            "화면 분할로 여러 작업을 한눈에",
            "세션 유지 — 연결이 끊겨도 작업 보존",
            "키보드로 빠른 창·패널 전환",
            "가볍고 설정 공유가 쉬움"
        ],
        cons: [
            "prefix 키 조작에 적응이 필요",
            "기본 단축키가 직관적이지 않음",
            "단독으로는 의미가 없고 터미널과 함께 써야 함"
        ],
        bestFor: "서버 작업이나 여러 작업을 한 화면에서 관리하고 싶은 분",
        officialUrl: "https://github.com/tmux/tmux/wiki",
        to: "/tmux"
    }
];
