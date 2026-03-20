# Server Agent Workflow

이 문서는 서버 운영 환경에서 Codex와 Claude를 어떻게 나눠 쓰는지 정리한 공개용 문서입니다.

## 목적

- 코드 작성과 구조 설계는 Codex에서 진행
- 실제 서버 점검과 실행 검증은 서버의 Claude CLI에서 진행
- 비밀값은 프로젝트 작업 경로 밖으로 분리해서 에이전트가 읽지 못하게 유지

## 역할 분담

### Codex

- 기능 설계
- 코드 작성
- 리팩터링
- 스크립트 초안 작성
- 에러 원인 분석

### Claude CLI on Server

- 프로젝트 작업 디렉터리의 실제 파일 확인
- Docker Compose 실행 및 상태 점검
- 배포 스크립트 실행
- 로그 확인
- 서버 환경 기준 동작 검증

## 서버 디렉터리 원칙

프로젝트 작업 경로 예시:

```text
/workspace/project
```

비밀값 보관 경로 예시:

```text
/secure/project-secrets
```

원칙:

- Claude는 프로젝트 작업 디렉터리 안에서만 작업
- 비밀값 디렉터리는 에이전트 실행 계정이 읽지 못하도록 유지
- 프로젝트 내부 `env/` 같은 경로에 실제 비밀값을 두지 않음

## 권한 정책

프로젝트 경로는 배포 사용자와 에이전트 사용자가 함께 접근할 수 있게 관리합니다.

- project owner: `deploy-user`
- project group: `project-group`

비밀값 경로는 배포 사용자만 접근합니다.

- secret owner: `deploy-user`
- secret group: `deploy-user`
- secrets root: agent account cannot read
- rendered env files: readable only by the deploy path owner

이 설정의 목적은 다음과 같습니다.

- 에이전트 계정은 프로젝트 코드는 읽고 수정 가능
- 에이전트 계정은 비밀값 디렉터리와 렌더된 env 파일은 읽지 못함

## 비밀값 운영

원본 비밀값은 별도 파일로 보관합니다.

예시:

```text
/secure/project-secrets/dev/oauth-config.json
/secure/project-secrets/prod/oauth-config.json
```

실행용 환경변수 파일은 아래와 같이 별도 경로에 생성합니다.

```text
/secure/project-secrets/dev/server.env
/secure/project-secrets/prod/server.env
```

렌더 스크립트 예시:

```text
/workspace/project/scripts/render-env.sh
```

실행 예시:

```bash
sudo /workspace/project/scripts/render-env.sh dev
sudo /workspace/project/scripts/render-env.sh prod
```

## 배포 파일 위치

Docker Compose 파일 예시:

```text
/workspace/project/compose/docker-compose.dev.yml
/workspace/project/compose/docker-compose.prod.yml
```

배포 스크립트 예시:

```text
/workspace/project/scripts/deploy-dev.sh
/workspace/project/scripts/deploy-prod.sh
```

Compose 파일은 프로젝트 내부 비밀값을 직접 보지 않고 외부의 비밀값 경로만 참조해야 합니다.

예시:

```yaml
env_file:
  - /secure/project-secrets/dev/server.env
```

```yaml
env_file:
  - /secure/project-secrets/prod/server.env
```

## 작업 순서

1. Codex에서 코드 또는 스크립트 변경안 작성
2. 변경 사항을 Git으로 반영
3. 서버에서 에이전트 실행 계정으로 Claude CLI 실행
4. 프로젝트 작업 디렉터리 기준으로 실제 파일과 배포 흐름 점검
5. 필요 시 배포 스크립트 실행 및 로그 확인
6. 서버 결과를 기준으로 다시 Codex에서 수정

## 서버에서 Claude 실행

권장 계정 예시:

```text
agent-user
```

실행 예시:

```bash
sudo -iu agent-user
cd /workspace/project
claude
```

첫 검증 예시:

```text
현재 작업 디렉터리 구조를 요약해줘. 외부 secrets 경로 접근이 가능한지도 먼저 확인하고, 접근 불가면 그 사실만 말해줘.
```

기대 결과:

- 프로젝트 작업 디렉터리는 읽힘
- 외부 secrets 경로는 `Permission denied`

## 주의 사항

- 에이전트 계정에 불필요한 운영 권한을 주지 않음
- 프로젝트 내부에 실제 env 파일을 다시 만들지 않음
- 비밀값은 Git에 올리지 않음
- 서버에서 읽지 못한 경로는 추정하지 말고 실제 확인 결과만 사용

## 운영 요약

- Codex는 설계와 코드 작성
- Claude는 서버 검증과 실행
- 비밀값은 프로젝트 외부 경로로 분리
- 에이전트 계정은 코드만 다루고 비밀값은 읽지 못하게 유지
