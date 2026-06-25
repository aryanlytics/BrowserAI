// apps/voice-service/src/routes/voice.routes.ts
import Groq from 'groq-sdk'
import { config } from '../config/config.js'


const groq = new Groq({ apiKey: config.GROQ_API_KEY })

const voiceRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/transcribe', async (request, reply) => {
    const data = await request.file() // multipart audio file
    if (!data) return reply.status(400).send({ message: 'No audio file' })

    const buffer = await data.toBuffer()

    const transcription = await groq.audio.transcriptions.create({
      file: new File([buffer], 'speech.wav', { type: 'audio/wav' }),
      model: 'whisper-large-v3',


  })
}

