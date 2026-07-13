// apps/gemini-service/src/agent/websocket-gemini.ts
//
// WebSocket connection to Gemini Live API (BidiGenerateContent).
// - connect()     → opens WS, sends setup message, waits until ready
// - sendAudio()   → sends a PCM audio chunk as base64
// - close()       → closes the connection
//
// Gemini expects: 16-bit PCM, 16kHz, little-endian, mono

import { WebSocket } from 'ws'

const GEMINI_WS_URL =
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent'

export interface GeminiCallbacks {
  onText?: (text: string) => void       // partial or final text from Gemini
  onError?: (error: Error) => void
  onClose?: () => void
}

export class GeminiLiveConnection {
  private ws: WebSocket | null = null
  private ready = false
  private callbacks: GeminiCallbacks

  constructor(callbacks: GeminiCallbacks = {}) {
    this.callbacks = callbacks
  }

  // ─── Connect & Setup ──────────────────────────────────────────────────────

  connect(apiKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `${GEMINI_WS_URL}?key=${apiKey}`
      this.ws = new WebSocket(url)

      this.ws.on('open', () => {
        console.log('[Gemini] WebSocket connected, sending setup...')

        // First message MUST be the setup
        this.ws!.send(JSON.stringify({
          setup: {
            model: 'models/gemini-2.0-flash-live',
            generationConfig: {
              responseModalities: ['TEXT'],  // text-only responses for now
            },
          },
        }))
      })

      this.ws.on('message', (raw) => {
        const msg = JSON.parse(raw.toString())

        // Setup confirmation — Gemini is ready
        if (msg.setupComplete) {
          console.log('[Gemini] ✅ Setup complete, ready for audio')
          this.ready = true
          resolve()
          return
        }

        // Text response from Gemini
        if (msg.serverContent?.modelTurn?.parts) {
          for (const part of msg.serverContent.modelTurn.parts) {
            if (part.text) {
              this.callbacks.onText?.(part.text)
            }
          }
        }
      })

      this.ws.on('error', (err) => {
        console.error('[Gemini] WebSocket error:', err.message)
        this.callbacks.onError?.(err)
        if (!this.ready) reject(err)
      })

      this.ws.on('close', () => {
        console.log('[Gemini] WebSocket closed')
        this.ready = false
        this.ws = null
        this.callbacks.onClose?.()
      })
    })
  }

  // ─── Send Audio ───────────────────────────────────────────────────────────
  // Takes raw Int16 PCM bytes (as a Buffer) and sends them as base64

  sendAudio(pcmBuffer: Buffer): void {
    if (!this.ws || !this.ready) return

    this.ws.send(JSON.stringify({
      realtimeInput: {
        mediaChunks: [{
          mimeType: 'audio/pcm;rate=16000',
          data: pcmBuffer.toString('base64'),
        }],
      },
    }))
  }

  // ─── Close ────────────────────────────────────────────────────────────────

  close(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.ready = false
    }
  }

  get isReady(): boolean {
    return this.ready
  }
}