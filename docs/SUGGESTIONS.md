# 버스터미널 신규 기능 및 고급 설정 제안서

본 문서는 시각적 터미널 설정 플랫폼 **버스터미널(Bus Terminal)**의 다음 개선 방향을 정리한다. 기존 아이디어성 제안뿐 아니라, 현재 코드 기준으로 바로 보강할 수 있는 기능과 각 승강장별 Advanced 설정 후보를 함께 다룬다.

---

## 0. 현재 구현 상태 기준

| 영역 | 현재 상태 | 보강 방향 |
|---|---|---|
| Ghostty | 핵심 GUI, import, preview, export, 기본/고급/전문가 탭, Expert 검색, keybind CRUD 구현 | palette editor, 실제 Ghostty schema 자동 동기화 |
| tmux | 상태바, prefix, mouse, plugin, preview, 기본 key binding 전체 편집, custom plugin/binding 구현 | copy-mode 세부 키맵, status token builder |
| Neovim | 기본 옵션, plugin, keymap CRUD, LSP/Mason/formatter/completion 고급 옵션 구현 | Treesitter/DAP/diagnostics 세부 설정 |
| Zsh | prompt, history, plugin, alias, PATH/env/function/completion/starship.toml 구현 | lazy-load preset, secret detector |
| Theme Center | 테마 선택 후 Ghostty/tmux/Neovim 일부 적용 | ANSI 16색 편집, 대비 검사, before/after preview |
| Export | 4개 파일/Starship 파일 다운로드, 설치 스크립트, 진단 리포트 구현 | zip 번들, install script 안전성 강화 |
| Saved Routes | localStorage 저장/삭제/재탑승/search/rename/duplicate/share 구현 | tags, favorites, version history |
| Share | base64 hash 공유 링크 복사/import 구현 | 서버형 `/share/:slug` |
| Mobile | 데스크탑 중심 레이아웃 | 하단 탭바, 모바일 preview, export CTA |
| Quality | 출발 전 진단 리포트 구현. 테스트 자동화 없음 | parser/export snapshot 테스트, CI |
| Navigation | Cmd/Ctrl-K command palette 구현 | 단축키 도움말, 페이지별 action command |

---

## 1. 우선 추가하면 좋은 핵심 기능

### 1.1 설정 품질 진단 리포트

**개요**: 사용자가 출발하기 전에 현재 설정의 문제, 누락, 충돌 가능성을 자동으로 점검한다.

**주요 진단 예시**
- Neovim: `colorscheme = catppuccin`인데 `catppuccin` 플러그인이 선택되지 않음.
- Neovim: `lualine` 상태바 선택인데 `lualine.nvim` 미선택.
- tmux: `continuum` 선택인데 `resurrect` 미선택.
- Zsh: Starship 프롬프트 선택인데 `starship.toml` 또는 설치 안내 없음.
- Ghostty: 투명도/블러를 과하게 낮춰 가독성이 떨어짐.

**구현 메모**
- 각 store의 `exportText()` 직전에 `validateConfig(platform, config)`를 실행.
- 결과는 `error`, `warning`, `info` 레벨로 구분.
- Export 페이지에 "출발 전 점검" 패널로 노출.

### 1.2 Export 번들 고도화

**개요**: 현재 4개 파일을 따로 다운로드하는 방식에서, 실제 설치 가능한 패키지로 발전시킨다.

**세부 기능**
- `bus-terminal-config.zip` 다운로드.
- 포함 파일:
  - `ghostty/config`
  - `.tmux.conf`
  - `nvim/init.lua`
  - `.zshrc`
  - `install.sh`
  - `README.md`
- `install.sh` 옵션:
  - `--dry-run`: 실제 복사 없이 적용 경로만 출력.
  - `--backup`: 기존 설정을 timestamp 폴더로 백업.
  - `--only ghostty|tmux|neovim|zsh`: 특정 승강장만 적용.

### 1.3 Saved Routes 관리 고도화

**개요**: "차고"를 단순 저장소가 아니라 내 설정 히스토리와 프리셋 관리 공간으로 만든다.

