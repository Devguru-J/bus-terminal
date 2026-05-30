import {getApplyGuideBySlug} from "./applyGuide";

const SITE_URL = "https://busterminal.dev";
const SITE_NAME = "버스터미널";
const DEFAULT_IMAGE = `${SITE_URL}/og.svg`;

export interface SeoMeta {
    title: string;
    description: string;
    path: string;
    robots?: string;
}

const INDEX_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1";
const NOINDEX_ROBOTS = "noindex, follow";

const ROUTE_META: Record<string, SeoMeta> = {
    "/": {
        title: "버스터미널 BusTerminal | 개발환경 설정 파일 생성기",
        description:
            "Ghostty, Warp, iTerm2, Neovim, Helix, Zsh, tmux 설정 파일을 시각적으로 만들고 다운로드하는 개발자 도구입니다.",
        path: "/"
    },
    "/guide": {
        title: "사용 안내 | 버스터미널 BusTerminal",
        description:
            "버스터미널에서 터미널, 에디터, 셸 설정을 만들고 내보내는 3단계 사용 흐름과 주요 용어를 안내합니다.",
        path: "/guide"
    },
    "/tools": {
        title: "개발 도구 소개 | 버스터미널 BusTerminal",
        description:
            "Ghostty, Warp, iTerm2, Neovim, Helix, Zsh, tmux가 무엇인지 비교하고 내 개발환경에 맞는 설정 도구를 고릅니다.",
        path: "/tools"
    },
    "/ghostty": {
        title: "Ghostty 설정 생성기 | 버스터미널 BusTerminal",
        description:
            "Ghostty 터미널의 폰트, 색상, 창 여백, 커서, 키바인딩을 시각적으로 조정하고 config 파일로 내보냅니다.",
        path: "/ghostty"
    },
    "/warp": {
        title: "Warp 테마 설정 생성기 | 버스터미널 BusTerminal",
        description:
            "Warp 터미널의 테마, 폰트, 워크플로우, AI 옵션을 정리하고 Warp theme YAML 파일로 내보냅니다.",
        path: "/warp"
    },
    "/iterm2": {
        title: "iTerm2 프로파일 생성기 | 버스터미널 BusTerminal",
        description:
            "iTerm2 프로파일, 폰트, 창 투명도, ANSI 팔레트, 핫키 윈도우를 설정하고 .itermcolors와 Dynamic Profile을 만듭니다.",
        path: "/iterm2"
    },
    "/neovim": {
        title: "Neovim init.lua 생성기 | 버스터미널 BusTerminal",
        description:
            "Neovim 기본 옵션, 컬러스킴, lazy.nvim 플러그인, LSP, 키맵을 화면에서 조립하고 init.lua로 내보냅니다.",
        path: "/neovim"
    },
    "/helix": {
        title: "Helix config.toml 생성기 | 버스터미널 BusTerminal",
        description:
            "Helix 에디터의 테마, LSP, file picker, keymap 설정을 고르고 config.toml과 languages.toml을 생성합니다.",
        path: "/helix"
    },
    "/zsh": {
        title: "Zsh .zshrc 생성기 | 버스터미널 BusTerminal",
        description:
            "Zsh 프롬프트, 히스토리, 플러그인, alias, PATH, env, completion 설정을 고르고 .zshrc로 내보냅니다.",
        path: "/zsh"
    },
    "/tmux": {
        title: "tmux .tmux.conf 생성기 | 버스터미널 BusTerminal",
        description:
            "tmux prefix, 상태바, pane/window 동작, TPM 플러그인, 키바인딩을 설정하고 .tmux.conf 파일을 생성합니다.",
        path: "/tmux"
    },
    "/themes": {
        title: "터미널 테마 환승센터 | 버스터미널 BusTerminal",
        description:
            "Tokyo Night, Catppuccin, Gruvbox, Nord 등 개발자 테마를 비교하고 Ghostty, Warp, iTerm2, Neovim, Helix, tmux에 적용합니다.",
        path: "/themes"
    },
    "/themes/compare": {
        title: "터미널 테마 비교 | 버스터미널 BusTerminal",
        description:
            "두 개발자 테마의 ANSI 색상과 명도 차이를 나란히 비교하고 내 터미널 환경에 맞는 팔레트를 고릅니다.",
        path: "/themes/compare"
    },
    "/fonts": {
        title: "프로그래밍 폰트 센터 | 버스터미널 BusTerminal",
        description:
            "JetBrains Mono, Geist Mono, Fira Code 등 개발자용 폰트를 미리 보고 터미널 설정에 적용합니다.",
        path: "/fonts"
    },
    "/fonts/pairings": {
        title: "개발자 폰트 페어링 | 버스터미널 BusTerminal",
        description:
            "코드용 monospace와 UI용 sans-serif 조합을 비교하고 터미널과 에디터에 어울리는 폰트 페어링을 고릅니다.",
        path: "/fonts/pairings"
    },
    "/privacy": {
        title: "개인정보처리방침 | 버스터미널 BusTerminal",
        description:
            "버스터미널이 로컬 설정값, 로그인 정보, 클라우드 스냅샷, 분석 데이터를 어떻게 다루는지 안내합니다.",
        path: "/privacy"
    },
    "/terms": {
        title: "이용 안내 및 면책 | 버스터미널 BusTerminal",
        description:
            "버스터미널에서 생성한 설정 파일과 설치 스크립트를 적용할 때 알아야 할 책임 범위와 사용 안내입니다.",
        path: "/terms"
    },
    "/feedback": {
        title: "의견 보내기 | 버스터미널 BusTerminal",
        description: "버스터미널에 버그, 개선 요청, 새 도구 요청을 남기는 피드백 창구입니다.",
        path: "/feedback",
        robots: NOINDEX_ROBOTS
    },
    "/my-routes": {
        title: "내 노선 | 버스터미널 BusTerminal",
        description: "브라우저에 저장한 개발환경 설정 조합을 관리합니다.",
        path: "/my-routes",
        robots: NOINDEX_ROBOTS
    },
    "/diff": {
        title: "설정 비교 | 버스터미널 BusTerminal",
        description: "현재 설정과 기본값 또는 저장된 노선의 차이를 비교합니다.",
        path: "/diff",
        robots: NOINDEX_ROBOTS
    },
    "/export": {
        title: "출발권 만들기 | 버스터미널 BusTerminal",
        description: "완성한 개발환경 설정 파일을 다운로드하고 적용 전 진단을 확인합니다.",
        path: "/export",
        robots: NOINDEX_ROBOTS
    },
    "/settings": {
        title: "터미널 관리실 | 버스터미널 BusTerminal",
        description: "로컬 저장소, 백업, 복원, 클라우드 스냅샷을 관리합니다.",
        path: "/settings",
        robots: NOINDEX_ROBOTS
    },
    "/profile": {
        title: "내 프로필 | 버스터미널 BusTerminal",
        description: "계정 정보와 클라우드 보관함 상태를 확인합니다.",
        path: "/profile",
        robots: NOINDEX_ROBOTS
    }
};

