import { google } from "googleapis";

export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events"
];

export type GoogleOAuthConfig = {
  clientId?: string;
  clientSecret?: string;
};

export type GoogleSession = {
  id: string;
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number;
};

const sessionStore = new Map<string, GoogleSession>();

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function isGoogleConfigured(config: GoogleOAuthConfig) {
  return Boolean(config.clientId && config.clientSecret);
}

export function createOAuthClient(config: GoogleOAuthConfig, redirectUri: string) {
  if (!config.clientId || !config.clientSecret) {
    throw new Error("Google OAuth is not configured.");
  }

  return new google.auth.OAuth2(config.clientId, config.clientSecret, redirectUri);
}

export function buildGoogleAuthUrl(config: GoogleOAuthConfig, redirectUri: string) {
  const client = createOAuthClient(config, redirectUri);
  const state = randomId();
  return {
    state,
    url: client.generateAuthUrl({
      access_type: "offline",
      include_granted_scopes: true,
      prompt: "consent",
      scope: GOOGLE_SCOPES
    })
  };
}

export async function exchangeGoogleCode(input: {
  code: string;
  redirectUri: string;
  config: GoogleOAuthConfig;
}) {
  const client = createOAuthClient(input.config, input.redirectUri);
  const { tokens } = await client.getToken(input.code);

  if (!tokens.access_token) {
    throw new Error("Google did not return an access token.");
  }

  const session: GoogleSession = {
    id: randomId(),
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? undefined,
    expiryDate: tokens.expiry_date ?? undefined
  };

  sessionStore.set(session.id, session);
  return session;
}

export function getStoredSession(sessionId: string) {
  return sessionStore.get(sessionId);
}
