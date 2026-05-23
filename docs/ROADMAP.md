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
| 공유한 노선의 URL 영속성 | ⚠️ base64 해시 — 1.8KB 한계, 디코드 실패 시 깨짐 |
| 커뮤니티 노선 / 갤러리 | ❌ 없음 |
| 모바일 UX | ⚠️ 사이드바 데스크탑 전용 (`hidden lg:flex`) |
| 검색/필터 | ❌ (테마 6개라 아직 OK, 늘어나면 필수) |
| 분석 (어떤 옵션이 인기?) | ❌ 없음 |
| 에러 트래킹 | ❌ 없음 |
| 테스트 | ❌ 없음 |
| i18n | ⚠️ 한국어 일방. 영어 사용자 진입 불가 |
| 접근성 검증 | ⚠️ Skip-link/focus-ring만 추가, 자동 검사 안 함 |
| Lighthouse / Core Web Vitals | ❓ 측정 안 함 |
| SEO | ⚠️ meta 태그만. sitemap/robots 없음 |
| 도메인 / 브랜딩 | ⚠️ `pages.dev` 서브도메인 |

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
  - cmdk 라이브러리 또는 자체 구현
  - 단축키: `g g` (Ghostty) / `g t` (tmux) / `e` (export) / `?` (단축키 안내)

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
