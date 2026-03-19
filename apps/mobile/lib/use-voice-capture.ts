import { useState } from "react";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { transcribeAudio } from "./api";

export function useVoiceCapture() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  async function startRecording() {
    const permission = await Audio.requestPermissionsAsync();

    if (!permission.granted) {
      throw new Error("Microphone permission was not granted.");
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true
    });

    const nextRecording = new Audio.Recording();
    await nextRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await nextRecording.startAsync();

    setRecording(nextRecording);
    setIsRecording(true);
  }

  async function stopRecordingAndTranscribe() {
    if (!recording) {
      throw new Error("No active recording.");
    }

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    setRecording(null);
    setIsRecording(false);

    if (!uri) {
      throw new Error("Recorded audio URI is unavailable.");
    }

    const audioBase64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64
    });

    return transcribeAudio(audioBase64);
  }

  return {
    isRecording,
    startRecording,
    stopRecordingAndTranscribe
  };
}
