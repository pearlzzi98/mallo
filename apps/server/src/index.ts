import express from "express";
import cors from "cors";
import {
  buildDraftFromIntent,
  parseDemoVoiceInput,
  reviewDraft,
  type AvailabilityPreference,
  type EventDraft
} from "@mallo/domain";
import { buildGoogleAuthUrl, exchangeGoogleCode, isGoogleConfigured, type GoogleOAuthConfig } from "./google-auth";
import { createCalendarProvider } from "./provider-factory";
import { MockSpeechToTextProvider } from "./mock-speech-provider";

const app = express();
const speechProvider = new MockSpeechToTextProvider();
const googleConfig: GoogleOAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET
};

app.use(cors());
app.use(express.json({ limit: "15mb" }));

app.get("/health", (_, res) => {
  res.json({
    ok: true,
    googleConfigured: isGoogleConfigured(googleConfig)
  });
});

app.get("/api/auth/google/url", (req, res) => {
  const redirectUri = String(req.query.redirectUri ?? "");

  if (!redirectUri) {
    res.status(400).json({ message: "redirectUri is required." });
    return;
  }

  if (!isGoogleConfigured(googleConfig)) {
    res.status(501).json({ message: "Google OAuth env vars are not configured." });
    return;
  }

  const auth = buildGoogleAuthUrl(googleConfig, redirectUri);
  res.json(auth);
});

app.post("/api/auth/google/exchange", async (req, res) => {
  const { code, redirectUri }: { code: string; redirectUri: string } = req.body;

  if (!code || !redirectUri) {
    res.status(400).json({ message: "code and redirectUri are required." });
    return;
  }

  try {
    const session = await exchangeGoogleCode({
      code,
      redirectUri,
      config: googleConfig
    });

    res.json({
      sessionId: session.id,
      expiresAt: session.expiryDate ?? null
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to exchange Google OAuth code."
    });
  }
});

app.post("/api/speech/transcribe", async (req, res) => {
  const {
    audioBase64,
    mimeType = "audio/m4a"
  }: {
    audioBase64: string;
    mimeType?: string;
  } = req.body;

  if (!audioBase64) {
    res.status(400).json({ message: "audioBase64 is required." });
    return;
  }

  const transcript = await speechProvider.transcribe({ audioBase64, mimeType });
  res.json(transcript);
});

app.post("/api/drafts/review", async (req, res) => {
  const {
    rawText,
    timezone = "Asia/Seoul",
    calendarId = "primary",
    preferences,
    sessionId,
    redirectUri
  }: {
    rawText: string;
    timezone?: string;
    calendarId?: string;
    preferences?: AvailabilityPreference;
    sessionId?: string;
    redirectUri?: string;
  } = req.body;

  const intent = parseDemoVoiceInput(rawText, timezone);
  const draft = buildDraftFromIntent(intent);
  const from = new Date(draft.startAt);
  from.setDate(from.getDate() - 1);
  const to = new Date(draft.startAt);
  to.setDate(to.getDate() + 7);

  const { provider, mode } = createCalendarProvider({
    config: googleConfig,
    redirectUri,
    sessionId
  });

  const events = await provider.listEvents({
    calendarId,
    from: from.toISOString(),
    to: to.toISOString()
  });

  res.json({
    ...reviewDraft(draft, events, preferences),
    calendarMode: mode
  });
});

app.post("/api/events", async (req, res) => {
  const {
    calendarId = "primary",
    draft,
    sessionId,
    redirectUri
  }: {
    calendarId?: string;
    draft: EventDraft;
    sessionId?: string;
    redirectUri?: string;
  } = req.body;

  const { provider, mode } = createCalendarProvider({
    config: googleConfig,
    redirectUri,
    sessionId
  });

  const event = await provider.createEvent({ calendarId, draft });
  res.status(201).json({
    ...event,
    calendarMode: mode
  });
});

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`Mallo server listening on ${port}`);
});
