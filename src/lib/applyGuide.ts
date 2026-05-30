import type {ExportPlatform} from "./exportSelection";

export interface ApplyGuideFile {
    downloaded: string;
    destination: string;
    note?: string;
}

export interface ApplyGuide {
    id: ExportPlatform;
    label: string;
    slug: string;
    seoTitle: string;
    seoDescription: string;
    summary: string;
    files: ApplyGuideFile[];
    steps: string[];
    commands: string[];
    verify: string;
    caution?: string;
}

export const APPLY_GUIDES: Record<ExportPlatform, ApplyGuide> = {
    ghostty: {
        id: "ghostty",
        label: "Ghostty",
        slug: "ghostty-config-location",
        seoTitle: "Ghostty 설정 파일 위치와 적용 방법 | 버스터미널",
        seoDescription: "Ghostty config 파일을 어디에 넣어야 하는지, ghostty-config를 ~/.config/ghostty/config로 적용하는 방법을 단계별로 안내합니다.",
        summary: "다운로드한 ghostty-config 파일을 Ghostty 설정 파일 이름인 config로 옮깁니다.",
        files: [
            {
                downloaded: "ghostty-config",
                destination: "~/.config/ghostty/config",
                note: "파일 이름이 config여야 Ghostty가 읽습니다."
            }
        ],
        steps: [
            "기존 ~/.config/ghostty/config 파일을 먼저 백업합니다.",
            "Downloads 폴더의 ghostty-config를 ~/.config/ghostty/config로 복사합니다.",
            "Ghostty를 다시 열거나 설정 reload를 실행해 반영합니다."
        ],
        commands: [
            "mkdir -p ~/.config/ghostty",
            "cp ~/.config/ghostty/config ~/.config/ghostty/config.bak 2>/dev/null || true",
            "cp ~/Downloads/ghostty-config ~/.config/ghostty/config"
        ],
        verify: "Ghostty 새 창을 열었을 때 폰트, 배경색, 패딩이 바뀌었는지 확인하세요."
    },
    warp: {
        id: "warp",
        label: "Warp",
        slug: "warp-theme-apply",
        seoTitle: "Warp 테마 YAML 적용 방법 | 버스터미널",
        seoDescription: "Warp theme YAML과 workflow YAML을 ~/.warp/themes, ~/.warp/workflows에 넣고 Warp에서 확인하는 방법을 안내합니다.",
        summary: "테마와 워크플로우 파일은 Warp 폴더에 넣고, settings 파일은 수동 적용 체크리스트로 봅니다.",
        files: [
            {
                downloaded: "warp-theme.yaml",
                destination: "~/.warp/themes/bus-terminal.yaml",
                note: "Warp 테마 선택 목록에서 bus-terminal을 고릅니다."
            },
            {
                downloaded: "warp-workflows.yaml",
                destination: "~/.warp/workflows/bus-terminal.yaml",
                note: "워크플로우를 만든 경우에만 필요합니다."
            },
            {
                downloaded: "warp-settings.yaml",
                destination: "Warp 앱 설정에서 수동 확인",
                note: "Warp 일반 설정은 버전에 따라 경로가 달라 참고용으로 제공합니다."
            }
        ],
        steps: [
            "기존 ~/.warp/themes, ~/.warp/workflows 파일을 필요하면 백업합니다.",
            "theme/workflow YAML을 Warp 폴더에 복사합니다.",
            "Warp를 다시 열고 Settings에서 테마와 옵션을 확인합니다."
        ],
        commands: [
            "mkdir -p ~/.warp/themes ~/.warp/workflows",
            "cp ~/Downloads/warp-theme.yaml ~/.warp/themes/bus-terminal.yaml",
            "cp ~/Downloads/warp-workflows.yaml ~/.warp/workflows/bus-terminal.yaml 2>/dev/null || true"
        ],
        verify: "Warp Settings의 Appearance 또는 Theme 목록에서 bus-terminal 테마가 보이는지 확인하세요.",
        caution: "warp-settings.yaml은 자동 적용용 파일이 아니라 설정값을 확인하기 위한 참고 파일입니다."
    },
    iterm2: {
        id: "iterm2",
        label: "iTerm2",
        slug: "iterm2-itermcolors-import",
        seoTitle: "iTerm2 .itermcolors 가져오기와 Dynamic Profile 적용 | 버스터미널",
        seoDescription: "iTerm2 컬러 프리셋 .itermcolors를 Import하고 DynamicProfiles 폴더에 프로파일 JSON을 넣는 방법을 안내합니다.",
        summary: "컬러 프리셋은 iTerm2에서 Import하고, 프로파일 JSON은 DynamicProfiles 폴더에 둡니다.",
        files: [
            {
                downloaded: "BusTerminal.itermcolors",
                destination: "iTerm2 Preferences > Profiles > Colors > Color Presets > Import",
                note: "클릭으로 가져오는 파일입니다."
            },
            {
                downloaded: "BusTerminal.profile.json",
                destination: "~/Library/Application Support/iTerm2/DynamicProfiles/BusTerminal.json",
                note: "macOS 전용 경로입니다."
            }
        ],
        steps: [
            "iTerm2 Preferences에서 .itermcolors 파일을 Import합니다.",
            "프로파일 JSON은 DynamicProfiles 폴더에 BusTerminal.json 이름으로 복사합니다.",
            "iTerm2를 다시 열고 BusTerminal 프로파일을 선택합니다."
        ],
        commands: [
            "mkdir -p \"$HOME/Library/Application Support/iTerm2/DynamicProfiles\"",
            "cp \"$HOME/Downloads/BusTerminal.profile.json\" \"$HOME/Library/Application Support/iTerm2/DynamicProfiles/BusTerminal.json\""
        ],
        verify: "iTerm2 Profiles 목록에 BusTerminal 프로파일이 보이고, Color Presets에 가져온 색상이 보이면 성공입니다.",
        caution: "iTerm2 설정은 macOS에서만 적용됩니다."
    },
    neovim: {
        id: "neovim",
        label: "Neovim",
        slug: "neovim-init-lua-apply",
        seoTitle: "Neovim init.lua 적용 방법 | 버스터미널",
        seoDescription: "다운로드한 init.lua를 ~/.config/nvim/init.lua로 옮기고 Neovim에서 lazy.nvim 플러그인을 동기화하는 방법을 안내합니다.",
        summary: "init.lua를 ~/.config/nvim/init.lua로 옮긴 뒤 Neovim에서 플러그인을 동기화합니다.",
        files: [
            {
                downloaded: "init.lua",
                destination: "~/.config/nvim/init.lua"
            }
        ],
        steps: [
            "기존 ~/.config/nvim/init.lua를 백업합니다.",
            "Downloads 폴더의 init.lua를 ~/.config/nvim/init.lua로 복사합니다.",
            "nvim을 열고 플러그인 설치가 필요하면 :Lazy sync를 실행합니다."
        ],
        commands: [
            "mkdir -p ~/.config/nvim",
            "cp ~/.config/nvim/init.lua ~/.config/nvim/init.lua.bak 2>/dev/null || true",
            "cp ~/Downloads/init.lua ~/.config/nvim/init.lua",
            "nvim"
        ],
        verify: "Neovim을 열었을 때 테마, line number, 상태줄이 바뀌고 오류 메시지가 없으면 성공입니다.",
        caution: "LSP 서버와 외부 CLI는 별도로 설치해야 할 수 있습니다."
    },
    helix: {
        id: "helix",
        label: "Helix",
        slug: "helix-config-toml-apply",
        seoTitle: "Helix config.toml 적용 방법 | 버스터미널",
        seoDescription: "Helix config.toml과 languages.toml을 ~/.config/helix 폴더에 넣고 hx에서 확인하는 방법을 안내합니다.",
        summary: "config.toml과 languages.toml을 ~/.config/helix 폴더에 넣습니다.",
        files: [
            {
                downloaded: "helix-config.toml",
                destination: "~/.config/helix/config.toml",
                note: "파일 이름을 config.toml로 바꿉니다."
            },
            {
                downloaded: "helix-languages.toml",
                destination: "~/.config/helix/languages.toml",
                note: "언어 서버를 설정한 경우에만 필요합니다."
            }
        ],
        steps: [
            "기존 ~/.config/helix 폴더의 TOML 파일을 백업합니다.",
            "다운로드한 파일을 config.toml, languages.toml 이름으로 복사합니다.",
            "Helix를 다시 열어 테마와 LSP 설정을 확인합니다."
        ],
        commands: [
            "mkdir -p ~/.config/helix",
            "cp ~/.config/helix/config.toml ~/.config/helix/config.toml.bak 2>/dev/null || true",
            "cp ~/Downloads/helix-config.toml ~/.config/helix/config.toml",
            "cp ~/Downloads/helix-languages.toml ~/.config/helix/languages.toml 2>/dev/null || true"
        ],
        verify: "hx를 다시 열었을 때 테마와 editor 옵션이 바뀌면 성공입니다.",
        caution: "언어 서버 실행 파일은 Helix가 자동 설치하지 않으므로 별도로 설치해야 합니다."
    },
    zsh: {
        id: "zsh",
        label: "Zsh",
        slug: "zshrc-apply",
        seoTitle: "Zsh .zshrc 적용 방법 | 버스터미널",
        seoDescription: "다운로드한 .zshrc와 starship.toml을 홈 폴더와 ~/.config에 배치하고 source ~/.zshrc로 적용하는 방법을 안내합니다.",
        summary: ".zshrc는 홈 폴더에, Starship 설정은 ~/.config/starship.toml에 둡니다.",
        files: [
            {
                downloaded: ".zshrc",
                destination: "~/.zshrc"
            },
            {
                downloaded: "starship.toml",
                destination: "~/.config/starship.toml",
                note: "Starship 프롬프트를 선택한 경우에만 필요합니다."
            }
        ],
        steps: [
            "기존 ~/.zshrc를 백업합니다.",
            "다운로드한 .zshrc를 홈 폴더로 복사합니다.",
            "터미널을 새로 열거나 source ~/.zshrc로 다시 읽습니다."
        ],
        commands: [
            "cp ~/.zshrc ~/.zshrc.bak 2>/dev/null || true",
            "cp ~/Downloads/.zshrc ~/.zshrc",
            "mkdir -p ~/.config",
            "cp ~/Downloads/starship.toml ~/.config/starship.toml 2>/dev/null || true",
            "source ~/.zshrc"
        ],
        verify: "새 터미널 탭을 열었을 때 프롬프트, alias, PATH가 의도대로 바뀌었는지 확인하세요.",
        caution: "Starship이나 zsh 플러그인은 로컬에 설치되어 있어야 제대로 동작합니다."
    },
    tmux: {
        id: "tmux",
        label: "tmux",
        slug: "tmux-conf-apply",
        seoTitle: "tmux .tmux.conf 적용 방법 | 버스터미널",
        seoDescription: "다운로드한 .tmux.conf를 홈 폴더에 두고 tmux source-file ~/.tmux.conf로 다시 읽는 방법을 안내합니다.",
        summary: ".tmux.conf를 홈 폴더에 둔 뒤 실행 중인 tmux에서 source-file을 실행합니다.",
        files: [
            {
                downloaded: ".tmux.conf",
                destination: "~/.tmux.conf"
            }
        ],
        steps: [
            "기존 ~/.tmux.conf를 백업합니다.",
            "다운로드한 .tmux.conf를 홈 폴더로 복사합니다.",
            "tmux 안에서 source-file 명령으로 다시 읽습니다."
        ],
        commands: [
            "cp ~/.tmux.conf ~/.tmux.conf.bak 2>/dev/null || true",
            "cp ~/Downloads/.tmux.conf ~/.tmux.conf",
            "tmux source-file ~/.tmux.conf"
        ],
        verify: "상태바, prefix, pane 이동 키가 바뀌었는지 확인하세요.",
        caution: "TPM 플러그인을 선택했다면 tmux 안에서 prefix + I로 플러그인을 설치해야 할 수 있습니다."
    }
};

export const APPLY_GUIDE_ORDER: ExportPlatform[] = [
    "ghostty",
    "warp",
    "iterm2",
    "neovim",
    "helix",
    "zsh",
    "tmux"
];

export function getApplyGuide(id: ExportPlatform) {
    return APPLY_GUIDES[id];
}

export function getApplyGuideBySlug(slug: string) {
    return APPLY_GUIDE_ORDER.map(id => APPLY_GUIDES[id]).find(guide => guide.slug === slug);
}