**세부 기능**
- 노선 이름 변경 UI.
- 노선 복제.
- 플랫폼/태그/생성일 검색 필터.
- 즐겨찾기.
- 노선 간 diff.
- 버전 히스토리: 같은 이름으로 저장하면 새 revision으로 보관.
- Ghostty 외 tmux/Neovim/Zsh도 재탑승 가능하도록 import 파서 추가.

### 1.4 공유 기능 MVP 연결

**개요**: 이미 존재하는 base64 hash 공유 유틸을 실제 UI에 연결한다.

**단계별 구현**
- 1단계: 현재 노선 공유 버튼 추가.
- 2단계: `MAX_SHARE_URL_LENGTH` 초과 시 "링크가 길어 공유가 불안정할 수 있음" 경고.
- 3단계: 서버 저장 기반 `/share/:slug` 도입.
- 4단계: 공유 노선 preview 후 "내 차고에 복사" 기능.

### 1.5 단축키 전광판 및 치트시트 생성기

**개요**: Ghostty/tmux/Neovim 단축키를 통합해 한 장짜리 치트시트를 생성한다.

**세부 기능**
- 플랫폼별 그룹 표시: Terminal / tmux / Neovim.
- PDF 또는 HTML 다운로드.
- 세컨 모니터용 standalone view.
- conflict warning: 같은 조합이 여러 플랫폼에서 겹칠 때 표시.

### 1.6 원클릭 스타터 패키지

**개요**: 개별 설정을 하나씩 고르지 않고, 목적별로 검증된 4개 플랫폼 설정을 한 번에 적용한다.

**패키지 후보**
- **Vim 입문 노선**: which-key, telescope, sane keymaps, 친절한 statusline.
- **프론트엔드 노선**: TypeScript LSP, prettier, eslint, git prompt, fzf-tab.
- **Rust/Go 시스템 노선**: 빠른 shell, minimal tmux, rust-analyzer/gopls.
- **Minimal SSH 노선**: 낮은 GPU/폰트 의존성, tmux session 복원, 기본 zsh.
- **Aesthetic Desktop 노선**: 투명 Ghostty, 테마 동기화, Starship prompt.

### 1.7 Interactive Theme Lab

**개요**: 테마 카탈로그를 선택하는 수준에서 ANSI 16색과 플랫폼별 매핑을 직접 편집하는 연구소로 확장한다.

**세부 기능**
- ANSI 0-15 팔레트 직접 편집.
- 배경/전경 WCAG 대비 점수 표시.
- Ghostty/tmux/Neovim preview 동시 표시.
- before/after 비교.
- 밝은 테마에서 selection/cursor 가독성 경고.
- JSON/TOML/Conf 팔레트 export.

### 1.8 모바일 워크플로우

**개요**: 모바일에서도 "설정 확인 → 저장 → 공유"까지 끊기지 않게 만든다.

**세부 기능**
- 하단 탭바: Home / Ghostty / Themes / Routes / More.
- 모바일 full-screen preview.
- Export sticky CTA.
- 긴 form grid의 1열 최적화.
- Saved Routes table을 card list로 전환.

### 1.9 `bus` CLI

**개요**: 웹에서 만든 설정을 로컬 환경에 안전하게 동기화한다.

```bash
npm install -g @busterminal/cli
bus login
bus pull --backup
bus diff
bus apply --only ghostty
```

**초기 기능 범위**
- `bus pull`: 내 차고의 최신 노선 다운로드.
- `bus diff`: 로컬 파일과 버스터미널 노선 비교.
- `bus apply`: 백업 후 적용.
- `bus doctor`: 필요한 도구 설치 여부 확인.

---

## 2. Advanced 설정 설계 원칙

Advanced 설정은 "많이 쓰지만 초보 UI에는 부담스러운 옵션"부터 넣는다.

**우선순위 기준**
- 실제 사용 빈도가 높다.
- export 결과가 명확하다.
- preview 또는 진단으로 효과를 설명할 수 있다.
- 잘못 설정했을 때 복구가 쉽다.
- 플랫폼별 기본값과 충돌하지 않는다.

**UI 구조**
- 각 승강장에 `고급 설정` 토글 추가.
- Advanced는 기본 화면 아래 접힌 패널로 제공.
- 위험하거나 이해가 필요한 옵션은 `Pro` 배지와 설명 tooltip을 붙인다.
- 설정 변경 후 Export preview에 즉시 반영한다.

---

