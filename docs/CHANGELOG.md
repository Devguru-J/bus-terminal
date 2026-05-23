# 작업 내역 (Changelog)

> 버스터미널 v0.1 → v0.2 개발 여정. 시간순 정리.
> 라이브: <https://bus-terminal.pages.dev/> · 리포: <https://github.com/Devguru-J/bus-terminal>

---

## 0. 시작 지점

**입력 자료**
- 레퍼런스 리포지토리: `reference/ghostty-config-main` (Svelte 기반 ghostty 설정 생성기)
- Stitch 디자인 프로젝트 ID `4848873992401088346` — 7장 스크린샷 + 1장 HTML
- 후속으로 신규 6장 (HTML 포함) 다시 받음
- 제품 요구: 한국어 우선 / "환승센터" 메타포 / Ghostty + tmux 우선 / 기술 스택 강제 (Bun, React, TS, Vite, Tailwind, Zustand, Framer Motion)

---

## 1. v0.1 — 초기 구현 (`6057a82`)

스캐폴드부터 6개 라우트까지 한 번에 만든 첫 커밋.

- **라우트**: `/`, `/ghostty`, `/tmux`, `/themes`, `/my-routes`, `/settings`
- **파서/직렬화**: `parseGhosttyConfig` + `serializeGhosttyConfig` (diff-only export — 기본값과 다른 키만 인쇄)
- **공유**: URL-safe base64 → `#route=...` 해시 (서버리스)
- **6개 테마 카탈로그**: Tokyo Night / Gruvbox Dark / Catppuccin Mocha / Nord / Rosé Pine / Solarized Light
- **tmux 빌더**: prefix · 상태바 · 플러그인 7종 (TPM/sensible/yank/resurrect/continuum/catppuccin/battery)
- **상태**: Zustand persist 4종 (`ghostty`, `tmux`, `routes`, `toast`)
- **출발 전광판**: LED 글자 + 도트매트릭스 + 깜빡임
- **README** 한국어로 작성 (`0aa9597`)

---

## 2. v0.2 — Stitch v2 디자인 시스템 (`e1e61b0`)

Stitch 화면들에서 토큰 추출해서 시각 언어 전면 교체.

### 토큰
| 영역 | 값 |
|---|---|
| Surface 계층 | `#0e0e0e → #353534` (M3 surface-container) |
| Primary | `#00e55b` (terminal green) + `#003911` (on-primary) |
| Secondary | `#4cd6ff` (cyan) |
| Tertiary | `#e7c17d` (amber) |
| 타이포 | Geist (display) + Hanken Grotesk (body) + JetBrains Mono (label/code) |
| 보더 | `border-white/[0.06]` |

### Shell
- `AppShell` = `Sidebar` + `TopBar` + `BottomFooter`
- `Sidebar`: STATION 01 카드 → `New Route` → `PlatformNavItem` (`layoutId` rail)
- `TopBar`: BusTerminal 로고 + UTC 시계 + Material Symbols
- `StationHeader`: FIDS 뱃지 + display-md 타이틀

### 도메인 컴포넌트
- `DepartureStatus` (status pill)
- `PlatformCard` (departure-board 그리드)
- `ConfigPanel`, `TerminalPreview` (neofetch 라이브)
- `ThemeCard` (mini terminal + 팔레트 dots)
- `RouteTable`, `DiffViewer`
- `DepartureComplete`: 버스가 전광판 그리드를 3.6s 횡단 → "DEPARTED" 정지

### 신규 라우트
- `/diff` (설정 비교 — 사이드 바이 사이드)
- `/export` (출발 완료 + 다운로드)

---

## 3. Ghostty 페이지 재구성 (`6e7f6ce` → `139ce4d`)

- 한 번에 5 패널로 펼친 게 사용성 망 → Stitch 사양 2 패널(Appearance / Window)로 축소 → 다시 사용자 요청대로 4 패널로 복원
  - **폰트**: family + 크기 + 줄간격
  - **커서**: Block/Bar/Underline 세그먼티드 + 깜빡임
  - **윈도우**: 패딩 X/Y + 투명도 + 블러 + 타이틀바
  - **터미널 스타일**: 테마 select + 탭 위치
- 우측: 정보 칩 (`현재 구성 / Theme / Font / 생성 파일`) + 큰 TerminalPreview

---

## 4. Neovim · Zsh 승강장 (`5ca7be2`)

`SOON` 해제 — 3·4번 라인 실가동.

