// components/voice-button.tsx
'use client'
import { useState, useRef } from 'react'
import { useMicVAD } from '@ricky0123/vad-react'
import { getSpeechmaticsToken, connectSpeechmatics } from '@/lib/speechmatics'
import { Mic, MicOff } from 'lucide-react'

export function VoiceButton({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [active, setActive] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  const vad = useMicVAD({
    startOnLoad: false,
    onSpeechEnd: (audio: Float32Array) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

      // Convert Float32Array to Int16Array — Speechmatics expects pcm_s16le
      const int16 = new Int16Array(audio.length)
      for (let i = 0; i < audio.length; i++) {
        int16[i] = Math.max(-32768, Math.min(32767, audio[i]! * 32768))
      }

      wsRef.current.send(int16.buffer)
    },
  })

  const start = async () => {
    try {
      const token = await getSpeechmaticsToken()
      wsRef.current = connectSpeechmatics(token, onTranscript)
      vad.start()
      setActive(true)
    } catch (err) {
      console.error('Failed to start voice', err)
    }
  }

  const stop = () => {
    vad.pause()
    wsRef.current?.close()
    wsRef.current = null
    setActive(false)
  }

  return (
    <button
      onClick={active ? stop : start}
      className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
        active
          ? 'bg-violet-600 shadow-lg shadow-violet-500/40'
          : 'bg-white/5 border border-white/10'
      }`}
    >
      {active
        ? <Mic className="w-6 h-6 text-white" />
        : <MicOff className="w-6 h-6 text-white/50" />
      }
    </button>
  )
}