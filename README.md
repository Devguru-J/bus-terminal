<div align="center">

<img src="docs/images/logo.png" alt="BusTerminal" width="120" />

# BusTerminal

**개발자 환경을 한 번에 설계하고, 한 번에 내보냅니다.**

터미널 · 에디터 · 셸 설정을 시각적으로 조립하고, 즉시 사용 가능한 config 파일로 export 하는 단일 워크스페이스.

[ [Live Demo](https://busterminal.dev) ]&nbsp;·&nbsp;
[ [Documentation](https://busterminal.dev/guide) ]&nbsp;·&nbsp;
[ [Releases](https://github.com/Devguru-J/bus-terminal/releases) ]&nbsp;·&nbsp;
[ [Report Issue](https://github.com/Devguru-J/bus-terminal/issues/new) ]

<sub>MIT License · React 18 · TypeScript · Vite · Supabase (optional)</sub>

</div>

---

## 왜 BusTerminal인가

개발 환경을 새로 만든다는 건 여전히 비용이 큰 작업입니다.

- **Fragmented configs** — Ghostty는 key=value, Warp는 YAML, Neovim은 Lua, tmux는 자체 DSL. 같은 의도("폰트는 JetBrains Mono, 컬러는 Tokyo Night")를 7번 다시 씁니다.
- **Setup fatigue** — 새 머신 / 새 회사 / 새 OS에서 dotfiles를 정확히 그대로 옮기는 데 반나절이 사라집니다.
- **Theme fragmentation** — 같은 "Tokyo Night"도 플랫폼마다 색이 미묘하게 다르고, 어디서 받은 어느 버전인지 추적하기 어렵습니다.
- **Editor/shell inconsistency** — Neovim의 background와 터미널의 background가 6단계 어긋난 채로 한 달째 방치됩니다.

BusTerminal은 이 4가지 통증을 한 화면에서 해결합니다.
**시각적으로 조립 → 미리보기 → 단일 config 파일로 출력.** 생성된 파일은 전적으로 사용자 소유이며, 도구가 종료되어도 설정은 그대로 살아남습니다.

---

## Product Preview

### Dashboard — 7개 승강장 한눈에

![Dashboard](docs/images/preview-dashboard.png)

운행 중인 플랫폼, 적용된 테마, 보관된 라우트 수가 단일 보드에서 보입니다.

### Theme Transfer Center — 환승 센터

![Theme Transfer](docs/images/preview-themes.png)

26개 큐레이트 테마를 검색·비교하고, 한 번의 클릭으로 모든 플랫폼에 동시에 적용합니다.

### Route Management — 보관된 라우트

![Routes](docs/images/preview-routes.png)

자주 쓰는 환경 조합을 "Route"로 저장하고, 머신을 옮길 때 그대로 복원합니다.

### Config Generator — 설정 파일 생성

![Config Generator](docs/images/preview-export.png)

플랫폼별 정확한 문법으로 직렬화. Ghostty config, .zshrc, init.lua, .tmux.conf까지 즉시 다운로드.

### Departure Flow — 출발

![Departure](docs/images/preview-departure.png)

조립이 끝난 환경을 단일 zip 묶음으로 내보냅니다. 머신에 가져가서 그대로 풀면 끝.

---

## Features

### Visual Configuration · `Implemented`
- 폼/슬라이더/토글로 모든 옵션 조작
- 변경 사항은 실시간 미리보기 영역에 즉시 반영
- 50+ Ghostty expert 설정을 그룹으로 분류

### Theme Management · `Implemented`
- 26개 큐레이트 테마 (Tokyo Night / Solarized / Catppuccin / Gruvbox 외)
- popular / dark / light / warm / cool 태그 필터
- 두 테마를 나란히 비교하는 `/themes/compare`

### Route Management · `Implemented`
- 현재 설정을 명명된 Route로 저장
- 클라우드 동기화 (Supabase 연결 시, optional)
- 익명 로컬 저장 — 계정 없이도 동작

### Export System · `Implemented`
- 플랫폼별 native 문법으로 직렬화
- 단일 파일 다운로드 / 전체 환경 zip
- export 직전 diff 보기

### Developer Workflow · `Experimental`
- Plausible 기반 익명 사용 패턴 분석 (자체 호스팅)
- 자동 로컬 저장 (`autosaveHint`)
- 키보드 단축키 기반 탐색

> 상태 표기: `Implemented` 메인 브랜치에서 동작 · `Experimental` 동작하지만 변경 가능 · `Planned` 로드맵에 있음, 아직 미구현

---

## Supported Platforms

| Platform   | Theme | Font | Import | Export | Live Preview |
|------------|:-----:|:----:|:------:|:------:|:------------:|
| **Ghostty** |  ✓   |  ✓  |   —    |   ✓   |      ✓       |
| **Warp**    |  ✓   |  ✓  |   —    |   ✓   |      ✓       |
| **iTerm2**  |  ✓   |  ✓  |   —    |   ✓   |      ✓       |
| **tmux**    |  —   |  —  |   —    |   ✓   |      ✓       |
| **Neovim**  |  ✓   |  —  |   —    |   ✓   |      ✓       |
| **Helix**   |  ✓   |  —  |   —    |   ✓   |      ✓       |
| **Zsh**     |  —   |  —  |   —    |   ✓   |      ✓       |

> Import (기존 dotfile 역방향 파싱)은 Planned. 자세한 일정은 [Roadmap](#roadmap) 참고.

---

## Architecture

BusTerminal은 100% 클라이언트 사이드로 동작하며, 클라우드 동기화는 명시적 opt-in입니다.

```
 ┌─────────────────────────────────────────────┐
 │  UI       React 18 · Framer Motion · CSS    │  ← 단일 페이지, 라우트별 코드 분할
 ├─────────────────────────────────────────────┤
 │  State    Zustand + persist middleware      │  ← 플랫폼별 store, localStorage 직렬화
 ├─────────────────────────────────────────────┤
 │  Export   Pure serializers (per platform)   │  ← 입력 → 정확한 config 문자열 변환
 ├─────────────────────────────────────────────┤
 │  Storage  localStorage  ·  Supabase (opt-in)│  ← 로컬 우선, 클라우드는 선택적 백업
 └─────────────────────────────────────────────┘
```

- **UI** — 라우트 단위 lazy import, 번들 초기 진입 ~350KB
- **State** — 플랫폼별 store는 서로 독립. 한 플랫폼 변경이 다른 store를 깨지 않음
- **Export** — serializer는 순수 함수, 테스트 70+ 케이스로 검증
- **Storage** — Supabase env가 비어 있으면 클라우드 코드 경로는 fail-fast 차단

---

## Installation

### Run locally

```bash
bun install
bun dev
```

`http://localhost:5173` 에서 확인합니다.

### Production build

```bash
bun run build
bun run preview
```

### Optional environment variables

```bash
# .env.local
VITE_SUPABASE_URL=...        # 클라우드 동기화 활성화 시
VITE_SUPABASE_ANON_KEY=...
VITE_PLAUSIBLE_DOMAIN=...    # 자체 호스팅 analytics
```

세 값 모두 **선택**입니다. 비워두면 BusTerminal은 100% 로컬로 동작합니다.

> npm / pnpm / yarn도 동일하게 동작합니다. `bun`은 권장 기본값일 뿐 강제는 아닙니다.

---

## Philosophy

> **BusTerminal은 dotfiles를 대체하지 않습니다.**

BusTerminal은 dotfiles의 *작성 시점*을 돕는 도구이지, 운영 시점의 source of truth가 아닙니다.

- **Generated configs are yours** — 내보낸 config는 사용자 소유의 파일입니다. BusTerminal이 어디선가 죽어도 파일은 그대로 동작합니다.
- **Export-first** — DB나 클라우드가 아니라 *파일*이 1차 산출물입니다. git에 커밋하고, 다른 사람에게 보내고, 직접 손으로 고쳐도 됩니다.
- **Manual editing is respected** — 손으로 편집한 부분을 GUI가 침범해서 덮어쓰는 일은 없습니다. UI는 항상 새 파일을 생성하고, 기존 파일과의 머지는 사용자가 결정합니다.
- **No lock-in** — 계정도, 클라우드도, 구독도 필요 없습니다. 브라우저 하나만 있으면 됩니다.

dotfiles 레포가 이미 잘 굴러간다면, BusTerminal은 *시작점*과 *새 설정 탐색*에만 쓰면 충분합니다.

---

## Roadmap

### Now — 2026 Q2
- Stabilize 7 platforms (Ghostty / Warp / iTerm2 / tmux / Neovim / Helix / Zsh)
- Theme compare & diff 정리
- Route 클라우드 동기화 신뢰성 검증

### Next — 2026 Q3
- **Import** — 기존 `~/.config/ghostty/config`, `.tmux.conf`, `init.lua` 역방향 파싱
- **Snapshot restore** — 시점별 환경 스냅샷, 1-click 롤백
- **Cheat sheet generation** — 현재 설정 기반 단축키/키맵 인쇄용 시트 생성

### Future
- **Theme ecosystem** — 사용자가 제출한 테마 갤러리, 검증 & 큐레이션
- **Plugin ecosystem** — Neovim plugin / tmux plugin / zsh framework를 GUI에서 토글
- **Team sharing** — Route를 팀 단위로 공유, "회사 표준 환경" 1-click 적용

> 우선순위는 GitHub Issues의 `roadmap` 라벨에서 투표 가능합니다.

---

## Screenshots

| | |
|---|---|
| ![Home](docs/images/screenshot-home.png) | ![Ghostty](docs/images/screenshot-ghostty.png) |
| **Home** — 7개 승강장 진입점 | **Ghostty** — 50+ expert 설정 |
| ![Themes](docs/images/screenshot-themes.png) | ![Routes](docs/images/screenshot-routes.png) |
| **Themes** — 26개 테마 비교 | **Routes** — 보관된 환경 |
| ![Export](docs/images/screenshot-export.png) | ![Mobile](docs/images/screenshot-mobile.png) |
| **Export** — 단일 zip 출력 | **Mobile** — 375px 대응 |

---

## FAQ

**왜 GUI인가요? config 파일을 직접 쓰는 게 빠르지 않나요?**
빠르지만, 처음이 비쌉니다. Ghostty 옵션 200개, tmux 변수 100개를 모두 알기 전까지는 GUI가 *탐색 비용*을 줄여줍니다. 익숙해진 다음에는 GUI 없이 직접 쓰셔도 됩니다 — 생성된 파일이 그대로 동작하니까요.

**dotfiles 레포랑 뭐가 다른가요?**
dotfiles는 *저장*과 *동기화*에 강합니다. BusTerminal은 *작성*과 *탐색*에 강합니다. 둘은 경쟁하지 않습니다 — BusTerminal로 만들고, 결과를 dotfiles에 커밋하는 흐름이 권장됩니다.

**왜 하필 "버스터미널"인가요?**
설정 도구가 *플랫폼 사이를 옮겨 다니는 일*이라는 게 핵심 아이디어입니다. Ghostty에서 Warp로, macOS에서 Linux로, 회사 머신에서 개인 머신으로. 그 환승의 허브 — 그게 BusTerminal입니다.

**제 기존 설정을 덮어쓰나요?**
아니요. BusTerminal은 *새 파일을 생성*만 합니다. 기존 파일을 읽거나 수정하지 않습니다. 다운로드한 파일을 어디에 두고 어떻게 머지할지는 전적으로 사용자가 결정합니다.

**오프라인에서도 동작하나요?**
네. 최초 로드 후에는 100% 로컬에서 동작합니다. 클라우드 동기화(Supabase)는 명시적으로 활성화한 경우에만 네트워크를 사용합니다.

---

## Contributing

기여를 환영합니다. 시작하기 전에 짧게 이슈를 열어 방향을 맞추는 것을 권장합니다.

1. Issue를 열어 변경 의도를 공유합니다 (`feature` / `bug` / `docs` 중 하나).
2. Fork → feature branch → PR. 가능한 한 작게 쪼개주세요.
3. 새 기능에는 Vitest 케이스를, UI 변경에는 스크린샷을 함께 올려주세요.
4. 모든 PR은 `bun run lint && bun run test`를 통과해야 합니다.

코드 스타일, 커밋 컨벤션, 리뷰 프로세스는 [`CONTRIBUTING.md`](CONTRIBUTING.md)를 참고하세요.

### 좋은 첫 기여 영역
- 새 theme 큐레이션 (검증 가이드 포함)
- 플랫폼별 expert 설정 보강 (Ghostty / Neovim 우선)
- 한국어 외 언어 추가 (i18n 인프라는 준비 중)
- 문서화 (FAQ, 가이드, 스크린샷 갱신)

---

## License

[MIT](LICENSE) © BusTerminal Contributors

생성된 config 파일에는 어떤 라이선스도 부여되지 않습니다. 사용자 본인의 결과물입니다.
