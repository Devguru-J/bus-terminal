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
- Neovim 승강장 (예정)
- yazi 승강장 (예정)

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

### v0.1
- [x] Ghostty 지원
- [x] 테마 시스템
- [x] 설정 가져오기
- [x] 설정 출발

### v0.2
- [ ] tmux 지원
- [ ] 노선 병합
- [ ] 설정 공유

### v0.3
- [ ] Neovim
- [ ] yazi
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