## 3. 승강장별 Advanced 설정 후보

### 3.1 Ghostty 승강장

Ghostty는 실제 터미널 에뮬레이터이므로, 폰트/렌더링/창/키보드/클립보드 옵션이 가장 중요하다.

#### 우선 구현 추천

| 그룹 | 옵션 | UI | 설명 |
|---|---|---|---|
| Typography | `font-feature` | multi text chips | ligature, stylistic set 제어. 예: `+liga`, `+calt`, `+ss01` |
| Typography | `font-thicken` | toggle | 가는 폰트 보정. macOS 사용자에게 유용 |
| Typography | bold/italic font style | text input group | bold/italic 전용 폰트 지정 |
| Window | `window-padding-balance` | toggle | 좌우/상하 padding 균형 |
| Window | `window-decoration` 계열 | select | native/transparent/hidden 스타일 확장 |
| Interaction | `copy-on-select` | toggle | 선택 즉시 클립보드 복사 |
| Interaction | `mouse-hide-while-typing` | toggle | 타이핑 중 포인터 숨김 |
| Interaction | `keybind` builder | repeatable rows | `ctrl+shift+t=new_tab` 같은 단축키 CRUD |
| Shell | `shell-integration` | select | detect/zsh/fish/bash/none |
| Close Safety | `confirm-close-surface` | toggle | 프로세스 실행 중 닫기 확인 |

#### 다음 단계 후보

| 그룹 | 옵션 | UI | 설명 |
|---|---|---|---|
| Performance | `fps-limit` | range 30-240 | 배터리/고주사율 모니터 대응 |
| Performance | `gpu-rasterization` | select | GPU 렌더링 제어 |
| Mouse | `mouse-scroll-multiplier` | range | 트랙패드/휠 스크롤 감도 |
| Clipboard | clipboard trim/unsafe paste 관련 옵션 | toggles | 붙여넣기 보안과 편의성 조절 |
| Launch | command/working directory | text inputs | 기본 shell 또는 시작 경로 지정 |

#### 진단 규칙
- `background-opacity < 0.55`이고 밝은 foreground가 아니면 가독성 경고.
- `font-feature`에 중복 값이 있으면 정리 제안.
- `copy-on-select`와 민감한 업무 환경 안내.

---

### 3.2 tmux 승강장

tmux는 터미널 에뮬레이터가 아니라 터미널 멀티플렉서다. 사용자에게 가장 체감되는 영역은 prefix, copy-mode, pane/window 관리, session 복원이다.

#### 우선 구현 추천

| 그룹 | 옵션 | UI | 설명 |
|---|---|---|---|
| Copy Mode | `mode-keys` | segmented `vi`/`emacs` | 복사 모드 키맵. Vim 사용자에게 `vi`가 매우 유용 |
| Copy Mode | `history-limit` | range/input | scrollback 줄 수. 10,000~50,000 자주 사용 |
| Copy Mode | clipboard command | select/text | macOS `pbcopy`, Linux `xclip/wl-copy` 안내 |
| Window | `renumber-windows` | toggle | 창 닫은 뒤 번호 자동 재정렬 |
| Window | `base-index` + `pane-base-index` | segmented 0/1 | 현재는 pane-base-index도 함께 맞추는 것이 자연스러움 |
| Pane | split binding preset | select | `|`/`-` 또는 `%`/`"` 프리셋 |
| Pane | vim-style pane navigation | toggle | `h/j/k/l` pane 이동 |
| Session | resurrect/continuum preset | toggle group | 재부팅 후 session 복원 |
| Status | `status-left/right` builder | token editor | 시간, session, host, battery, git segment |

#### 다음 단계 후보

| 그룹 | 옵션 | UI | 설명 |
|---|---|---|---|
| Performance | `escape-time` | number | Vim inside tmux 반응성 개선 |
| Resize | pane resize step | number | prefix+arrow resize step |
| Mouse | mouse drag/copy behavior | toggles | 마우스 사용 세부 제어 |
| Session | `destroy-unattached` | select | unattached session 정리 |
| Theme | catppuccin/tokyonight plugin options | form | plugin별 상태바 테마 옵션 |
| Plugin | custom plugin rows | repeatable rows | `owner/repo` 직접 추가 |

