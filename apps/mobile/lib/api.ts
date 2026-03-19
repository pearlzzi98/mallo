import type { DraftReview } from "@mallo/domain";

const API_BASE_URL = "http://localhost:4000";

export type GoogleAuthUrlResponse = {
  state: string;
  url: string;
};

export type GoogleSessionResponse = {
  sessionId: string;
  expiresAt: number | null;
};

export async function fetchGoogleAuthUrl(redirectUri: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/google/url?redirectUri=${encodeURIComponent(redirectUri)}`
  );

  if (!response.ok) {
    throw new Error("Unable to start Google sign-in.");
  }

  return (await response.json()) as GoogleAuthUrlResponse;
}

export async function exchangeGoogleCode(code: string, redirectUri: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/google/exchange`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ code, redirectUri })
  });

  if (!response.ok) {
    throw new Error("Unable to exchange Google auth code.");
  }

  return (await response.json()) as GoogleSessionResponse;
}

export async function transcribeAudio(audioBase64: string, mimeType = "audio/m4a") {
  const response = await fetch(`${API_BASE_URL}/api/speech/transcribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ audioBase64, mimeType })
  });

  if (!response.ok) {
    throw new Error("Unable to transcribe recorded audio.");
  }

  return (await response.json()) as { text: string; mode: "mock" | "provider" };
}

export async function reviewEventDraft(input: {
  rawText: string;
  timezone: string;
  calendarId: string;
  redirectUri: string;
  sessionId?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/drafts/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ...input,
      preferences: {
        preferredWeekdays: [1, 2, 3, 4, 5],
        preferredHours: [14, 15, 16]
      }
    })
  });

  if (!response.ok) {
    throw new Error("Unable to review event draft.");
  }

  return (await response.json()) as DraftReview & { calendarMode: "google" | "mock" };
}

export async function createCalendarEvent(input: {
  calendarId: string;
  redirectUri: string;
  draft: DraftReview["draft"];
  sessionId?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    throw new Error("Unable to create calendar event.");
  }

  return (await response.json()) as {
    id: string;
    title: string;
    calendarMode: "google" | "mock";
  };
}
