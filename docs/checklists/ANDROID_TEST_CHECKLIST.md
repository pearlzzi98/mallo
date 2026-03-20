# Android Test Checklist

`mallo` 프로젝트를 갤럭시 S24+에서 테스트하기 위한 작업 정리 문서입니다.

## Current Status Summary

- [x] 모바일 앱이 `Expo` 기반으로 구성되어 있다.
- [x] 기본 모바일 화면과 라우팅이 구현되어 있다.
- [x] 마이크 권한 설정이 포함되어 있다.
- [x] Google OAuth 연동 코드가 존재한다.
- [x] 서버 API와 일정 검토/생성 흐름이 구현되어 있다.
- [ ] 모바일 앱이 `prod` API 주소를 환경별로 바라보도록 분리되어 있다.
- [ ] 안드로이드 빌드 설정이 테스트 가능한 수준으로 정리되어 있다.
- [ ] `eas.json` 이 존재한다.
- [ ] 실기기 설치용 테스트 APK 또는 AAB 빌드 절차가 정리되어 있다.

## 1. Server Connection

- [x] 서버 프로젝트가 존재한다.
- [x] `prod` 환경 변수 예시 파일이 존재한다.
- [ ] 모바일 앱 API 주소가 `localhost` 고정에서 분리되어 있다.
- [ ] 개발/테스트/운영 API 주소를 환경별로 관리한다.
- [ ] 외부 기기에서 접근 가능한 `prod` HTTPS 주소가 준비되어 있다.

## 2. Android Test Build Strategy

- [x] `Expo` 기반 앱 구조가 존재한다.
- [ ] `EAS Build` 사용 여부를 결정했다.
- [ ] Android Studio 사용 범위를 결정했다.
- [ ] 테스트용 빌드 정책을 정했다.

## 3. Android App Configuration

- [x] 앱 이름이 설정되어 있다.
- [x] 앱 스킴(`mallo`)이 설정되어 있다.
- [x] 마이크 권한 문구가 설정되어 있다.
- [ ] Android package name 이 설정되어 있다.
- [ ] 앱 아이콘이 준비되어 있다.
- [ ] 스플래시 이미지가 준비되어 있다.
- [ ] 테스트용 빌드 설정이 정리되어 있다.

## 4. Google OAuth and Test Readiness

- [x] Google OAuth 관련 서버 코드가 존재한다.
- [ ] 테스트 대상 환경의 Google OAuth Client 설정이 완료되어 있다.
- [ ] Android 앱 기준 redirect/deep link 설정을 확정했다.
- [ ] 실제 Google Calendar 연동을 테스트 환경에서 검증했다.

## 5. Device Test on Galaxy S24+

- [ ] 갤럭시 S24+에 설치 가능한 테스트 빌드를 만들었다.
- [ ] 앱 실행 시 서버 연결이 정상 동작한다.
- [ ] Google 로그인 흐름이 정상 동작한다.
- [ ] 마이크 권한 요청과 음성 녹음이 정상 동작한다.
- [ ] 일정 검토 API 호출이 정상 동작한다.
- [ ] 일정 생성 API 호출이 정상 동작한다.
- [ ] 네트워크 환경 변경 시에도 동작을 확인했다.

## Recommended Order

- [ ] 1. 모바일 앱 API 주소를 환경별로 분리한다.
- [ ] 2. `Expo` 안드로이드 테스트 빌드 방식을 확정한다.
- [ ] 3. 테스트용 빌드 설정을 추가한다.
- [ ] 4. 갤럭시 S24+용 테스트 빌드를 생성한다.
- [ ] 5. 실기기에서 로그인, 음성 입력, 일정 생성까지 검증한다.

## Relevant Files

- 모바일 앱 설정: `apps/mobile/app.json`
- 모바일 API 연결: `apps/mobile/lib/api.ts`
- 모바일 메인 화면: `apps/mobile/app/index.tsx`
- 서버 진입점: `apps/server/src/index.ts`
- Google OAuth: `apps/server/src/google-auth.ts`