**Neovim 승강장 (`/neovim`)**
- 10개 플러그인 카탈로그 (lazy.nvim / Telescope / Treesitter / LSP / Mason / Lualine / Neo-tree / Gitsigns / which-key / Tokyo Night)
- 6개 컬러스킴 + statusline 선택 (lualine/lightline/default)
- 키 매핑 에디터 (lhs/rhs/desc CRUD)
- 라이브 `init.lua` 미리보기

**Zsh 승강장 (`/zsh`)**
- 6개 프롬프트 (default + Starship/Pure/Agnoster/Robbyrussell/Powerlevel10k)
- 히스토리 (HISTSIZE/SAVEHIST + share/dedupe/auto-cd)
- 7개 플러그인 (omz vs ext 프레임워크 뱃지)
- 별칭 CRUD 에디터
- 라이브 `~/.zshrc` 미리보기

**연동**
- Sidebar `NavDisabled` 제거 → 활성 링크
- Home PlatformCard 카드 활성화
- `routesStore.platform` 유니온에 `neovim | zsh` 추가
- Export가 4개 파일 일괄 다운로드 (`ghostty-config`, `.tmux.conf`, `init.lua`, `.zshrc`)

---

## 5. 라이브 미리보기 + 진짜 작동 (`d8afc86`)

**TerminalPreview**
- `cursorStyle` prop: Block(블록) / Bar(세로 막대) / Underline(밑줄) 시각 반영
- `cursorBlink` 토글로 즉시 멈춤/재개
- `blur`: filter + inner-shadow로 backdrop blur 흉내
- `hideTitlebar`: macOS 신호등 chrome 제거
- `tabPosition`: 탭 스트립 상/하 위치

**TmuxPreview (신규)**
- `statusStyle` (`bg=#/fg=#` 또는 named color) 파싱 → 진짜 색
- `leftSegments`/`rightSegments`의 `#[fg=#…]`, `#S`, `%H:%M`, `%Y-%m-%d` 토큰 렌더
- prefix · mouse · base-index · 플러그인 목록 본문 표시

**Themes broadcast**
- Ghostty: `applyTheme`
- tmux: `statusStyle` + 좌/우 세그먼트 자동 갱신
- Neovim: `colorscheme`을 theme id로 매핑 (`tokyo-night → tokyonight` 등)
- Zsh: 색 테마 비호환 안내 (프롬프트는 별도)

**기타**
- Settings에 Neovim/Zsh 리셋 추가
- MyRoutes 다시 탑승: Ghostty=`importText` / 그 외=즉시 다운로드
- tmux: `Refresh Interval`이 `baseIndex`에 잘못 묶인 것을 분리 → `statusInterval` 신규 필드 + `set -g status-interval` 직렬화

---

## 6. 폰트 / 줄간격 / 패널명 (`c14abc0`)

- index.html에 GF 호출 확장 (`Geist Mono`, `Fira Code`, `IBM Plex Mono`, `Source Code Pro`, `Roboto Mono`) → 드롭다운에서 실제로 폰트 바뀜
- 옵션 목록을 GF에 실재하는 것만 노출 (Cascadia/Iosevka 제거)
- `TerminalPreview.lineHeight` prop 신설 → 줄간격 슬라이더 1.0–2.0배 반영
- 패널명 `커서 깜빡임` → `윈도우`

---

## 7. 인터랙티브 미리보기 + Overflow 수정 (`c88dbbb`)

**Range UI overflow 해결**
- `<input type="range">`의 브라우저 기본 min-width로 좁은 그리드 셀에서 값 라벨이 패널 밖으로 튀어나옴
- 컨테이너/input 둘 다 `min-w-0`, 값 라벨 `w-12 + shrink-0 + tabular-nums`

**미리보기에 실제 타이핑**
- 마지막 프롬프트 라인을 `<input>`으로 교체
- `caret-color: transparent` + 사용자 정의 cursor가 항상 끝에 위치
- Enter 시 명령어/출력을 history에 push
- `runFakeShell`: ls / pwd / whoami / date / echo / help / neofetch / clear 지원

---

## 8. 커서 깜빡임 분리 (`398a06f`)

- 기존 `flicker` (FIDS 불규칙 패턴) 를 커서에도 써서 "수명 다한 형광등" 느낌
- 새 키프레임 `cursor-blink` (`steps(2, end)` 1.06s) — 표준 터미널 커서
- `flicker`는 출발 완료/FIDS 제목 전용으로 보존

---

