# 본격 서비스화 로드맵

> 현재 상태: MVP 데모 (CF Pages). "내가 잘 동작하는 걸 시연한다" 수준.
> 목표 상태: 일반 개발자가 "내 첫 터미널 설정을 만들고 공유한다"에 도달.

각 항목은 **Why → What → How**의 짧은 카드로 정리. 우선순위는 위에서 아래 (먼저 할수록 큰 임팩트).

---

## 0. 현재 안 되어 있는 것 — 한눈에

| 영역 | 상태 |
|---|---|
| 데이터 영속화 | ⚠️ `localStorage`만. 브라우저/디바이스 바뀌면 증발 |
| 다중 디바이스 동기화 | ❌ 없음 |
| 사용자 계정 | ❌ 없음 |
| 공유한 노선의 URL 영속성 | ⚠️ base64 해시 공유 UI는 연결됨. 서버 영속 URL은 없음 |
| 커뮤니티 노선 / 갤러리 | ❌ 없음 |
| 모바일 UX | ⚠️ 사이드바 데스크탑 전용 (`hidden lg:flex`) |
| 검색/필터 | ⚠️ Cmd/Ctrl-K 팔레트, Saved Routes 검색, Ghostty Expert 검색 구현. 갤러리 검색은 없음 |
| 분석 (어떤 옵션이 인기?) | ❌ 없음 |
| 에러 트래킹 | ❌ 없음 |
| 테스트 | ❌ 없음 |
| i18n | ⚠️ 한국어 일방. 영어 사용자 진입 불가 |
| 접근성 검증 | ⚠️ Skip-link/focus-ring/도움말 tooltip 추가. 자동 검사 안 함 |
| Lighthouse / Core Web Vitals | ❓ 측정 안 함 |
| SEO | ⚠️ meta 태그만. sitemap/robots 없음 |
| 도메인 / 브랜딩 | ⚠️ `pages.dev` 서브도메인 |

### 0.1 최근 완료된 개선

| 영역 | 완료 내용 |
|---|---|
| Ghostty | 기본/고급/전문가 탭 구조, sticky 대형 미리보기, Expert 설정 검색, keybind CRUD |
| tmux | 기본 키바인딩 전체 목록, 검색/수정/비활성화/복원, custom plugin/binding export |
| Neovim | scrolloff/wrap/clipboard/search/LSP/Mason/conform/cmp 고급 설정 |
| Zsh | PATH/env/function/completion/history/Starship preset 및 starship.toml export |
| Export | 출발 전 진단 리포트, starship.toml 다운로드, install script 다운로드 |
| Saved Routes | 검색, rename, duplicate, share link 복사/import |
| UX | Cmd/Ctrl-K command palette, 홈 네온 사인, 메인 이동 버튼, 도움말 tooltip |

---

## 1. 단기 (1–2주 분량) — 디팩토니 클리닝업

### 1.1 모바일 레이아웃
- **Why**: 사이드바가 `hidden lg:flex`라 모바일에선 네비게이션 자체가 사라짐. 데모 링크 카톡으로 받아서 켜면 페이지가 작동하지 않는 것처럼 보임.
- **What**: 햄버거 + 슬라이드오버 사이드바, 또는 하단 탭바 (모바일은 4–5 라우트로 압축).
- **How**:
  - `useMediaQuery` 훅 + Drawer 컴포넌트 (Radix Dialog 기반)
  - 또는 fixed bottom tabs (Ghostty / tmux / Themes / Saved / More)
  - 우선순위 데스크탑 패리티가 아니라 "코어 워크플로우 (Ghostty 설정 → 다운로드) 완수"

### 1.2 테스트
- **Why**: 파서/직렬화는 데이터 손실 위험이 있는 핵심 로직. 수동 회귀가 한계.
- **What**: Vitest 단위 테스트 ≥ 30개.
- **How**:
  - `lib/parse.test.ts` (palette/keybind/주석/스키마 외 키)
  - `lib/share.test.ts` (encode/decode round-trip)
  - `data/tmux.test.ts` (serialize 출력 검증 — set -g, plugins 블록)
  - `data/neovim.test.ts` (init.lua serialize)
  - `data/zsh.test.ts` (.zshrc serialize)
  - CI: GitHub Actions → `bun test` on PR

