import { MicVAD } from '@ricky0123/vad-web'

// ─── Types ──────────────────────────────────────────────────────────────────

interface VoiceRecorderOptions {
  onSpeechStart?: () => void
  onSpeechEnd?: (audioChunk: ArrayBuffer) => void
  onVADError?: (error: unknown) => void
}

// ─── Convert Float32Array (Silero output) → Int16Array (Speechmatics input) ──
// Speechmatics expects pcm_s16le — signed 16-bit little-endian PCM.
// Silero VAD gives us Float32 samples in range [-1, 1].

function float32ToInt16(float32: Float32Array): Int16Array {
  const int16 = new Int16Array(float32.length)
  for (let i = 0; i < float32.length; i++) {
    const sample = Math.max(-1, Math.min(1, float32[i]!))
    int16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff
  }
  return int16
}

// ─── Voice Recorder ───────────────────────────────────────────────────────────
// Wraps Silero VAD (via @ricky0123/vad-web). Only fires onSpeechEnd
// when actual speech is detected — silence, noise, etc. are filtered out
// before this callback runs.

export class VoiceRecorder {
  private vad: MicVAD | null = null
  private options: VoiceRecorderOptions
  private isActive = false

  constructor(options: VoiceRecorderOptions) {
    this.options = options
  }

  // ─── Start listening ────────────────────────────────────────────────────────

  async start(): Promise<void> {
    if (this.isActive) return

    try {
      this.vad = await MicVAD.new({
        // Fires when Silero detects speech beginning
        onSpeechStart: () => {
          this.options.onSpeechStart?.()
        },

        // Fires when Silero detects speech has ended
        // audio = Float32Array of the full speech segment (silence already excluded)
        onSpeechEnd: (audio: Float32Array) => {
          const int16Audio = float32ToInt16(audio)
          this.options.onSpeechEnd?.(int16Audio.buffer as ArrayBuffer)
        },

        // Tuning — adjust if too sensitive / not sensitive enough
        positiveSpeechThreshold: 0.8,  // confidence required to START detecting speech
        negativeSpeechThreshold: 0.7,  // confidence required to STOP (end of speech)
        minSpeechMs: 3,                  // minimum speech duration in ms to count as speech
        preSpeechPadMs: 2,              // include a few ms before speech starts (avoid cutting first word)
      })

      this.vad.start()
      this.isActive = true

    } catch (err) {
      this.options.onVADError?.(err)
      throw err
    }
  }

  // ─── Stop listening ─────────────────────────────────────────────────────────

  stop(): void {
    if (!this.isActive) return

    this.vad?.pause()
    this.vad?.destroy()
    this.vad = null
    this.isActive = false
  }

  // ─── Status ─────────────────────────────────────────────────────────────────

  get active(): boolean {
    return this.isActive
  }
}