import type { SpeechToTextProvider } from "./speech-provider.js";

export class MockSpeechToTextProvider implements SpeechToTextProvider {
  async transcribe(_: { audioBase64: string; mimeType: string }) {
    return {
      text: "Schedule a dentist appointment tomorrow at 3 PM",
      mode: "mock" as const
    };
  }
}
