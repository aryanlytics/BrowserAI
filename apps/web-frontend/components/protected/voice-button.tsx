// components/voice-button.tsx
'use client'
import { useState, useRef } from 'react'
import { VoiceRecorder } from '@/lib/voice-recorder'
import { getSpeechmaticsToken, connectSpeechmatics } from '@/lib/speechmatics'

export function VoiceButton({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [active, setActive] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const recorderRef = useRef<VoiceRecorder | null>(null)

  const start = async () => {
    const token = await getSpeechmaticsToken()
    wsRef.current = connectSpeechmatics(token, onTranscript)

    recorderRef.current = new VoiceRecorder({
      onSpeechStart: () => console.log('[Voice] Speech started'),
      onSpeechEnd: (audioChunk) => {
        // Only fires for actual detected speech — silence already filtered
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(audioChunk)
        }
      },
      onVADError: (err) => console.error('[Voice] VAD error', err),
    })

    await recorderRef.current.start()
    setActive(true)
  }

  const stop = () => {
    recorderRef.current?.stop()
    wsRef.current?.close()
    setActive(false)
  }

  return (
    <button onClick={active ? stop : start}>
      {active ? 'Stop' : 'Start'}
    </button>
  )
}