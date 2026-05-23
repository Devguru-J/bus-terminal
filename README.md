# 버스터미널 (BusTerminal)

> 내 개발환경으로 출발하는 환승센터.
> Ghostty · tmux · (예정) Neovim · yazi — **노선만 고르면 됩니다.**

복잡한 설정 없이 터미널을 **선택**하고, **탑승**하고, **출발**하세요.
모든 데이터는 브라우저에만 저장되며 서버로 전송되지 않습니다.

---

## ✨ 특징

| 기능 | 설명 |
| --- | --- |
| **환승하기** (Import) | 기존 `ghostty config`을 붙여넣으면 자동 분석 |
| **GUI 안내판** | 1,600개의 옵션 대신 **자주 쓰는 핵심만** 한국어로 |
| **승차 미리보기** | 색·폰트·패딩 변경이 **실시간 반영** |
| **경로 비교** (Diff) | 기본값과 다른 값만 출발권에 인쇄 |
| **테마 환승센터** | 6개 노선 스타일을 한 번에 환승 |
| **차고 보관** | `localStorage` 기반 다중 노선 저장 |
| **공유 링크** | 서버 없이 URL 해시로 공유 |
| **다운로드 / 클립보드** | 즉시 도착하기(install) 가능 |

---

## 🚌 노선 안내

| 승강장 | 노선 | 상태 |
| --- | --- | --- |
| **1번** | Ghostty 노선 | 🟢 운행중 |
| **2번** | tmux 노선 | 🟢 운행중 |
| **3번** | 테마 환승센터 | 🟢 운행중 |
| **4번** | 내 노선 (차고) | 🟢 운행중 |
| 5번 | Neovim 노선 | 🚧 준비중 |
| 6번 | yazi 노선 | 🚧 준비중 |

---

## 🛠 설치 (도착하기)