export function getSeoMeta(pathname: string): SeoMeta {
    const normalized = normalizePath(pathname);
    const exact = ROUTE_META[normalized];
    if (exact) return exact;

    if (normalized.startsWith("/themes/")) {
        return {
            title: "터미널 테마 상세 | 버스터미널 BusTerminal",
            description:
                "개발자 테마의 색상 팔레트를 확인하고 Ghostty, Warp, iTerm2, Neovim, Helix, tmux 설정으로 내보냅니다.",
            path: normalized
        };
    }

    if (normalized.startsWith("/fonts/")) {
        return {
            title: "프로그래밍 폰트 상세 | 버스터미널 BusTerminal",
            description:
                "개발자용 폰트의 한글, 영문, 코드 표본을 확인하고 터미널 설정에 적용합니다.",
            path: normalized
        };
    }

    if (normalized.startsWith("/guides/")) {
        const slug = normalized.replace("/guides/", "");
        const guide = getApplyGuideBySlug(slug);
        if (guide) {
            return {
                title: guide.seoTitle,
                description: guide.seoDescription,
                path: normalized
            };
        }
    }

    return {
        title: "페이지를 찾을 수 없습니다 | 버스터미널 BusTerminal",
        description: "요청한 버스터미널 페이지를 찾을 수 없습니다. 홈에서 사용 가능한 승강장을 다시 선택해 주세요.",
        path: normalized,
        robots: NOINDEX_ROBOTS
    };
}

export function applySeoMeta(meta: SeoMeta) {
    document.title = meta.title;
    setMeta("name", "description", meta.description);
    setMeta("name", "robots", meta.robots ?? INDEX_ROBOTS);
    setCanonical(meta.path);

    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:url", absoluteUrl(meta.path));
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:image", DEFAULT_IMAGE);
    setMeta("property", "og:image:alt", "BusTerminal developer environment configuration tool");

    setMeta("name", "twitter:title", meta.title);
    setMeta("name", "twitter:description", meta.description);
    setMeta("name", "twitter:image", DEFAULT_IMAGE);
}

function normalizePath(pathname: string) {
    if (!pathname || pathname === "/") return "/";
    return pathname.replace(/\/+$/, "");
}

function absoluteUrl(path: string) {
    return `${SITE_URL}${path === "/" ? "/" : path}`;
}

function setCanonical(path: string) {
    let canonical = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
    if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
    }
    canonical.href = absoluteUrl(path);
}

function setMeta(attribute: "name" | "property", key: string, content: string) {
    let el = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attribute, key);
        document.head.appendChild(el);
    }
    el.content = content;
}
