export interface SpeechToTextProvider {
  transcribe(input: { audioBase64: string; mimeType: string }): Promise<{ text: string; mode: "mock" | "provider" }>;
}
