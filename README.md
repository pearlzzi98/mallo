# Mallo

Google Calendar-connected voice scheduling assistant scaffold.

## Structure

- `apps/mobile`: Expo React Native app with Google sign-in entry points and microphone capture flow
- `apps/server`: Express API for Google OAuth exchange, calendar review, and event creation
- `packages/domain`: shared scheduling models and suggestion logic
- `deploy/mallo`: Docker Compose and reverse proxy examples for `mallo` on `pearlhub.cloud`

## Mallo domain plan

- Production API: `api.mallo.pearlhub.cloud`
- Development API: `dev-api.mallo.pearlhub.cloud`
- Mobile app and future web app should call one of those API domains depending on environment

## Current flow

1. The app asks the server for a Google OAuth URL
2. The mobile app completes Google sign-in and exchanges the auth code for a session id
3. The user can type or record a scheduling request
4. The mobile app sends text to the draft review API
5. The server checks Google Calendar when configured, otherwise falls back to mock mode
6. The server returns conflicts and alternative suggestions
7. The app creates the event in Google Calendar or mock mode

## Commands

```bash
npm install
npm run dev:server
npm run dev:mobile
```

## Environment

Create these files from the examples and set the correct values:

```bash
apps/server/.env.dev
apps/server/.env.prod
```

Example variables:

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
PORT=4000
```

If Google env vars are missing, the app still works in mock mode for the scheduling flow.

## Docker deployment for mallo

Development container:

```bash
docker compose -f deploy/mallo/docker-compose.dev.yml up -d --build
```

Production container:

```bash
docker compose -f deploy/mallo/docker-compose.prod.yml up -d --build
```

Reverse proxy example is in `deploy/mallo/Caddyfile`.

- `api.mallo.pearlhub.cloud` -> `127.0.0.1:4000`
- `dev-api.mallo.pearlhub.cloud` -> `127.0.0.1:4100`

## Implemented now

- Shared event and suggestion domain models
- Conflict-aware suggestion engine
- Server routes for Google OAuth URL creation and auth code exchange
- Server routes for draft review, mock speech transcription, and event creation
- Google Calendar provider using the Google Calendar API client
- Mock provider fallback when Google is not configured
- Expo app flow for Google connect, voice recording, transcription request, and draft review
- Dockerfile and dev/prod compose setup for the mallo server

## Still remaining

- Persist Google sessions securely instead of keeping them in memory
- Replace the mock speech provider with a real STT provider
- Improve natural language parsing beyond the demo parser
- Add real device-safe API base URL handling instead of hardcoded localhost
- Run install, typecheck, Docker build, and server verification
