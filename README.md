# Mallo

Mallo는 Google Calendar와 연동되는 음성 기반 일정 비서 앱입니다.
이 프로젝트는 Codex로 기능 구현과 코드 정리를 진행하고, 모바일 앱과 API 서버를 분리해 운영합니다.

사용자가 음성이나 텍스트로 일정을 말하면,
앱이 일정 초안을 만들고 기존 일정과 충돌을 확인하며,
필요하면 대체 가능한 시간대를 추천하는 흐름을 목표로 합니다.

## Vercel 배포

- 저장소 루트 기준으로 배포합니다.
- `master` 브랜치를 Vercel Production 브랜치로 사용합니다.
- `develop` 브랜치와 PR 브랜치는 Vercel Preview 배포로 사용합니다.
- 모바일 앱은 `EXPO_PUBLIC_API_BASE_URL`로 배포된 API를 바라보도록 설정합니다.

자세한 설정은 `docs/guides/VERCEL_DEPLOYMENT.md`를 참고하세요.

## 프로젝트 구조

- `apps/mobile`
  - Expo 기반 React Native 모바일 앱
  - Google 로그인 진입, 음성 녹음, 일정 검토 화면 포함
- `apps/server`
  - Express 기반 API 서버
  - Google OAuth, 일정 검토, 일정 생성 API 포함
- `packages/domain`
  - 일정 모델, 충돌 검토, 대체 시간 추천 등 공통 도메인 로직
- `deploy/mallo`
  - 기존 Docker Compose 기반 배포 예시

## 현재 구현된 흐름

1. 모바일 앱에서 Google Calendar 연결 시도
2. 사용자가 음성 또는 텍스트로 일정 요청 입력
3. 서버가 일정 초안을 생성
4. 기존 일정과 충돌 여부 확인
5. 충돌 시 대체 시간 후보 추천
6. 확인 후 일정 생성

Google 환경변수가 없는 경우에는 실제 Google Calendar 대신 mock 모드로 동작합니다.

## 실행 방법

```bash
npm install
npm run dev:server
npm run dev:mobile
```

## 환경변수

서버 예시 파일:

```bash
apps/server/.env.dev.example
apps/server/.env.prod.example
```

모바일 예시 파일:

```bash
apps/mobile/.env.example
```
