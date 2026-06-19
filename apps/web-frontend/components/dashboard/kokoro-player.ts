// components/kokoro-player.ts
// Kokoro runs locally via transformers.js — no API cost
import { pipeline } from '@huggingface/transformers'

let tts: any = null

async function getTTS() {
  if (!tts) {
    // Loads Kokoro model in browser — first load takes ~10s
    tts = await pipeline('text-to-speech', 'onnx-community/Kokoro-82M-v1.0-ONNX')
  }
  return tts
}

export async function speak(text: string): Promise<void> {
  const synthesizer = await getTTS()
  const result = await synthesizer(text, { voice: 'af_heart' })

  // Play the audio
  const audioContext = new AudioContext()
  const audioBuffer = await audioContext.decodeAudioData(result.audio.buffer)
  const source = audioContext.createBufferSource()
  source.buffer = audioBuffer
  source.connect(audioContext.destination)
  source.start()
}