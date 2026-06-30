// components/voice-button.tsx
'use client'
import { useState, useRef } from 'react'
import { startListening } from '@/lib/voice-recorder'
import { getSpeechmaticsToken, connectSpeechmatics } from '@/lib/speechmatics'

export function VoiceButton({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [active, setActive] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const stopRef = useRef<(() => void) | null>(null)

  const start = async () => {
    const token = await getSpeechmaticsToken()
    wsRef.current = connectSpeechmatics(token, onTranscript)

    stopRef.current = await startListening({
      onSpeech: (audio) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(audio)
        }
      },
      onError: (err) => console.error('[Voice] VAD error', err),
    })

    setActive(true)
  }

  const stop = () => {
    stopRef.current?.()
    wsRef.current?.close()
    setActive(false)
  }

  return (
    <button onClick={active ? stop : start}>
      {active ? 'Stop' : 'Start'}
    </button>
  )
}