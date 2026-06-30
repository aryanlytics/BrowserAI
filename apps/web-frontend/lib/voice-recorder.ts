import { MicVAD } from '@ricky0123/vad-web'

// ─── What this file does ────────────────────────────────────────────────────
// Listens to your mic, detects when you speak (using Silero AI model),
// and gives you the audio ready to send to Speechmatics.
//
// Usage:
//   const stop = await startListening({
//     onSpeech: (audio) => ws.send(audio),   // send to Speechmatics
//   })
//   stop()  // when done

// ─── Options ────────────────────────────────────────────────────────────────

interface ListenOptions {
  onSpeech: (audio: ArrayBuffer) => void   // called with audio when you stop talking
  onError?: (error: unknown) => void       // called if mic/model fails
}

// ─── Convert audio format ───────────────────────────────────────────────────
// Silero gives Float32 (-1 to 1), Speechmatics wants Int16 (-32768 to 32767)

function toInt16(audio: Float32Array): ArrayBuffer {
  const result = new Int16Array(audio.length)
  for (let i = 0; i < audio.length; i++) {
    const s = Math.max(-1, Math.min(1, audio[i]!))
    result[i] = s < 0 ? s * 32768 : s * 32767
  }
  return result.buffer as ArrayBuffer
}

// ─── Start listening ────────────────────────────────────────────────────────
// Returns a stop() function. That's it.

export async function startListening(options: ListenOptions): Promise<() => void> {
  try {
    const vad = await MicVAD.new({
      onSpeechEnd: (audio: Float32Array) => {
        options.onSpeech(toInt16(audio))
      },
      positiveSpeechThreshold: 0.8,
      negativeSpeechThreshold: 0.7,
      minSpeechMs: 3,
      preSpeechPadMs: 2,
    })

    vad.start()

    // Return a cleanup function
    return () => {
      vad.pause()
      vad.destroy()
    }
  } catch (err) {
    options.onError?.(err)
    throw err
  }
}