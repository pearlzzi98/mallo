# Android Release Checklist

`mallo` 프로젝트를 Google Play 내부 테스트 및 운영 배포로 이어가기 위한 작업 정리 문서입니다.

## Current Status Summary

- [x] 모바일 앱이 `Expo` 기반으로 구성되어 있다.
- [x] 기본 모바일 화면과 라우팅이 구현되어 있다.
- [x] 마이크 권한 설정이 포함되어 있다.
- [x] Google OAuth 연동 코드가 존재한다.
- [ ] 안드로이드 빌드 설정이 정식 배포 수준으로 정리되어 있다.
- [ ] `eas.json` 이 존재한다.
- [ ] 운영용 AAB 빌드 절차가 정리되어 있다.
- [ ] Google Play 내부 테스트 배포 절차가 정리되어 있다.

## 1. Android Release Build Strategy

- [x] `Expo` 기반 앱 구조가 존재한다.
- [ ] `EAS Build` 사용 여부를 결정했다.
- [ ] Android Studio 사용 범위를 결정했다.
- [ ] 테스트용 빌드와 운영용 빌드 정책을 정했다.

## 2. Android App Release Configuration

- [x] 앱 이름이 설정되어 있다.
- [x] 앱 스킴(`mallo`)이 설정되어 있다.
- [x] 마이크 권한 문구가 설정되어 있다.
- [ ] Android package name 이 설정되어 있다.
- [ ] 앱 아이콘이 준비되어 있다.
- [ ] 스플래시 이미지가 준비되어 있다.
- [ ] 버전명과 버전코드 정책이 정리되어 있다.
- [ ] 서명 키 관리 방식을 정했다.

## 3. Google OAuth and Production Readiness

- [x] Google OAuth 관련 서버 코드가 존재한다.
- [ ] 배포용 Google OAuth Client 설정이 완료되어 있다.
- [ ] Android 앱 기준 redirect/deep link 설정을 확정했다.
- [ ] 운영 환경에서 세션 저장 방식을 검토했다.
- [ ] 실제 Google Calendar 연동을 운영 환경에서 검증했다.

## 4. Store Release Preparation

- [ ] 테스트용 APK 또는 내부 테스트용 빌드를 생성했다.
- [ ] 운영용 AAB 빌드를 생성했다.
- [ ] 앱 설명, 아이콘, 스크린샷을 준비했다.
- [ ] 개인정보처리방침을 준비했다.
- [ ] 데이터 수집/권한 고지를 검토했다.
- [ ] Google Play Console 내부 테스트 트랙에 등록했다.
- [ ] 내부 테스트 결과를 반영했다.
- [ ] 운영 배포 여부를 결정했다.

## Recommended Order

- [ ] 1. 운영용 빌드 방식을 확정한다.
- [ ] 2. 앱 메타데이터와 서명 정책을 정리한다.
- [ ] 3. 운영용 AAB를 생성한다.
- [ ] 4. Google Play 내부 테스트 트랙에 배포한다.
- [ ] 5. 내부 테스트 결과를 반영한 뒤 운영 배포 여부를 결정한다.

## Relevant Files

- 모바일 앱 설정: `apps/mobile/app.json`
- 모바일 API 연결: `apps/mobile/lib/api.ts`
- 모바일 메인 화면: `apps/mobile/app/index.tsx`
- 서버 진입점: `apps/server/src/index.ts`
- Google OAuth: `apps/server/src/google-auth.ts`