### 1.3 E2E 스모크
- **Why**: 라우트별 렌더 회귀 자동화.
- **What**: Playwright로 핵심 플로우 3개.
- **How**:
  - "Ghostty 페이지 진입 → 폰트 변경 → 출발권 다운로드"
  - "Themes Tokyo Night 적용 → Ghostty로 이동 → 미리보기에 색 반영"
  - "Saved Route에 보관 → 새로고침 → 차고에서 다시 탑승"

### 1.4 에러 트래킹 + 분석
- **Why**: 사용자가 어디서 막히는지 / 무엇이 인기인지 모름.
- **What**: Sentry (에러) + Plausible/Umami (개인정보 친화 분석).
- **How**:
  - Sentry: `@sentry/react`. dsn은 CF Pages env에 보관
  - Plausible self-host 또는 plausible.io (월 $9). GA 대신 추천 — 한국 사용자 GDPR/PIPA 친화적
  - 이벤트: `export_clicked` / `theme_applied` / `import_pasted` / `route_saved`

### 1.5 도메인
- **Why**: `pages.dev`는 신뢰감 부족.
- **What**: `busterminal.dev` 같은 짧은 도메인.
- **How**: Cloudflare Registrar (CF Pages와 연동 한 줄). DNS는 자동 세팅.

---

## 2. 중기 (2–4주) — 사용자 계정 & 동기화

이걸 하면 "내 노선이 영구히 보관됨" 약속이 가능해지고, 공유의 의미가 생김.

### 2.1 백엔드 선택
세 가지 옵션:

| 옵션 | 장점 | 단점 |
|---|---|---|
| **Cloudflare Workers + D1 + KV** | CF Pages와 동일 인프라, 무료 티어 넉넉, 한 곳에서 관리 | D1은 아직 베타 흔적 |
| **Supabase** | Postgres + Auth + Storage 한 번에, 한국 docs 풍부 | CF 이탈 → 별도 리전 |
| **PlanetScale + Auth.js** | 친숙한 MySQL | 무료 티어 축소 흐름 |

**권장**: Cloudflare Workers + D1 (스택 일관성). 폭증 시에만 Supabase로 마이그레이션.

### 2.2 인증
- **Why**: 노선을 사용자 계정에 묶기.
- **What**: GitHub OAuth + (선택) Google OAuth.
- **How**:
  - 개발자 타깃이라 GitHub 우선
  - JWT는 CF Workers Secrets에 보관
  - 세션은 HTTPOnly cookie (subdomain scoped)

### 2.3 노선 클라우드 스토리지
- **Why**: localStorage 의존도 제거.
- **What**: `routes` 테이블 (id, user_id, platform, name, text, created_at, updated_at, public)
- **How**:
  - 비로그인: 기존 localStorage 유지
  - 로그인: localStorage 1회 마이그레이션 후 클라우드 동기화
  - `useRoutesStore`를 API-backed로 교체 (TanStack Query 추천)

### 2.4 영속 공유 URL
- **Why**: 현재 base64 해시는 1.8KB 한계 + 디코드 깨짐 위험.
- **What**: `share/:slug` 단축 URL.
- **How**:
  - `POST /share` → 슬러그 발급 (`/share/xkj42m`)
  - DB에 텍스트 보관 (개인 노선은 명시적으로만)
  - 30일 미접근 자동 만료 (선택)

---

## 3. 중장기 (1–2개월) — 커뮤니티 / 갤러리

### 3.1 커뮤니티 노선 갤러리
- **Why**: "이게 잘 만들어진 것 같다"는 사회적 검증이 사용자를 끌어옴.
- **What**: `/explore` 라우트 — 좋아요/포크/조회수 카드 그리드.
- **How**:
  - `/explore` 페이지 + `route.public = true` 필터
  - 카드 UI는 ThemeCard 패턴 재사용 (미니 터미널 미리보기)
  - 정렬: 최신 / 인기 / 트렌딩 (1주 기준)
  - "포크하기" = 내 차고에 복사

### 3.2 검색 + 필터
- **Why**: 갤러리 늘어나면 필수.
- **What**: 전문 검색 + 태그.
- **How**:
  - 검색은 D1에 SQLite FTS 또는 Algolia/Meilisearch (월 $0–$25)
  - 태그: minimal / dark / light / colorful / catppuccin / lots-of-plugins
  - 사용자 태그가 아닌 자동 라벨링 (background 밝기 → "light/dark", 플러그인 수 → "minimal/feature-rich")

