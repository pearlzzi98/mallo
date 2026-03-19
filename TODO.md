# TODO

## Project status

- Monorepo scaffold is in place for mobile, server, and shared scheduling logic
- Expo mobile app now has Google sign-in handoff UI and microphone recording flow
- Server now exposes Google OAuth URL and code exchange endpoints
- Server can review event drafts and create events through Google Calendar when configured
- Server falls back to mock calendar and mock speech transcription when live credentials are absent

## Last completed work

- Added Google OAuth scaffolding on the server
- Added Google Calendar provider backed by `googleapis`
- Added Expo microphone capture and transcription request flow
- Reworked the mobile home screen to cover connect, record, review, and create flows
- Added `.env.example` and refreshed the README

## In progress or incomplete

- Secure session persistence for Google tokens
- Real STT provider integration
- Better natural-language time parsing
- Dependency install and runtime verification
- Device-safe server URL configuration for Expo development builds

## Next work candidates

- Replace in-memory Google session storage with a persistent store
- Connect `/api/speech/transcribe` to a real speech-to-text provider
- Add calendar list selection after Google sign-in
- Improve parser support for Korean date and weekday phrases
- Run end-to-end verification after installing dependencies
