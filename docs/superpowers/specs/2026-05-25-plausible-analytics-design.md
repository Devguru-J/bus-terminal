# Plausible Analytics 연동 설계

날짜: 2026-05-25
상태: 승인됨 (env-only 준비)

## 목표

출시 후 행동 데이터를 측정할 수 있도록 Plausible Analytics를 코드에 머지한다. 환경변수가 비어 있으면 완전한 no-op으로 동작해 출시 전/포크 환경에서도 안전하게 머지된 상태를 유지한다.

## 환경변수

- `VITE_PLAUSIBLE_DOMAIN` — Plausible에 등록한 도메인 (예: `busterminal.dev`). 비어 있으면 비활성.
- `VITE_PLAUSIBLE_HOST` — 기본값 `https://plausible.io`. self-host 시 override.

## 파일 변경

### 새 파일: `src/lib/analytics.ts`

공개 API:
- `initAnalytics()` — `VITE_PLAUSIBLE_DOMAIN`이 있을 때만 `<script>` 태그를 동적으로 `document.head`에 주입한다. 도메인이 없으면 즉시 return.
- `trackEvent(name: string, props?: Record<string, string>)` — `window.plausible`이 존재하면 호출, 아니면 silent. 절대 throw 하지 않는다.
- `trackPageview(path: string)` — SPA 라우팅을 위해 `plausible('pageview', { u: <url> })` 형태로 호출.

전역 타입은 모듈 내부에 `declare global { interface Window { plausible?: (...args) => void } }`로 선언.

### 수정: `src/main.tsx`

`createRoot` 호출 전에 `initAnalytics()` 한 번 실행.

### 수정: `src/App.tsx`

`useLocation()` 변화를 `useEffect`에서 감지하여 `trackPageview(location.pathname)` 호출.

### 새 테스트: `src/lib/analytics.test.ts`

- `trackEvent`는 `window.plausible`가 없어도 throw 하지 않는다.
- `trackEvent`는 `window.plausible`가 있으면 정확한 인자로 호출한다.
- `initAnalytics`는 도메인 env가 비어 있으면 스크립트를 주입하지 않는다.

## 추적 이벤트 (출시 첫 주)

| 이벤트 | 호출 위치 | props |
|---|---|---|
| `Config Downloaded` | 각 플랫폼 페이지의 다운로드 버튼 핸들러 | `{ platform: 'ghostty' \| 'warp' \| ... }` |
| `Theme Selected` | 테마 선택 UI | `{ theme: string }` |
| `Auth SignIn` | `AuthModal` 성공 콜백 | `{ provider: 'google' \| 'github' }` |
| `Cloud Sync` | `cloudSync.save / restore` 성공 시 | `{ action: 'save' \| 'restore' }` |

> 인스턴스 호스팅을 결정한 후 Plausible 대시보드에 위 이벤트들을 Goal로 등록해야 funnel 측정이 된다.

## 결정 사항

- **스크립트는 정적으로 `index.html`에 넣지 않는다.** 포크 사용자가 자기 트래픽을 우리 도메인 계정에 보내는 사고를 막기 위함.
- **쿠키 / 동의 배너 불필요.** Plausible은 쿠키리스라 GDPR/CCPA 자동 준수.
- **호스팅 결정은 보류.** 코드 머지 후 출시하여 트래픽 발생 시점에 plausible.io managed 가입 또는 self-host 결정.

## 비범위 (out of scope)

- Plausible 대시보드 셋업 / 도메인 등록 — 호스팅 결정 이후 별도 운영 작업.
- A/B 테스트, funnel UI — Plausible 기본 UI 사용.
- 서버사이드 이벤트 추적 — Supabase 트리거나 백엔드 작업은 후속.