### 3.3 갤러리에 포함시킬 가치 있는 시드 데이터
- **Why**: 초기 갤러리가 비면 아무도 안 머묾.
- **What**: 큐레이션된 30–50개 노선.
- **How**:
  - GitHub 인기 dotfiles에서 합법적으로 수집 (각자 라이선스 존중)
  - 우리가 직접 만든 6 테마 × 4 도구 = 24개
  - "스타터 팩": Web Dev / Rust Dev / Vim Power User / Minimalist 등

---

## 4. 신규 승강장 — 5번/6번 라인

### 4.1 yazi
- **Why**: 약속한 4번이 Zsh로 바뀐 자리. yazi는 새로운 매니아층.
- **What**: 파일 매니저 설정 (theme, keymaps, plugins).
- **How**:
  - `yazi.toml` 파서 + 직렬화
  - 키매핑 GUI (Neovim 페이지 재사용)
  - 미리보기: yazi 흉내 (3-column 파일 트리)

### 4.2 starship
- **Why**: Zsh에서 starship 선택 시 별도 `starship.toml`이 필요한데 지금은 안내만.
- **What**: `/starship` 또는 Zsh 페이지 내부 탭.
- **How**:
  - module별 GUI (`character`, `directory`, `git_status`, ...)
  - segment 색·심볼 GUI
  - TOML 직렬화

### 4.3 fish shell
- **Why**: zsh 대안 수요.
- **What**: `~/.config/fish/config.fish` 빌더.
- **How**: Zsh 페이지 패턴 재사용 (프롬프트 / 함수 / abbr).

### 4.4 alacritty / kitty / wezterm
- **Why**: Ghostty 외 터미널 사용자도 흡수.
- **What**: 동일 테마/폰트 적용 + 형식별 직렬화.
- **How**:
  - Themes 환승센터의 broadcast 타깃에 추가
  - 각 형식별 직렬화기 (alacritty=TOML, kitty=conf, wezterm=Lua)

---

## 5. UX/디자인 보강

### 5.1 모바일 미리보기
- **Why**: 모바일에서 큰 미리보기가 잘렸을 때 작동 확인 어려움.
- **What**: 풀스크린 미리보기 모드 (모바일에서 미리보기 탭하면 풀스크린)

### 5.2 키보드 단축키
- **Why**: 개발자 도구의 정체성.
- **What**: cmd-K 명령 팔레트 + 페이지 간 이동.
- **How**:
  - ✅ 자체 구현 완료: Cmd/Ctrl-K, `/`, 방향키 이동, Enter 실행, Esc 닫기
  - 다음 후보: `g g` (Ghostty) / `g t` (tmux) / `e` (export) / `?` (단축키 안내)

### 5.3 미리보기 폰트 로딩 인디케이터
- **Why**: 새 폰트 선택 시 GF 로딩 동안 시스템 폰트로 폴백되어 어색.
- **What**: `document.fonts.ready` 감시 + 스켈레톤 글로우.

### 5.4 onboarding 한 줄
- **Why**: 처음 들어온 사용자가 "뭘 해야 하는지" 모름.
- **What**: 첫 방문 시 hero 아래에 "1. Ghostty 승강장 → 2. 테마 선택 → 3. 출발"의 3-step indicator.
- **How**: localStorage 플래그 + `<OnboardingHint>` (dismiss 가능).

### 5.5 미리보기 동기화 — Themes에서 적용 전 비교
- **Why**: 테마를 클릭하면 즉시 페이지 이동 → 적용 전 비교 불가.
- **What**: 적용 전 "before / after" 사이드 바이 사이드 토글.

### 5.6 i18n (한 → 한/영)
- **Why**: 한국어 우선은 유지하되 영어 사용자가 막힘.
- **What**: 한국어/영어 토글 (TopBar 우측).
- **How**:
  - `react-i18next` 또는 직접 `messages.ko.ts` / `messages.en.ts`
  - 한국어가 default, `?lang=en` 또는 user pref

---

## 6. 운영 / 트러스트

### 6.1 보안 헤더
- **Why**: 개발자 도구는 보안 헤더 누락 시 신뢰도 떨어짐.
- **What**: CSP, X-Frame-Options, Referrer-Policy.
- **How**:
  - `public/_headers` (Cloudflare Pages 지원)
  - `Content-Security-Policy: default-src 'self'; style-src 'self' fonts.googleapis.com 'unsafe-inline'; font-src fonts.gstatic.com; img-src 'self' data:` 등

