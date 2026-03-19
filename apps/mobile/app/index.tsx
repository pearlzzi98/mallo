import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { DraftReview } from "@mallo/domain";
import { createCalendarEvent, reviewEventDraft } from "../lib/api";
import { useGoogleAuth } from "../lib/use-google-auth";
import { useVoiceCapture } from "../lib/use-voice-capture";

function formatSlot(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export default function HomeScreen() {
  const [rawText, setRawText] = useState("Schedule a dentist appointment tomorrow at 3 PM");
  const [review, setReview] = useState<(DraftReview & { calendarMode: "google" | "mock" }) | null>(null);
  const [status, setStatus] = useState("Connect Google Calendar or use the mock flow to test scheduling.");
  const { redirectUri, sessionId, signIn } = useGoogleAuth();
  const { isRecording, startRecording, stopRecordingAndTranscribe } = useVoiceCapture();

  async function handleGoogleSignIn() {
    try {
      setStatus("Opening Google sign-in...");
      await signIn();
      setStatus("Google Calendar is connected for this app session.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to connect Google Calendar.");
    }
  }

  async function handleVoiceCapture() {
    try {
      if (!isRecording) {
        setStatus("Recording your voice request...");
        await startRecording();
        return;
      }

      setStatus("Transcribing your recording...");
      const transcript = await stopRecordingAndTranscribe();
      setRawText(transcript.text);
      setStatus(
        transcript.mode === "mock"
          ? "Mock transcription filled the request. Replace the speech provider to use a live STT service."
          : "Voice input was transcribed."
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Voice capture failed.");
    }
  }

  async function handleDraftReview() {
    try {
      setStatus("Checking your preferred slot against the calendar...");
      const nextReview = await reviewEventDraft({
        rawText,
        timezone: "Asia/Seoul",
        calendarId: "primary",
        redirectUri,
        sessionId
      });

      setReview(nextReview);
      setStatus(
        nextReview.conflict.hasConflict
          ? `Conflict found. Showing ${nextReview.suggestions.length} alternatives.`
          : `No conflict found. Ready to create in ${nextReview.calendarMode} mode.`
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to review draft.");
    }
  }

  async function handleCreateEvent() {
    if (!review) {
      return;
    }

    try {
      setStatus("Creating the event...");
      const event = await createCalendarEvent({
        calendarId: "primary",
        redirectUri,
        sessionId,
        draft: review.draft
      });

      setStatus(
        event.calendarMode === "google"
          ? "Event created in Google Calendar."
          : "Event created in mock mode. Add Google OAuth env vars to switch to the live provider."
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to create event.");
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>Mallo</Text>
        <Text style={styles.title}>Voice-first scheduling with Google Calendar fallback support</Text>
        <Text style={styles.description}>
          This scaffold now includes Google OAuth handoff endpoints and mobile microphone capture. Without Google env
          vars it safely stays in mock mode.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Calendar connection</Text>
          <Text style={styles.helper}>
            Session: {sessionId ? `connected (${sessionId.slice(0, 8)}...)` : "not connected, mock mode will be used"}
          </Text>
          <Pressable style={styles.secondaryButton} onPress={handleGoogleSignIn}>
            <Text style={styles.secondaryButtonText}>Connect Google Calendar</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Voice or text input</Text>
          <TextInput multiline value={rawText} onChangeText={setRawText} style={styles.input} />
          <View style={styles.buttonRow}>
            <Pressable style={styles.secondaryButton} onPress={handleVoiceCapture}>
              <Text style={styles.secondaryButtonText}>{isRecording ? "Stop and transcribe" : "Record voice"}</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={handleDraftReview}>
              <Text style={styles.primaryButtonText}>Review event</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.status}>{status}</Text>

        {review ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Draft event</Text>
            <Text style={styles.itemText}>Title: {review.draft.title}</Text>
            <Text style={styles.itemText}>Start: {formatSlot(review.draft.startAt)}</Text>
            <Text style={styles.itemText}>End: {formatSlot(review.draft.endAt)}</Text>
            <Text style={styles.itemText}>Calendar mode: {review.calendarMode}</Text>

            {review.conflict.hasConflict ? (
              <>
                <Text style={styles.warning}>This slot collides with an existing event.</Text>
                {review.suggestions.map((suggestion) => (
                  <View key={suggestion.startAt} style={styles.suggestion}>
                    <Text style={styles.itemText}>{formatSlot(suggestion.startAt)}</Text>
                    <Text style={styles.reason}>{suggestion.reason}</Text>
                  </View>
                ))}
              </>
            ) : (
              <Text style={styles.success}>No conflict detected.</Text>
            )}

            <Pressable style={styles.primaryButton} onPress={handleCreateEvent}>
              <Text style={styles.primaryButtonText}>Create event</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4efe6"
  },
  container: {
    padding: 24,
    gap: 16
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#8b5e34"
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    color: "#2f241f"
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#5c4f48"
  },
  card: {
    backgroundColor: "#fffaf2",
    borderRadius: 24,
    padding: 20,
    gap: 12
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5c4f48"
  },
  helper: {
    fontSize: 14,
    color: "#6d625c"
  },
  input: {
    minHeight: 110,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    padding: 14,
    fontSize: 16,
    textAlignVertical: "top"
  },
  buttonRow: {
    gap: 12
  },
  primaryButton: {
    backgroundColor: "#c06014",
    paddingVertical: 14,
    borderRadius: 16
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    textAlign: "center"
  },
  secondaryButton: {
    backgroundColor: "#2f241f",
    paddingVertical: 14,
    borderRadius: 16
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    textAlign: "center"
  },
  status: {
    color: "#7a3f11",
    fontWeight: "600"
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2f241f"
  },
  itemText: {
    fontSize: 15,
    color: "#2f241f"
  },
  warning: {
    color: "#a03f2b",
    fontWeight: "700"
  },
  success: {
    color: "#2f7d4d",
    fontWeight: "700"
  },
  suggestion: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#fff"
  },
  reason: {
    color: "#6d625c"
  }
});
