import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  setCredentials,
  mockGetStoredSession,
  mockIsGoogleConfigured,
  mockCreateOAuthClient,
  googleProviderConstructor
} = vi.hoisted(() => {
  const setCredentials = vi.fn();
  const mockGetStoredSession = vi.fn();
  const mockIsGoogleConfigured = vi.fn();
  const mockCreateOAuthClient = vi.fn(() => ({
    setCredentials
  }));
  const googleProviderConstructor = vi.fn(function GoogleCalendarProviderMock(this: object, auth: unknown) {
    Object.assign(this, { auth });
  });

  return {
    setCredentials,
    mockGetStoredSession,
    mockIsGoogleConfigured,
    mockCreateOAuthClient,
    googleProviderConstructor
  };
});

vi.mock("../../apps/server/src/google-auth", () => ({
  getStoredSession: mockGetStoredSession,
  isGoogleConfigured: mockIsGoogleConfigured,
  createOAuthClient: mockCreateOAuthClient
}));

vi.mock("../../apps/server/src/google-calendar-provider", () => ({
  GoogleCalendarProvider: googleProviderConstructor
}));

import { MockCalendarProvider } from "../../apps/server/src/mock-calendar-provider";
import { createCalendarProvider } from "../../apps/server/src/provider-factory";

describe("createCalendarProvider", () => {
  beforeEach(() => {
    setCredentials.mockReset();
    mockGetStoredSession.mockReset();
    mockIsGoogleConfigured.mockReset();
    mockCreateOAuthClient.mockClear();
    googleProviderConstructor.mockClear();
  });

  it("returns the mock provider when oauth input is incomplete", () => {
    mockIsGoogleConfigured.mockReturnValue(false);

    const result = createCalendarProvider({
      config: {},
      redirectUri: "https://example.com/callback"
    });

    expect(result.mode).toBe("mock");
    expect(result.provider).toBeInstanceOf(MockCalendarProvider);
    expect(mockGetStoredSession).not.toHaveBeenCalled();
  });

  it("returns the mock provider when the session is missing", () => {
    mockIsGoogleConfigured.mockReturnValue(true);
    mockGetStoredSession.mockReturnValue(undefined);

    const result = createCalendarProvider({
      config: { clientId: "id", clientSecret: "secret" },
      redirectUri: "https://example.com/callback",
      sessionId: "missing-session"
    });

    expect(result.mode).toBe("mock");
    expect(result.provider).toBeInstanceOf(MockCalendarProvider);
    expect(mockGetStoredSession).toHaveBeenCalledWith("missing-session");
  });

  it("returns the google provider when config and session are available", () => {
    mockIsGoogleConfigured.mockReturnValue(true);
    mockGetStoredSession.mockReturnValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      expiryDate: 123456789
    });

    const result = createCalendarProvider({
      config: { clientId: "id", clientSecret: "secret" },
      redirectUri: "https://example.com/callback",
      sessionId: "session-1"
    });

    expect(result.mode).toBe("google");
    expect(mockCreateOAuthClient).toHaveBeenCalledWith(
      { clientId: "id", clientSecret: "secret" },
      "https://example.com/callback"
    );
    expect(setCredentials).toHaveBeenCalledWith({
      access_token: "access-token",
      refresh_token: "refresh-token",
      expiry_date: 123456789
    });
    expect(googleProviderConstructor).toHaveBeenCalledTimes(1);
  });
});