### 6.2 라이선스 / 약관
- **Why**: 공개 갤러리/계정 도입 시 필수.
- **What**: `/legal/terms` + `/legal/privacy` 라우트.
- **How**:
  - MIT 라이선스 (이미 README에)
  - Privacy: localStorage / Sentry / Plausible 사용 명시
  - 한국 사용자 PIPA 안내

### 6.3 Lighthouse 90+ 달성
- **Why**: 측정 안 한 상태.
- **What**: Performance / Accessibility / SEO 90+.
- **How**:
  - 폰트 preload (Hanken Grotesk만이라도 self-host)
  - 이미지 없으니 LCP는 텍스트 — `font-display: swap` 검증
  - 코드 스플릿: 라우트별 lazy import → 첫 진입 가벼움

### 6.4 자동 dependabot
- **Why**: framer-motion / zustand 보안 패치 자동.
- **What**: `.github/dependabot.yml` + `bun update` 정기.

### 6.5 설정 스키마 버전 관리
- **Why**: localStorage persist version이 올라갈 때 기존 사용자의 설정이 초기화될 수 있음.
- **What**: 플랫폼별 config schema version + migration registry.
- **How**:
  - `ghostty:v3`, `tmux:v5`, `neovim:v3`, `zsh:v3` 등 명시
  - migration은 "초기화"가 아니라 필드별 보존/보정 우선
  - export 파일에도 `generated_by`, `schema_version` 주석 포함

### 6.6 설정 안전성 감사
- **Why**: 사용자가 shell env, PATH, custom command, keybind를 직접 입력하므로 잘못된 설정이 로컬 환경을 망칠 수 있음.
- **What**: Export 전 위험 패턴 감지.
- **How**:
  - shell command에 `rm -rf`, 토큰 패턴, 홈 디렉터리 전체 overwrite 경고
  - PATH 중복/존재하지 않는 경로 경고
  - keybind 충돌/중복 감지
  - install script는 기본 `--dry-run` 안내 우선

### 6.7 개인정보/보안 정책
- **Why**: 공유 링크와 계정/분석 도입 시 신뢰가 핵심.
- **What**: Privacy/Terms 페이지, 데이터 보존 정책, 공유 링크 공개 범위 명시.
- **How**:
  - `/privacy`, `/terms`
  - localStorage만 쓰는 현재 상태와 서버 저장 도입 후 상태 분리
  - 공유 링크 생성 시 "이 설정에 토큰/비밀값이 포함되어 있지 않은지" 체크

### 6.8 릴리즈 채널
- **Why**: 설정 생성기는 깨지면 사용자의 로컬 개발환경에 영향을 줌.
- **What**: stable/beta 채널 구분.
- **How**:
  - `busterminal.dev`는 beta
  - 커스텀 도메인은 stable
  - 신규 serializer는 beta에서 먼저 검증 후 stable 반영

---

## 7. 비즈니스 (선택)

### 7.1 무료 / 유료 가르기
실제 매출이 목표라면:

| 무료 | 유료 (Pro $4/mo 예시) |
|---|---|
| Ghostty + tmux + Neovim + Zsh | + yazi, starship, fish |
| 저장 노선 5개 | 무제한 |
| 공개 갤러리 열람 | + 비공개 노선 |
| 24h 공유 링크 | 영구 공유 + 도메인 alias (e.g. `bus.dev/me`) |

### 7.2 Pro 가격 가설
- 개발자 도구 SaaS 평균 $5–10/월. Raycast Pro $8.
- $4가 "충동결제" 가능 가격.
- 결제: Stripe + LemonSqueezy (LS가 한국 부가세 자동 처리해서 추천)

### 7.3 잠재 수요 검증
- 트위터 한국 dev 커뮤니티에 데모 공유 → 댓글 반응 측정
- Product Hunt에 올리기 (한국 새벽 시간 launch)
- ZeroCho/Naver D2 등 한국 개발 매체 컨택

### 7.4 상용화에 매우 유리한 기능 후보

