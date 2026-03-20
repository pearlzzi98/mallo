# Mallo

Mallo는 Google Calendar와 연동되는 음성 기반 일정 비서 앱입니다.
이 프로젝트는 Codex로 기능 구현과 코드 정리를 진행하고, Claude CLI로 실제 서버 환경에서 동작 확인과 배포 점검을 수행합니다.

사용자가 음성이나 텍스트로 일정을 말하면,
앱이 일정 초안을 만들고 기존 일정과 충돌을 확인한 뒤,
필요하면 대체 가능한 시간대를 추천하는 흐름을 목표로 합니다.

## 프로젝트 구조

- `apps/mobile`
  - Expo 기반 React Native 모바일 앱
  - Google 로그인 진입, 음성 녹음, 일정 검토 화면 포함
- `apps/server`
  - Express 기반 API 서버
  - Google OAuth, 일정 검토, 일정 생성 API 포함
- `packages/domain`
  - 일정 모델, 충돌 검사, 대체 시간 추천 등 공통 도메인 로직
- `deploy/mallo`
  - mallo 서버 배포용 Docker Compose 및 리버스 프록시 예시

## 현재 구현된 흐름

1. 모바일 앱에서 Google Calendar 연결 시도
2. 사용자가 음성 또는 텍스트로 일정 요청 입력
3. 서버가 일정 초안을 생성
4. 기존 일정과 충돌 여부 확인
5. 충돌 시 대체 시간 후보 추천
6. 확인 후 일정 생성

Google 환경변수가 없는 경우에는 실제 Google Calendar 대신 mock 모드로 동작합니다.

## 현재 구현된 기능

- 모바일 앱 기본 화면 구성
- Google OAuth URL 생성 및 코드 교환 API
- 일정 초안 검토 API
- 일정 생성 API
- 음성 녹음 후 전사 요청 흐름
- 일정 충돌 검사 로직
- 대체 시간 추천 로직
- Google Calendar provider와 mock provider 분리

## 아직 미완료인 항목

- 실제 STT provider 연동
- 한국어 자연어 일정 파싱 고도화
- Google 토큰 영속 저장
- 추천 시간 선택 후 draft 반영 UX 개선
- 실제 기기/로컬 환경 실행 검증
- API base URL 환경별 분리

## 실행 방법

루트에서 아래 명령을 사용합니다.

```bash
npm install
npm run dev:server
npm run dev:mobile
```

## 환경변수

아래 예시 파일을 복사해서 사용할 수 있습니다.

```bash
apps/server/.env.dev
apps/server/.env.prod
```

예시 값:

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
PORT=4000
```

## 배포 관련 파일

현재 저장소에는 mallo 서버 기준 배포 스캐폴드도 포함되어 있습니다.

- `apps/server/Dockerfile`
- `deploy/mallo/docker-compose.dev.yml`
- `deploy/mallo/docker-compose.prod.yml`
- `deploy/mallo/Caddyfile`

서버에서 Codex와 Claude를 분리해서 운영하는 방식과 비밀값 권한 정책은 [`docs/guides/SERVER_AGENT_WORKFLOW.md`](./docs/guides/SERVER_AGENT_WORKFLOW.md) 문서를 기준으로 관리합니다.

## 문서 구조

프로젝트 문서는 역할에 따라 아래와 같이 관리합니다.

- docs/checklists: 테스트, 배포, 점검 체크리스트
- docs/guides: 공개 운영/개발 가이드
- docs/internal: 내부 전용 문서

## 다음 개발 우선순위 제안

1. 한국어 일정 파싱 개선
2. 추천 시간 선택 기능 추가
3. 실제 STT provider 연결
4. Google Calendar 실제 연동 검증
