# Vercel 배포 가이드

## 배포 대상

이 모노레포에서는 API 서버를 Vercel에 배포하고, Expo 모바일 앱은 별도로 유지합니다.

- `Production`: `master` 브랜치
- `Development`: `develop` 브랜치를 사용하는 Vercel Preview 배포

## 저장소 구조

- `apps/server`: Express API 서버
- `apps/mobile`: Expo 클라이언트
- `packages/domain`: 공통 도메인 로직
- `api/index.ts`: Vercel 함수 진입점

## Vercel 루트를 저장소 루트로 두는 이유

`apps/server`는 워크스페이스 패키지인 `@mallo/domain`에 의존합니다.
Vercel의 루트를 저장소 루트로 두면 워크스페이스 의존성을 올바르게 설치할 수 있습니다.

권장 Vercel 프로젝트 설정:

- Root Directory: `.`
- Framework Preset: `Other`
- Install Command: `npm install`

## 라우팅

`vercel.json`은 아래 경로들을 Express 앱으로 rewrite 합니다.

- `/health`
- `/api/*`

## 환경변수

Vercel에 아래 값을 설정합니다.

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

권장 분리 방식:

- Preview: 개발용 Google OAuth 앱
- Production: 운영용 Google OAuth 앱

Vercel에서는 `PORT`를 따로 설정할 필요가 없습니다.

## 모바일 앱 설정

로컬 개발용으로 `apps/mobile/.env` 파일을 만듭니다.

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
```

모바일 앱을 Vercel API에 연결해 테스트할 때는 아래처럼 설정합니다.

```bash
EXPO_PUBLIC_API_BASE_URL=https://your-project.vercel.app
```

## 배포 흐름

1. `develop` 브랜치에 푸시하면 dev 확인용 Preview 배포가 생성됩니다.
2. `master` 브랜치에 머지하면 Production이 갱신됩니다.
3. Preview와 Production은 Google OAuth 자격 증명을 분리해서 사용합니다.