| 기능 | 왜 중요한가 | MVP |
|---|---|---|
| Dotfiles GitHub 연동 | 개발자는 이미 dotfiles를 GitHub로 관리함 | GitHub OAuth 후 gist/repo에 export PR 생성 |
| Config Doctor | "내 설정이 왜 안 되지?"를 해결하면 재방문 이유가 생김 | `bus doctor` 또는 웹 진단 리포트 확장 |
| Team Presets | 회사/팀 온보딩용으로 가치가 큼 | 공개/비공개 팀 노선, fork, 변경 이력 |
| One-click Bootstrap | 단순 다운로드보다 설치 완료 경험이 강함 | install script + dry-run + backup |
| Import Coverage | 기존 dotfiles 유저 흡수 | tmux/Neovim/Zsh parser 추가 |
| Share Preview Page | 공유 링크가 제품 홍보면이 됨 | `/share/:slug`에서 미리보기 + fork |
| Config Diff Across Tools | 변경 전/후 신뢰 확보 | Ghostty 외 tmux/nvim/zsh diff |
| Secret Scanner | 공유/클라우드 저장 전 필수 안전장치 | token/env/private key 패턴 경고 |
| Onboarding Wizard | 초보자 전환율 개선 | "나는 프론트엔드/Vim입문/SSH 위주" 3문항 |
| Telemetry-lite | 어떤 옵션이 진짜 쓰이는지 알아야 함 | 개인정보 친화 이벤트 5개만 수집 |

---

## 8. 기술 부채

### 8.1 cleanup
- [ ] `ghosttySchema.ts`의 `theme: ""`은 `theme: string` 타입이지만 `""`은 not selected 의미 — discriminated union으로 정리
- [ ] `parseGhosttyConfig`의 `unknownLines` 활용 안 됨 (import 모달에서 잠깐만 노출)
- [ ] `routesStore.platform`이 string union으로 강결합 — 신규 플랫폼 추가 시 5곳 수정. 중앙 레지스트리로
- [ ] `DiffPage`가 ghostty 전용 — 다른 도구도 diff 가능하게

### 8.2 타입 강화
- [ ] `setField(key, value)`가 사실상 `any` → field별 타입 좁히기
- [ ] `serializeXxx` 함수들이 string 반환만 — error/warning 반환 채널 신설

### 8.3 성능
- [ ] Home 카드의 spotlight CSS 변수가 mouseMove마다 setProperty — throttle 또는 RAF로 묶기
- [ ] TerminalPreview가 매 input마다 history 재렌더 — 가상화 또는 메모이즈

---

## 9. 추천 다음 4주 일정

**Week 1 — 신뢰감 (모바일 + 테스트)**
- 모바일 햄버거 사이드바
- 테스트 30개 (Vitest)
- Lighthouse 측정 + 개선
- 도메인 구입

**Week 2 — 백엔드 토대**
- CF Workers + D1 스키마 설계
- GitHub OAuth 끝까지
- localStorage → 클라우드 동기화 (logged-in 시)

**Week 3 — 공유 영속성**
- `/share/:slug` 단축 URL
- 공개 노선 토글
- 메타 OG 이미지 (route별 dynamic OG)

**Week 4 — 갤러리 베타**
- `/explore` 그리드
- 시드 데이터 24개
- 트위터 / Product Hunt 런치 준비

---

## 부록 A. 가장 위험한 가정

> "사람들이 ghostty/tmux/neovim/zsh 설정을 GUI로 만들기를 원한다"

검증 방법:
1. 데모 링크 → 트위터 한국 dev 50명에게 DM → 반응 수
2. 텀블 + ZeroCho 캡처 → 댓글에서 "오 좋네" vs "그냥 dotfiles 쓰지 왜"
3. Plausible로 "import → export"까지 가는 funnel 비율

만약 import → export funnel < 5%면 → 도구 제작이 아니라 **갤러리/포크** 방향으로 피벗.

---

## 부록 B. 안 만들 것

- 백엔드 호스팅한 터미널 (web ssh 같은 것) — 보안 지옥
- AI 추천 — "당신에게 맞는 테마는 X입니다" 같은 잡스러운 feature
- 다크모드 토글 — 우리는 다크 only 브랜드
- 모바일에서 ghostty 다운로드 — 의미 없음 (모바일에선 데스크탑 링크 보내기 안내)


---

## 2026-05-24 추가 — Platform 5/6/7 출범

### Helix 승강장 (Platform 5)
- `~/.config/helix/config.toml` + `languages.toml` 두 벌 export
- theme / line-number / scrolloff / cursor-shape / indent-guides / statusline / LSP / file-picker / keymaps (모달별)
- 진짜 `hx --health` 기준 기본값
- LSP 카탈로그: rust-analyzer, ts-server, gopls, pyright, ruff, clangd, lua-ls, marksman, tailwindcss, yaml, deno

