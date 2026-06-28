// components/voice-controller.tsx
'use client'
import { useState, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { createVAD } from './vad-processor'
import { transcribeAudio } from './whisper-client'
import { speak } from './kokoro-player'
import { so
type AgentState = 'idle' | 'listening' | 'thinking' | 'speaking'

export function VoiceController() {
  const [active, setActive] = useState(false)
  const [state, setState] = useState<AgentState>('idle')
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState(''
  const vadRef = useRef<any>(null)

  const startListening = async () => {
    setState('listening')

    vadRef.current = await createVAD(async (audio: Float32Array) => {
      // VAD detected end of speech — send to Whisper
      setState('thinking')

      const transcript = await transcribeAudio(audio)
      setTranscript(transcript)

      // Send transcript to agent via Socket.io
      socket.emit('agent:task', { transcript })
    })

    vadRef.current.start()
  }

  const stopListening = () => {
    vadRef.current?.destroy()
    vadRef.current = null
    setState('idle')
    setTranscript('')
    setResponse('')
  }

  const toggleMic = async () => {
    if (active) {
      stopListening()
      setActive(false)
    } else {
      await startListening()
      setActive(true)
    }
  }

  // Listen for agent response via Socket.io
  socket.on('agent:response', async (data: { text: string }) => {
    setResponse(data.text)
    setState('speaking')

    await speak(data.text) // Kokoro plays audio

    setState(active ? 'listening' : 'idle')
    setResponse('')
  })

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Mic button */}
      <button
        onClick={toggleMic}
        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
          active
            ? 'bg-violet-600 shadow-lg shadow-violet-500/40'
            : 'bg-white/5 border border-white/10'
        }`}
      >
        {active ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white/50" />}
      </button>

      {/* State label */}
      <p className="text-sm text-white/50">
        {state === 'idle'      && 'Click mic to start'}
        {state === 'listening' && 'Listening...'}
        {state === 'thinking'  && 'Processing...'}
        {state === 'speaking'  && 'Speaking...'}
      </p>

      {/* Transcript */}
      {transcript && (
        <p className="text-white/70 text-sm italic">"{transcript}"</p>
      )}

      {/* Agent response */}
      {response && (
        <p className="text-white/50 text-sm">{response}</p>
      )}
    </div>
  )
}