#### 진단 규칙
- `continuum` 선택 시 `resurrect`가 없으면 warning.
- `history-limit`이 너무 높으면 메모리 사용 안내.
- `prefix = C-a` 선택 시 shell/readline과의 충돌 가능성 안내.

---

### 3.3 Neovim 승강장

Neovim은 Advanced에서 가장 가치가 크다. 단, 모든 Lua를 GUI화하기보다 LSP, formatter, completion, navigation처럼 대부분의 사용자가 반복 설정하는 영역부터 다룬다.

#### 우선 구현 추천

| 그룹 | 옵션 | UI | 설명 |
|---|---|---|---|
| Editor | `scrolloff` | range 0-20 | 커서 주변 여백 |
| Editor | `sidescrolloff` | range 0-20 | 가로 스크롤 여백 |
| Editor | `wrap` | toggle | 긴 줄 줄바꿈 |
| Editor | `clipboard` | select | unnamedplus/system clipboard |
| Editor | `ignorecase`/`smartcase` | toggles | 검색 UX 개선 |
| LSP | Mason tool selector | multi select | tsserver/lua_ls/pyright/rust_analyzer/gopls 등 |
| LSP | `mason-lspconfig.ensure_installed` | generated list | 선택 도구 자동 설치 |
| Format | `conform.nvim` | toggle + language rows | save 시 prettier/stylua/black/rustfmt |
| Completion | `nvim-cmp` preset | select | enter-confirm/tab-complete/super-tab |
| Diagnostics | virtual text/signs/underline | toggles | 오류 표시 방식 |
| File Tree | neo-tree open binding | text input | 파일 탐색 단축키 |

#### 많이 쓰는 언어 프리셋

| 프리셋 | LSP | Formatter/Linter |
|---|---|---|
| Frontend | ts_ls, eslint, jsonls, cssls, html | prettier, eslint_d |
| Lua/Neovim | lua_ls | stylua |
| Python | pyright 또는 basedpyright | black, ruff |
| Rust | rust_analyzer | rustfmt |
| Go | gopls | gofmt, goimports |
| Docker/YAML | dockerls, yamlls | prettier |

#### 다음 단계 후보

| 그룹 | 옵션 | UI | 설명 |
|---|---|---|---|
| DAP | debug adapter preset | select | JS/Python/Rust debugging |
| Treesitter | parser selector | multi select | language parser 설치 |
| Git | gitsigns options | toggles | blame, current line blame, signs |
| UI | dashboard/start screen | select | alpha.nvim 등 |
| Keymap | conflict detector | report | lhs 중복 감지 |

#### 진단 규칙
- colorscheme 선택 시 대응 theme plugin이 없으면 warning.
- lualine 선택 시 lualine plugin이 없으면 warning.
- `require("lazy")`를 생성하는데 lazy plugin이 빠져 있으면 error.
- keymap lhs 중복 감지.

---

### 3.4 Zsh 승강장

Zsh는 사용자가 매일 체감하는 영역이 history, completion, prompt, alias/function, PATH다. Advanced는 "빠른 시작"과 "설치 가능한 출력"을 중심으로 설계한다.

#### 우선 구현 추천

| 그룹 | 옵션 | UI | 설명 |
|---|---|---|---|
| History | `HISTFILE` | text input | history 저장 경로 |
| History | `HIST_IGNORE_ALL_DUPS` | toggle | 전체 중복 제거 |
| History | `HIST_REDUCE_BLANKS` | toggle | 불필요 공백 제거 |
| History | `INC_APPEND_HISTORY` | toggle | 명령 즉시 history 저장 |
| Completion | `autoload -Uz compinit` | toggle | completion 시스템 초기화 |
| Completion | `zstyle` matcher | select | 대소문자 무시 completion |
| Prompt | Starship module editor | nested panels | directory/git/node/python/rust symbol/color |
| Prompt | `starship.toml` export | extra file | `.zshrc`와 함께 생성 |
| Plugin | install commands | readonly block | 외부 plugin clone 안내 |
| PATH | PATH list builder | reorderable list | `export PATH="...:$PATH"` 생성 |
| Env | environment variable builder | key/value rows | `export NAME=value` |
| Alias | alias validation | inline warning | 공백/예약어/중복 검사 |
| Function | shell function builder | repeatable editor | 자주 쓰는 함수 저장 |

