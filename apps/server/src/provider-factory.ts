import type { CalendarProvider } from "./calendar-provider.js";
import { createOAuthClient, getStoredSession, isGoogleConfigured, type GoogleOAuthConfig } from "./google-auth.js";
import { GoogleCalendarProvider } from "./google-calendar-provider.js";
import { MockCalendarProvider } from "./mock-calendar-provider.js";

export function createCalendarProvider(input: {
  config: GoogleOAuthConfig;
  redirectUri?: string;
  sessionId?: string;
}): { provider: CalendarProvider; mode: "google" | "mock" } {
  if (!input.sessionId || !input.redirectUri || !isGoogleConfigured(input.config)) {
    return {
      provider: new MockCalendarProvider(),
      mode: "mock"
    };
  }

  const session = getStoredSession(input.sessionId);

  if (!session) {
    return {
      provider: new MockCalendarProvider(),
      mode: "mock"
    };
  }

  const auth = createOAuthClient(input.config, input.redirectUri);
  auth.setCredentials({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    expiry_date: session.expiryDate
  });

  return {
    provider: new GoogleCalendarProvider(auth),
    mode: "google"
  };
}
