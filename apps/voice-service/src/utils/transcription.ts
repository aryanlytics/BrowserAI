// ─── Transcription utility ────────────────────────────────────────────────────
// Wraps your chosen STT provider.
// Swap out the implementation without touching the routes.

export async function transcribe(_audioBuffer: Buffer): Promise<string> {
  // TODO: send audioBuffer to Whisper / Deepgram / AssemblyAI / etc.
  // Example (OpenAI Whisper):
  //
  // const form = new FormData()
  // form.append('file', new Blob([audioBuffer]), 'audio.webm')
  // form.append('model', 'whisper-1')
  //
  // const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${config.OPENAI_API_KEY}` },
  //   body: form,
  // })
  // const json = await res.json()
  // return json.text as string

  throw new Error('transcribe() not implemented yet')
}