### iTerm2 승강장 (Platform 6)
- `.itermcolors` (Apple plist XML) + Dynamic Profile JSON 두 벌 export
- 16색 ANSI + Background/Foreground/Cursor/Selection/Bold/Link/Badge/Tab/Underline 12개 UI 색
- Font / Size / Thin Strokes / Spacing / Window 크기 / Transparency / Blur / Cursor / Option-as-Meta / Hotkey Window
- **`.itermcolors` 가져오기** — 기존 색상 프리셋 파일을 그대로 import (정규식 기반 plist 파서)
- iTerm2의 `~/Library/Application Support/iTerm2/DynamicProfiles/`에 떨구면 자동 인식

### Warp 승강장 (Platform 7)
- `~/.warp/themes/<name>.yaml` (정식 Warp 커스텀 테마 포맷)
- `~/.warp/workflows/<name>.yaml` (Warp Workflows 멀티 문서)
- 16색 (normal 8 + bright 8) + accent + background + foreground + details(darker/lighter)
- Appearance (font, cursor, opacity, blur, status bar, breadcrumbs, ligatures, pane dim)
- **Warp AI 패널** — enabled / autosuggestions / natural language(#) / agent mode / history context
- Workflows CRUD — `{{arg}}` 자동 인자 추출

### 함께 갱신된 부분
- `/export` — 12개까지 자동 다운로드, install script가 helix/iterm2/warp 경로 모두 처리
- Sidebar / CommandPalette / Home / MyRoutes / RouteTable — 7개 플랫폼 인식
- routesStore platform union 확장

### 의도적으로 다음 라운드 (P1)
- Kitty / Alacritty / Zellij / yazi — 같은 패턴으로 추가
- Cross-platform Theme Center 환승 (현재는 RouteTheme → Ghostty / Warp / iTerm2만 매핑)
- Diff 페이지의 Helix/iTerm2/Warp 지원 (현재 Ghostty 전용)
- Undo / autosave UI (스토어는 이미 persist, UI 토글만 추가)
- 가져오기 마법사 (`config.toml` / `.zshrc` / `.tmux.conf` 자동 파싱)
- 모바일 사이드바 (`Drawer` 패턴)
- 갤러리 / 공유 노선 서버 영속



---

## 2026-05-25 — Theme & Font Ecosystem Phase 1

### Theme Registry 대폭 확장
- 6개 → 26개 테마. palette16 정확히, author / description / tags 메타데이터.
- 신규 추가: Tokyo Night Storm/Moon, Catppuccin 4종 (Mocha/Macchiato/Frappé/Latte), Gruvbox Light, Dracula, Solarized Dark, Rose Pine Moon, Everforest, Kanagawa Wave, One Dark, Night Owl, Monokai Pro, Ayu Dark, GitHub Dark/Light, Oxocarbon, Flexoki Dark, Embark
- 카테고리 태그: dark / light / popular / minimal / retro / new / high-contrast
- Helix / Neovim 매핑 확장 — 26개 테마가 두 에디터의 가장 가까운 colorscheme/theme name으로 자동 변환

### 테마 환승센터 UX 업그레이드
- **검색** — 이름·설명·제작자 텍스트 검색
- **카테고리 필터 chips** — 전체 / 즐겨찾기 / 인기 / 신규 / 다크 / 라이트 / 미니멀 / 레트로 / 고대비
- **정렬** — 추천순 / 이름순 / 다크 우선 / 라이트 우선 / 즐겨찾기 우선
- **즐겨찾기** — 카드 우상단 하트 (favoritesStore persist)
- **fixed-bottom dock** — 적용 대상 선택 + 전체 송출 (스크롤 시 항상 노출)
- "전체" 선택 시 6개 승강장 (Ghostty/Warp/iTerm2/Neovim/Helix/tmux) 일괄

### Font Registry 신설
- `src/data/fonts.ts` — 26개 폰트 메타데이터 + 4종 미리보기 샘플 (영문/한글/코드/터미널)
- 대표 폰트: JetBrains Mono, Fira Code, Geist Mono, Berkeley Mono, Maple Mono, Commit Mono, IBM Plex Mono, Monaco, SF Mono, Hack, Cascadia Code, Input Mono, Iosevka, Victor Mono, Dank Mono, Operator Mono, Ubuntu Mono, Source Code Pro, MesloLGS NF, PragmataPro, Recursive, Comic Mono, Noto Sans Mono, Roboto Mono, Pretendard, Inter
- 카테고리: monospace / nerd / sans / korean / editorial
- 태그: ligatures / nerd / variable / popular / new / free / paid / system
- Google Fonts에 있는 것은 `googleFontUrl`로 페이지 마운트 시 자동 로드 → 미리보기 실시간
- 자체 설치 필요 폰트(Berkeley/Operator/Dank/PragmataPro/Maple 등)는 `installNote`로 안내

### 폰트 환승센터 (`/fonts`) 신설
- 좌측 카드 그리드: 각 카드에서 실시간 폰트로 영문 샘플 렌더
- 우측 sticky 상세: English / 한글 / Code / Terminal 4종 미리보기 탭, font-size 슬라이더
- favorites, search, category, tag 필터
- 적용 대상: Ghostty / iTerm2 / Warp (3개에 한 번에 송출 가능)

### 다음 라운드 (Phase 2)
- Theme/Font 디테일 페이지 (URL routing per item)
- Theme compare side-by-side
- 외부 테마 import (Base16 JSON / Vim colorscheme / iterm2 palette → 자동 변환)
- 폰트 페어링 추천 (mono + ui sans)
- 인기 순위 (서버 영속 필요)
- 커뮤니티 갤러리



---

## 2026-05-25 — Import Wizard (가져오기 마법사)

### 5개 추가 플랫폼에 환승하기 모달
이전에는 Ghostty와 iTerm2만 import 가능 → 7개 플랫폼 전부 import 가능.

- **tmux** — `~/.tmux.conf` (set/setw, status-*, @plugin 등)
- **Zsh** — `~/.zshrc` (ZSH_THEME → prompt 매핑, plugins=(...), alias, export, HISTSIZE/HISTFILE)
- **Neovim** — `init.lua` (vim.opt.*, vim.g.*, vim.cmd.colorscheme, lazy.nvim 플러그인 17종 자동 매핑)
- **Helix** — `config.toml` (섹션·키 자동 인식, [editor], [editor.cursor-shape], [editor.lsp], [editor.statusline] 등)
- **Warp** — 테마 YAML (name/accent/background/foreground/details/terminal_colors.normal·bright)

### 공용 인프라
- `src/lib/importers.ts` — 5개 lossy parser (정확한 round-trip 대신 "있는 키만 흡수")
- `src/components/platform/ImportWizard.tsx` — 텍스트 붙여넣기 + 파일 업로드 통합 모달
  - 실시간 파싱 통계 (✓ applied / ? 미인식 / ! 경고)
  - 미인식 줄 100개까지 펼쳐서 확인 가능
  - "환승하기 (N개 적용)" 동적 라벨

### Phase 2 후보 (Import 영역)
- Vim colorscheme 파싱 → RouteTheme 자동 생성
- Base16 YAML → 모든 플랫폼 일괄
- iterm2 plist → Warp/Ghostty 자동 환승
- Round-trip 검증 (export → import → diff = 0)



---

## 2026-05-25 — Phase 2-α (Detail Pages + Code-Splitting + Palette UX)

### Theme/Font 디테일 페이지 (deep-linkable URL)
- `/themes/:id` ThemeDetailPage — 대형 코드+터미널 미리보기, 16색 ANSI 그리드 (클릭 시 hex 복사), UI 색 카드, 플랫폼별 export 스니펫 5종 (Ghostty/tmux/Helix/Neovim/Warp) 각각 복사 버튼, "6개 승강장 송출" 즉시 적용, 공유 링크 복사
- `/fonts/:id` FontDetailPage — 5종 미리보기 섹션 (Hero/English/한글/Code/Terminal) + Weight ladder (모든 weight 한눈에), font-size 슬라이더, weight chip, italic 토글, 설치 안내, homepage 링크, 공유 링크 복사
- 리스트 카드에서 우상단 `↗` 버튼으로 디테일 진입

### Code-splitting
- `src/App.tsx`를 React.lazy + Suspense로 전환
- 메인 번들 **550KB → 334KB** (gzip 171→109KB) — 39% 감소
- 각 라우트가 독립 청크 (Ghostty 22KB, Tmux 14KB, Warp 13KB, …)
- 500KB chunk-size 경고 해소
- Suspense fallback: 페이지 스켈레톤 (실제 페이지 레이아웃 형태)

### CommandPalette UX 픽스
- ↑↓ 키 이동 시 활성 항목이 스크롤 영역에 항상 보이도록 `scrollIntoView({block: "nearest"})`
- 중복된 "Theme Center" 항목 제거

### 다음 라운드 (Phase 2-β / γ)
- 외부 테마 import — Vim colorscheme / Base16 YAML / iterm2 plist → RouteTheme 자동 변환
- Theme compare side-by-side (`/themes/compare?a=tokyo-night&b=dracula`)
- 폰트 페어링 추천 (mono + ui sans 조합 카드)
- 인기 순위·통계 (서버 영속 필요)
- 모바일 사이드바 Drawer
- Undo 토스트



---

## 2026-05-25 — 출시 전 안전화 패스 (Codex 분석 기반)

harm 기준 우선순위로 8단계 진행.

### 1. Export UX 안전화
- 미수정 fallback "전체 체크" 제거 — 손도 안 댄 12개 설정 파일이 받아지던 결함 차단
- 아무것도 수정 안 한 상태에서는 빈 상태 화면 + 승강장 진입 링크
- 설치 스크립트는 별도 `<details>` 안에 — `--dry-run`/백업/`--only` 가이드 명시
- 플랫폼 카드에 초보자용 한 줄 설명(blurb) 추가
- `src/lib/exportSelection.ts` 순수 함수로 추출 + 7개 테스트

### 2. Install script escaping 테스트
- `shellSingleQuoteEscape` + `buildInstallScript` 모듈 분리
- 백슬래시·작은따옴표·줄바꿈·CR·악성 입력에 대한 15개 테스트
- 위험 경계 — 사용자 입력이 `$'...'`를 빠져나가지 않는지 회귀 방어

### 3. 가짜·장식성 요소 제거
- `dlacrity` 오타 → `alacritty`
- `폐차` → `삭제` (전 영역)
- MyRoutes의 가짜 `System Activity` / `BT-9991 manifest hashed` 블록 제거
- 푸터 `<span>` 장식 텍스트(API Status) 제거, Privacy/Terms는 실제 페이지 링크
- Sidebar `STATION 01 / Configuring Local Terminal` → `BusTerminal / 내 개발환경 설정`
- 항상 켜진 가짜 `System Online` LED 제거
- 차고 보관/환승하기/출발권 만들기 버튼에 title 속성 — 메타포 라벨의 실제 의미 노출
- 테마/폰트 환승센터의 "전체 송출" → "모든 도구에 적용" / "이 도구에 적용"

### 4. ErrorBoundary
- `src/components/shell/ErrorBoundary.tsx` 추가
- 한 페이지 크래시가 전체 화이트 스크린으로 번지지 않게 보호
- 친절한 복구 UI (새로고침 / 홈으로 / 다시 시도) + DEV 모드에서만 스택 노출

### 5. Privacy / Terms / 푸터 / _headers / sitemap
- `/privacy` — 서버 없음·localStorage·외부 전송 없음·제3자 서비스·삭제 권한
- `/terms` — 적용 책임·백업 안내·설치 스크립트 가이드·면책 범위
- 푸터에서 실제 페이지 링크 + GitHub
- `public/_headers` — Cloudflare Pages용 보안 헤더 (X-Frame-Options/CSP/Referrer-Policy 등)
- `public/sitemap.xml`에 /guide /privacy /terms /themes/compare /fonts/pairings 반영

### 6. 추가 테스트 도입
- `share.ts` round-trip — ASCII/한글/이모지/JSON/URL-safe/buildShareUrl
- `parse.ts` Ghostty serialize/parse — 기본값 안정성·미인식 줄 보존·keybind/palette 분리
- `importers.ts` — 5개 플랫폼(tmux/zsh/helix/nvim/warp) lossy 파서 회귀 방어
- 총 57개 테스트 (5 test files)

### 7. 페이지별 "할 일" 카드
- 초보자 완주 경로의 3개 페이지에만 적용: Ghostty / Themes / Export
- 첫 방문 자동 펼침 → 닫으면 localStorage 플래그로 유지
- 닫혀도 우상단 작은 칩으로 언제든 다시 열 수 있음

