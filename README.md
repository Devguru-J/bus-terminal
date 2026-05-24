<div align="center">

# 🚌 버스터미널
### 내 개발환경으로 출발

터미널 설정은 어렵고
설정 파일은 낯설고
환경 구축은 귀찮았습니다.

버스터미널은
개발자가 원하는 환경으로 **환승하고**,
설정을 **탑승하고**,
구성을 **출발시키는**
시각적 터미널 설정 플랫폼입니다.

---

**🚏 라이브 데모 → [bus-terminal.pages.dev](https://bus-terminal.pages.dev/)**

[ 시작하기 ] · [ 문서 ] · [ 로드맵 ] · [ 이슈 제보 ]

</div>

---

## 왜 만들었나요?

터미널 설정은 강력하지만 어렵습니다.

Ghostty
tmux
Neovim
yazi
zsh

도구는 많지만 설정 방식은 제각각입니다.

버스터미널은 이 문제를 해결하기 위해 만들어졌습니다.

설정을 코드로 직접 쓰는 대신
**시각적으로 선택하고 조합하고 출발하세요.**

---

## ✨ 주요 기능

### 🚌 승강장 시스템

환경별로 이동합니다.

- Ghostty 승강장
- tmux 승강장
- Neovim 승강장
- Zsh 승강장
- Helix 승강장
- iTerm2 승강장
- Warp 승강장
- **테마 환승센터** — 26개 테마, 6개 플랫폼 일괄 적용, 즐겨찾기·검색·카테고리
- **폰트 환승센터** — 26개 폰트, Ghostty/iTerm2/Warp 일괄, 실시간 미리보기
- yazi / Kitty / Alacritty / Zellij 승강장 (예정)

---

### 🔁 환승하기

기존 설정 가져오기

```bash
~/.config/ghostty/config
~/.tmux.conf
```

붙여넣기 또는 업로드

---

### 🎨 노선 스타일

테마를 선택하고 적용

- Tokyo Night
- Catppuccin
- Nord
- Gruvbox

---

### 👀 승차 미리보기

설정 변경 즉시 반영

실제 터미널처럼 확인

---

### 🚀 설정 출발

완성된 설정을 생성

```bash
ghostty.conf
tmux.conf
```

복사 또는 다운로드

---

## 🧭 제품 철학

### GUI 먼저
설정 파일은 결과물

버스터미널은
설정 파일을 숨기지 않습니다.

사용자가 이해하기 쉽게 만들고
최종 결과는 항상 코드입니다.

---

## 🏗 아키텍처

```text
apps/web

features/
 ├── ghostty
 ├── tmux
 ├── themes
 └── routes

components/
 ├── preview
 ├── station
 ├── cards
 └── config

lib/
 ├── parser
 ├── exporter
 └── storage
```

---

## 🛠 기술 스택

- Bun
- React
- TypeScript
- Vite
- TailwindCSS
- Zustand
- shadcn/ui
- Framer Motion

---

## 📦 시작하기

```bash
git clone https://github.com/Devguru-J/bus-terminal

cd bus-terminal

bun install

bun run start
```

---

## 🗺 로드맵

### v0.1 — 지나간 정류장
- [x] Ghostty 지원
- [x] tmux 지원 (키바인딩 CRUD 포함)
- [x] Neovim 지원 (lazy.nvim init.lua)
- [x] Zsh 지원 (.zshrc + starship.toml)
- [x] 테마 환승센터
- [x] 설정 가져오기 / 출발

### v0.2 — 현재 운행중
- [x] Helix 지원 (config.toml + languages.toml)
- [x] iTerm2 지원 (.itermcolors + Dynamic Profile JSON)
- [x] Warp 지원 (테마 YAML + 워크플로우 + AI)
- [x] 출발 전 진단 리포트
- [x] 테마 환승센터 (26개 테마, 검색/필터/즐겨찾기/전체 적용)
- [x] 폰트 환승센터 (26개 폰트, Google Fonts 자동 로드, 실시간 미리보기)
- [x] Theme/Font 디테일 페이지 (`/themes/:id`, `/fonts/:id`, 공유 가능 URL)
- [x] Code-splitting (메인 번들 39% 감소)
- [x] 출시 전 안전화 — Export 빈 상태·ErrorBoundary·Privacy/Terms/_headers·57개 테스트
- [x] 설치 스크립트 (--dry-run / --only / --no-backup)
- [ ] Diff 페이지 멀티 플랫폼 확장
- [ ] 모바일 사이드바

### v0.3 — 다음 출발
- [ ] Kitty / Alacritty / Zellij / yazi
- [ ] 가져오기 마법사 (.zshrc / .tmux.conf 자동 파싱)
- [ ] 갤러리 / 공유 노선 서버 영속
- [ ] 다중 디바이스 동기화 (계정)
- [ ] i18n (영어)
- [ ] 커뮤니티 노선

---

## 🤝 기여하기

이 프로젝트는 함께 성장합니다.

새로운 노선
새로운 테마
새로운 승강장

언제든 환영합니다.

---

## 🙏 감사

Inspired by the terminal and open-source community.

Special thanks to everyone building tools that make terminals more approachable.

---

<div align="center">

### 버스터미널

내 개발환경으로 출발 🚌

</div>