## 9. 도구별 진짜 기본값 (`ff022ef`)

| 도구 | 핵심 변경 |
|---|---|
| Ghostty | font-size 13 / background `#1d1f21` / cursor = foreground / padding 2px / xterm 16색 팔레트 |
| tmux | prefix `C-b` / mouse off / base-index 0 / `status-position bottom` / `fg=black,bg=green` / interval 15s |
| Neovim | leader `\` / 줄번호 off / tabstop 8 + 하드탭 / colorscheme `default` / 플러그인 없음 |
| Zsh | `default` 프롬프트 / HISTSIZE 30 / SAVEHIST 0 / 모든 옵션 off |

4개 스토어 persist `version: 1 → 2` bump → 기존 localStorage 자동 폐기.

---

## 10. 배포 (`ef71ded` → `38700ea`)

- Cloudflare Pages용 `public/_redirects` 추가 (`/* /index.html 200`)
- 빌드 명령: `bun install && bun run build` (CF가 Bun 프로젝트는 자동 install 안 함)
- 환경변수: `BUN_VERSION=1.1.38`, `NODE_VERSION=20`
- 라이브 URL: <https://bus-terminal.pages.dev/>
- README에 데모 링크 추가

---

## 11. redesign-existing-projects 스킬 패스 (`b2ab5ee`)

| # | 픽스 |
|---|---|
| 1 | `lucide-react` 제거 (Material Symbols로 통일 후 미사용) |
| 2 | Button `focus-visible:ring-2 ring-primary-fixed-dim` 적용 |
| 3 | 404 NotFoundPage + catch-all `<Route path="*">` |
| 4 | Skip-to-content 링크 + main `id="main"` |
| 5 | OG/Twitter/description 메타 태그 |
| 6 | `text-wrap: balance` (h1–h3), `pretty` (p) |
| 7 | `scroll-behavior: smooth` + `prefers-reduced-motion` 글로벌 처리 |
| 8 | PlatformCard 영문 마케팅 카피 → 한국어 구체 카피 |

---

## 12. UI 잔손질 (`60d7865` → `8d1c18c`)

- 테마 이름 한국 별칭 → 원래 영문명 환원 (Tokyo Night, Gruvbox Dark, …)
- Ghostty 터미널 스타일 select에 `Default (테마 없음)` 옵션
- 신규 store 메서드 `resetColors()` — 색·팔레트만 ghostty 기본값으로 환원

---

## 13. design-taste-frontend 스킬 패스 (`f467585`)

DESIGN_VARIANCE 8 / MOTION_INTENSITY 6 / VISUAL_DENSITY 4 베이스라인 적용.

- `min-h-screen` → `min-h-[100dvh]` (iOS Safari viewport 점프 방지)
- `MagneticButton` 신규: `useMotionValue` + `useSpring` (React 렌더 사이클 외부, 모바일 안전) → Home 히어로 CTA 적용
- Home PlatformCard 그리드 `staggerChildren 0.08s` orchestration + per-card spring entry
- PlatformCard 재료감
  - 커서 추적 spotlight (radial-gradient + CSS 변수, React state 미사용)
  - 상단 엣지 그린 그래디언트 라인 hover 노출
  - inner edge refraction (1px white border + inset shadow)
- persist v2 migrate 함수 명시 → 콘솔 "no migrate function" 에러 0

---

## 최종 상태 스냅샷

| 지표 | 값 |
|---|---|
| 소스 파일 | 53개 |
| 코드 라인 | 약 4,800 LOC (`*.ts/tsx`) |
| 빌드 사이즈 | 124 KB gzip (JS) + 7 KB gzip (CSS) |
| 라우트 | 10개 (`/`, `/ghostty`, `/tmux`, `/neovim`, `/zsh`, `/themes`, `/my-routes`, `/diff`, `/export`, `/settings`) + `*` (404) |
| 스토어 | 5종 (ghostty/tmux/neovim/zsh + routes + toast) — persist v2 |
| 의존성 | clsx · framer-motion · react · react-dom · react-router-dom · tailwind-merge · zustand |
| 폰트 | Geist · Hanken Grotesk · JetBrains Mono · Geist Mono · Fira Code · IBM Plex Mono · Source Code Pro · Roboto Mono (GF) |

**검증**
- `bun run build`: ✅ (1초)
- 모든 라우트 HTTP 200
- 콘솔 에러 0 (warning은 react-router v7 future flag 정보성)
- Lighthouse는 아직 측정 안 함 (다음 단계)
