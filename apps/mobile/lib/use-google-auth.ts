import { useState } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { exchangeGoogleCode, fetchGoogleAuthUrl } from "./api";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [sessionId, setSessionId] = useState<string | undefined>();

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "mallo",
    path: "oauth"
  });

  async function signIn() {
    const auth = await fetchGoogleAuthUrl(redirectUri);
    const result = await AuthSession.startAsync({
      authUrl: auth.url,
      returnUrl: redirectUri
    });

    if (result.type !== "success" || !result.params.code) {
      throw new Error("Google sign-in was cancelled.");
    }

    const session = await exchangeGoogleCode(result.params.code, redirectUri);
    setSessionId(session.sessionId);
    return session.sessionId;
  }

  return {
    redirectUri,
    sessionId,
    signIn
  };
}
