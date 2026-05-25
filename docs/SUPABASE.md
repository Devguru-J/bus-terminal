# Supabase 운영 메모

버스터미널은 비회원 로컬 사용을 기본으로 두고, 로그인 사용자가 직접 저장한 스냅샷만 Supabase에 보관한다.

## 환경 변수

```bash
VITE_SUPABASE_URL=https://vyjolbszizgrspawcdio.supabase.co
VITE_SUPABASE_ANON_KEY=...
DATABASE_URL=postgresql://postgres:[password]@db.vyjolbszizgrspawcdio.supabase.co:5432/postgres
```

`VITE_*` 값은 브라우저 공개 값이다. `DATABASE_URL`은 마이그레이션 전용이며 배포 환경의 클라이언트 번들에 노출하면 안 된다.

## 마이그레이션

```bash
npm run db:migrate
```

Supabase SQL Editor를 쓴다면 `drizzle/0000_graceful_reaper.sql`을 그대로 실행한다.

## Auth 설정

Supabase Dashboard에서 다음 항목을 확인한다.

- Authentication → URL Configuration → Site URL: 운영 도메인
- Additional Redirect URLs: 로컬 개발 URL과 운영 도메인
- Providers: GitHub, Google, Email OTP

## 보안 모델

- `bus_terminal_snapshots.user_id = auth.uid()`인 행만 조회/삽입/수정/삭제 가능
- 비회원 데이터는 계속 브라우저 `localStorage`에만 저장
- 클라우드 저장은 사용자가 설정 페이지에서 직접 버튼을 눌렀을 때만 수행
