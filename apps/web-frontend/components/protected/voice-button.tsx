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

  