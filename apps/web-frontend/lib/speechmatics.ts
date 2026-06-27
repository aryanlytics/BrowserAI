// lib/speechmatics.ts
import axios from 'axios'

interface SpeechmaticsResult {
  alternatives?: { content?: string }[]
}

interface SpeechmaticsMessage {
  message: string
  results?: SpeechmaticsResult[]
}

export async function getSpeechmaticsToken(): Promise<string> {
  const res = await axios.post('/api/voice/token', null, {
    withCredentials: true,
  })

  return res.data.token
}

export function connectSpeechmatics(token: string, onFinalTranscript: (text: string) => void) {
  const ws = new WebSocket(
    `wss://eu2.rt.speechmatics.com/v2?jwt=${token}`
  )

  ws.onopen = () => {
    ws.send(JSON.stringify({
      message: 'StartRecognition',
      audio_format: {
        type: 'raw',
        encoding: 'pcm_s16le',
        sample_rate: 16000,
      },
      transcription_config: {
        language: 'en',
        enable_partials: true,
      },
    }))
  }

  ws.onmessage = (event) => {
    const msg: SpeechmaticsMessage = JSON.parse(event.data as string)

    if (msg.message === 'AddPartialTranscript') {
      const partial = msg.results
        ?.map((r: SpeechmaticsResult) => r.alternatives?.[0]?.content)
        .join(' ')
      console.log('[Partial]', partial)
    }

    if (msg.message === 'AddTranscript') {
      const final = msg.results
        ?.map((r: SpeechmaticsResult) => r.alternatives?.[0]?.content)
        .join(' ')
      if (final?.trim()) {
        onFinalTranscript(final.trim())
      }
    }
  }

  ws.onerror = (err) => console.error('[Speechmatics] WebSocket error', err)
  ws.onclose = () => console.log('[Speechmatics] WebSocket closed')

  return ws
}