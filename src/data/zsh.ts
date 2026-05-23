/**
 * Zsh 승강장 데이터. 다양한 프롬프트 + plugin manager + alias 빌더.
 */

export interface ZshPlugin {
    id: string;
    ko: string;
    name: string; // omz repo or external repo path
    desc: string;
    framework: "omz" | "external";
}

export const zshPlugins: ZshPlugin[] = [
    {id: "git", ko: "git", name: "git", desc: "git 별칭 모음", framework: "omz"},
    {id: "docker", ko: "docker", name: "docker", desc: "docker 자동완성", framework: "omz"},
    {id: "z", ko: "z (디렉토리 점프)", name: "z", desc: "자주 가는 폴더로 점프", framework: "omz"},
    {id: "history-substring-search", ko: "history-substring-search", name: "history-substring-search", desc: "↑↓로 부분 일치 히스토리 검색", framework: "omz"},
    {
        id: "syntax-highlighting",
        ko: "zsh-syntax-highlighting",
        name: "zsh-users/zsh-syntax-highlighting",
        desc: "명령어 입력 중 색상 하이라이트",
        framework: "external"
    },
    {
        id: "autosuggestions",
        ko: "zsh-autosuggestions",
        name: "zsh-users/zsh-autosuggestions",
        desc: "흐릿한 글씨로 자동 완성 추천",
        framework: "external"
    },
    {
        id: "fzf-tab",
        ko: "fzf-tab",
        name: "Aloxaf/fzf-tab",
        desc: "탭 자동완성에 fzf 결합",
        framework: "external"
    }
];

export const ZSH_PROMPTS = [
    {id: "default", ko: "기본 (default)", desc: "zsh 무설정 상태 — %m%# 프롬프트"},
    {id: "starship", ko: "Starship", desc: "Rust 기반 다국적 프롬프트 (권장)"},
    {id: "pure", ko: "Pure", desc: "단정한 미니멀"},
    {id: "agnoster", ko: "Agnoster", desc: "powerline 스타일 (oh-my-zsh)"},
    {id: "robbyrussell", ko: "Robbyrussell", desc: "oh-my-zsh 기본"},
    {id: "powerlevel10k", ko: "Powerlevel10k", desc: "Highly configurable"}
] as const;

export type ZshPromptId = (typeof ZSH_PROMPTS)[number]["id"];

export interface ZshConfig {
    prompt: ZshPromptId;
    histsize: number;
    savehist: number;
    shareHistory: boolean;
    ignoreDups: boolean;
    autoCd: boolean;
    plugins: string[];
    aliases: Array<{name: string; value: string}>;
}

/**
 * 진짜 zsh의 무설정 기본값.
 * - HISTSIZE 30, SAVEHIST 0 (zsh 내장 기본)
 * - SHARE_HISTORY / HIST_IGNORE_DUPS / AUTO_CD 모두 OFF
 * - 프롬프트 기본 (%m%#)
 * - 플러그인 없음, 별칭 없음
 */
export const zshDefault: ZshConfig = {
    prompt: "default",
    histsize: 30,
    savehist: 0,
    shareHistory: false,
    ignoreDups: false,
    autoCd: false,
    plugins: [],
    aliases: []
};

export function serializeZshConfig(c: ZshConfig): string {
    const out: string[] = [];
    out.push("# 버스터미널에서 출발한 ~/.zshrc");
    out.push(`# generated ${new Date().toISOString()}`);
    out.push("");

    // History
    out.push("# === History ===");
    out.push(`HISTSIZE=${c.histsize}`);
    out.push(`SAVEHIST=${c.savehist}`);
    out.push("HISTFILE=~/.zsh_history");
    if (c.shareHistory) out.push("setopt SHARE_HISTORY");
    if (c.ignoreDups) out.push("setopt HIST_IGNORE_DUPS");
    out.push("setopt EXTENDED_HISTORY");
    if (c.autoCd) out.push("setopt AUTO_CD");
    out.push("");

    // Plugin loader (oh-my-zsh path)
    const omzPlugins = c.plugins.filter(id =>
        zshPlugins.find(p => p.id === id && p.framework === "omz")
    );
    const externalPlugins = c.plugins
        .map(id => zshPlugins.find(p => p.id === id))
        .filter((p): p is ZshPlugin => Boolean(p && p.framework === "external"));

    if (omzPlugins.length) {
        out.push("# === oh-my-zsh ===");
        out.push('export ZSH="$HOME/.oh-my-zsh"');
        out.push('ZSH_THEME=""'); // prompt가 starship/pure/etc 등 외부면 비움
        out.push(`plugins=(${omzPlugins.join(" ")})`);
        out.push('source $ZSH/oh-my-zsh.sh');
        out.push("");
    }

    if (externalPlugins.length) {
        out.push("# === 외부 플러그인 ===");
        for (const p of externalPlugins) {
            out.push(
                `# source ~/.zsh/${p.name.split("/")[1] ?? p.id}/${p.name.split("/")[1] ?? p.id}.zsh`
            );
        }
        out.push("");
    }

    // Prompt
    out.push("# === Prompt ===");
    switch (c.prompt) {
        case "default":
            out.push("# zsh 기본 프롬프트(%m%#) 사용 — 별도 설정 없음");
            break;
        case "starship":
            out.push('eval "$(starship init zsh)"');
            break;
        case "pure":
            out.push("autoload -U promptinit && promptinit");
            out.push("prompt pure");
            break;
        case "agnoster":
            out.push('ZSH_THEME="agnoster"');
            break;
        case "robbyrussell":
            out.push('ZSH_THEME="robbyrussell"');
            break;
        case "powerlevel10k":
            out.push("source ~/.p10k.zsh");
            break;
    }
    out.push("");

    // Aliases
    if (c.aliases.length) {
        out.push("# === Aliases ===");
        for (const a of c.aliases) {
            if (!a.name.trim()) continue;
            out.push(`alias ${a.name}="${a.value.replace(/"/g, '\\"')}"`);
        }
    }
    return out.join("\n") + "\n";
}