#### 다음 단계 후보

| 그룹 | 옵션 | UI | 설명 |
|---|---|---|---|
| Performance | `zcompile` | toggle + caution | `.zshrc.zwc` 컴파일 안내 |
| Performance | lazy-load plugin preset | select | nvm/pyenv/rbenv lazy loading |
| Directory | `AUTO_PUSHD`/`PUSHD_IGNORE_DUPS` | toggles | cd stack 개선 |
| Keybind | vi/emacs mode | segmented | zsh line editor mode |
| FZF | fzf key bindings | toggles | ctrl-r/alt-c completion |
| Security | secret detector | warning | export 값에 token 패턴 있으면 경고 |

#### 진단 규칙
- external plugin이 선택됐지만 source 경로만 주석이면 설치 안내 표시.
- Starship 선택 시 설치 명령과 `starship.toml` 생성 여부 안내.
- PATH에 같은 경로가 중복되면 warning.
- alias name이 기존 명령어와 충돌할 가능성이 있으면 info.

---

## 4. 향후 추가 터미널 에뮬레이터 후보

Ghostty 외 터미널 사용자도 흡수하려면 같은 테마/폰트 모델을 다른 설정 포맷으로 직렬화하면 된다.

### 4.1 Kitty

**우선 옵션**
- `font_family`, `font_size`
- `background`, `foreground`, `color0`~`color15`
- `background_opacity`
- `cursor_shape`, `cursor_blink_interval`
- `scrollback_lines`
- `enable_audio_bell`
- `copy_on_select`
- `map` keybinding rows

**장점**
- conf 형식이 단순해서 Ghostty 모델 재사용 가능.
- power user가 많아 keybinding/theme 수요가 큼.

### 4.2 Alacritty

**우선 옵션**
- TOML/YAML 포맷 선택 또는 최신 TOML 우선.
- font family/size/style.
- window padding/opacity/decorations.
- colors primary/normal/bright.
- cursor style/blinking.
- scrolling history.
- key bindings.

**장점**
- 성능 중심 사용자 흡수.
- 설정 구조가 명확해서 form 기반 생성이 쉬움.

### 4.3 WezTerm

**우선 옵션**
- Lua config 생성.
- `font`, `font_size`
- `color_scheme` 또는 직접 colors table.
- `window_background_opacity`
- `enable_tab_bar`, tab position/style.
- leader key.
- key tables / split pane bindings.
- launch menu.

**장점**
- tmux와 일부 역할이 겹쳐 "WezTerm만으로 tmux 대체" 패키지 제안 가능.

---

## 5. 구현 순서 제안

### Phase 1: 바로 체감되는 개선

1. Export 전 설정 품질 진단 리포트.
2. tmux `mode-keys`, `history-limit`, `renumber-windows`, pane-base-index 연동.
3. Neovim colorscheme/plugin, lualine/plugin 진단.
4. Zsh PATH/env builder.
5. Saved Routes rename/duplicate/search.

### Phase 2: Advanced 패널 확장

1. Ghostty keybind builder.
2. tmux key binding/plugin custom rows.
3. Neovim Mason/LSP/formatter selector.
4. Zsh Starship module editor + `starship.toml` export.
5. Theme Lab ANSI 16색 editor.

### Phase 3: 배포/공유 완성도

1. zip export + `install.sh`.
2. base64 공유 UI 연결.
3. 서버 기반 `/share/:slug`.
4. `bus` CLI 초안.
5. 커뮤니티 노선 갤러리.

---

## 6. 문서/코드 정합성 보강 메모

- README의 구현 상태를 최신화한다. Neovim/Zsh는 더 이상 예정이 아니다.
- `docs/ROADMAP.md`와 본 문서의 역할을 구분한다.
  - `ROADMAP.md`: 일정/운영/서비스화 관점.
  - `SUGGESTIONS.md`: 기능 명세/Advanced 옵션 후보.
- 설정 직렬화는 snapshot 테스트를 추가한다.
- import parser는 Ghostty만 있으므로, tmux/Neovim/Zsh는 우선 "내부 생성 설정 재탑승"부터 지원한다.
- `window.prompt`/`confirm` 기반 UX는 Modal로 교체한다.
