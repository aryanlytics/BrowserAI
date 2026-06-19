// components/whisper-client.ts

// Convert Float32Array to WAV blob — Whisper needs audio file not raw float
function float32ToWav(float32Array: Float32Array, sampleRate = 16000): Blob {
  const buffer = new ArrayBuffer(44 + float32Array.length * 2)
  const view = new DataView(buffer)

  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + float32Array.length * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, float32Array.length * 2, true)

  // Audio data
  let offset = 44
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]!))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    offset += 2
  }

  return new Blob([buffer], { type: 'audio/wav' })
}

export async function transcribeAudio(audio: Float32Array): Promise<string> {
  const wav = float32ToWav(audio)

  const formData = new FormData()
  formData.append('audio', wav, 'speech.wav')

  // Sends to your voice-service which calls Groq Whisper
  const res = await fetch('/api/voice/transcribe', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  })

  const data = await res.json()
  return data.transcript as string
}