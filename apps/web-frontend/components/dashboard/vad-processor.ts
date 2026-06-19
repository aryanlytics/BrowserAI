// components/vad-processor.ts
import { MicVAD } from '@ricky0123/vad-web' // Silero VAD for browser

export async function createVAD(onSpeechEnd: (audio: Float32Array) => void) {
  const vad = await MicVAD.new({
    onSpeechEnd: (audio) => {
      // Called when you stop speaking
      // audio is Float32Array of the speech segment
      onSpeechEnd(audio)
    },
    onSpeechStart: () => {
      console.log('[VAD] Speech started')
    },
    positiveSpeechThreshold: 0.8,  // confidence to start recording
    negativeSpeechThreshold: 0.8,  // confidence to stop recording
    minSpeechFrames: 3,             // minimum frames to count as speech
  })

  return vad
}