### 요구사항
- [Bun](https://bun.sh) `>= 1.1`

### 클론 & 의존성

```bash
git clone https://github.com/Devguru-J/bus-terminal.git
cd bus-terminal
bun install
```

### 로컬 실행

```bash
bun run start    # (또는 bun run dev — 동일)
# → http://localhost:5173
```

### 빌드 / 미리보기

```bash
bun run build
bun run preview
```

타입 검사:

```bash
bun run lint    # tsc --noEmit
```

---

## 📂 폴더 구조

```
bus-terminal/
├── index.html              # Pretendard / JetBrains Mono CDN
├── vite.config.ts
├── tailwind.config.ts      # 노선 색 / LED 톤 / 도트매트릭스
├── tsconfig.json
├── src/
│   ├── main.tsx            # React 18 + BrowserRouter
│   ├── App.tsx             # 라우트 정의
│   ├── styles/globals.css  # glass, dot-matrix, led-text
│   │
│   ├── data/               # ⬇ 단일 진실원
│   │   ├── ghosttySchema.ts   # 핵심 옵션 (5 그룹, 한국어 라벨)
│   │   ├── themes.ts          # 6개 노선 스타일
│   │   └── tmux.ts            # tmux 플러그인 카탈로그 + 직렬화
│   │
│   ├── lib/                # ⬇ 순수 함수
│   │   ├── parse.ts           # ghostty 파서 + 직렬화 (diff-only)
│   │   ├── share.ts           # URL-safe base64 공유
│   │   ├── download.ts        # 파일 저장 + 클립보드
│   │   └── utils.ts           # cn (clsx + tailwind-merge)
│   │
│   ├── stores/             # ⬇ Zustand (persist 미들웨어)
│   │   ├── ghosttyStore.ts    # config / palette / keybind / 환승 / 출발
│   │   ├── tmuxStore.ts       # 상태바 / 플러그인
│   │   ├── routesStore.ts     # 차고 보관
│   │   └── toastStore.ts      # 토스트
│   │
│   ├── components/
│   │   ├── ui/                # Button / Card / Field / Badge
│   │   ├── layout/            # Header / Footer / ToastViewport
│   │   └── platform/
│   │       ├── DepartureBoard.tsx  # 출발 전광판 (LED + 도트매트릭스)
│   │       ├── PlatformCard.tsx    # 승강장 카드
│   │       ├── TerminalPreview.tsx # 라이브 터미널 미리보기
│   │       └── PaletteStrip.tsx
│   │
│   └── pages/
│       ├── Home.tsx        # /          출발 안내
│       ├── Ghostty.tsx     # /ghostty   1번 승강장
│       ├── Tmux.tsx        # /tmux      2번 승강장
│       ├── Themes.tsx      # /themes    환승센터
│       ├── MyRoutes.tsx    # /my-routes 차고
│       └── Settings.tsx    # /settings  관리실
```

---

## 🎨 디자인 시스템

### 컨셉
- **버스 터미널** + **개발자 터미널**의 더블 미닝.
- 한국 교통 안내판의 **LED 전광판** 감성 + 모던 글래스 모피즘.
- 다크모드 전제, **앰버 LED · 그린 출발 신호** 톤.

### 토큰
| 토큰 | 용도 | 값 |
| --- | --- | --- |
| `ink-900 … 400` | 깊은 어둠 → 패널 표면 | `#07090b → #2c3744` |
| `led-amber` | 전광판 글자 | `#ffb02e` |
| `led-green` | 출발 신호 / 1순위 CTA | `#00e0a4` |
| `led-blue` | 정보 | `#5cb6ff` |
| `led-red` | 경고 / 폐차 | `#ff4f5e` |
| `route-ghostty` | 1번선 | `#9b8cff` (보라) |
| `route-tmux` | 2번선 | `#00e0a4` (녹) |
| `route-theme` | 3번선 | `#ffb02e` (황) |
| `route-saved` | 4번선 | `#5cb6ff` (청) |

### 타이포
- **Pretendard Variable** — 본문 / UI (CDN)
- **JetBrains Mono** — 전광판 · config · 미리보기 (CDN)

### 시그니처 컴포넌트
- `DepartureBoard` — 도트매트릭스 배경 + LED 글자 + 깜빡임.
- `PlatformCard` — 호버 시 노선 색 그림자, 상단 라인 액센트.
- `TerminalPreview` — config 변경이 즉시 반영되는 실시간 셸 흉내.

### 디자인 원칙
1. **초보 친화** — 옵션이 아니라 "맥락"을 보여준다.
2. **한국어 우선** — UI/도움말은 한국어, config 키는 영어.
3. **설정은 결과물** — form이 아니라 미리보기와 전광판이 주인공.

---

## 🚏 사용 흐름

```
출발 안내 (/)
  └─ 1번 승강장 (/ghostty)
       ├─ 환승하기  ← 기존 config 붙여넣기 (자동 분석)
       ├─ 안내판   ← GUI 편집 (탭 + 카드)
       ├─ 미리보기 ← 실시간 색·폰트 반영
       ├─ 경로 비교 ← diff (기본값 대비)
       └─ 출발권   ← 다운로드 / 클립보드 / 공유 링크 / 차고 보관
```

---

## 🧩 컴포넌트 구조

| 레이어 | 역할 | 예시 |
| --- | --- | --- |
| **Primitive UI** | shadcn 스타일 최소 단위 | `Button`, `Card`, `Field`, `Badge` |
| **Layout** | 사이트 골격 + 전역 알림 | `Header`, `Footer`, `ToastViewport` |
| **Platform** | 도메인 컴포넌트 | `DepartureBoard`, `PlatformCard`, `TerminalPreview`, `PaletteStrip` |
| **Pages** | 라우트 단위 화면 | `Home`, `Ghostty`, `Tmux`, `Themes`, `MyRoutes`, `Settings` |
| **Stores** | 도메인 상태 (Zustand + persist) | `ghosttyStore`, `tmuxStore`, `routesStore`, `toastStore` |
| **Lib** | 순수 로직 | `parse`, `share`, `download`, `utils` |
| **Data** | SSOT (스키마 + 카탈로그) | `ghosttySchema`, `themes`, `tmux` |

---

## ⚙️ 스택

- **Bun** + **Vite 5** + **React 18** + **TypeScript 5**
- **TailwindCSS 3** (커스텀 토큰)
- **Zustand 5** (persist 미들웨어)
- **Framer Motion 11** (레이아웃·전환 애니메이션)
- **lucide-react** (아이콘)
- **react-router-dom 6**

---

## 🪪 라이선스

MIT. Ghostty/tmux 로고와 이름은 각 프로젝트 소유.

---

## 🙏 참고

이 프로젝트는 [zerebos/ghostty-config](https://github.com/zerebos/ghostty-config)의 발상(diff-only export, URL-safe base64 공유)을 참고했지만, UI/UX와 코드는 **버스 터미널 메타포**로 완전히 재설계되었습니다.
