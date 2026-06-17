import type { FastifyPluginAsync } from 'fastify'

// ─── Voice Routes ─────────────────────────────────────────────────────────────
// Handles voice input processing: transcription, command parsing, and response.

const voiceRoutes: FastifyPluginAsync = async (fastify) => {

  // ─── Health check ────────────────────────────────────────────────────────────
  fastify.get('/api/voice/health', async (_request, reply) => {
    return reply.status(200).send({ status: 'ok', service: 'voice-service' })
  })

  // ─── Transcribe ──────────────────────────────────────────────────────────────
  // Accepts an audio file (multipart/form-data) and returns a text transcript.
  // Plug in your STT provider (Whisper, Deepgram, etc.) in this handler.
  fastify.post('/api/voice/transcribe', async (request, reply) => {
    try {
      // TODO: read audio from multipart field, send to STT provider
      // const data = await request.file()
      // const transcript = await transcribe(data)

      return reply.status(200).send({
        success:    true,
        transcript: '', // replace with real result
      })
    } catch (err) {
      request.log.error(err, 'Transcription error')
      return reply.status(500).send({
        statusCode: 500,
        error:      'Internal Server Error',
        message:    'Failed to transcribe audio.',
      })
    }
  })

  // ─── Execute command ─────────────────────────────────────────────────────────
  // Accepts a text command, parses intent, and returns browser actions.
  fastify.post('/api/voice/execute', async (request, reply) => {
    const { command } = request.body as { command?: string }

    if (!command || typeof command !== 'string') {
      return reply.status(400).send({
        statusCode: 400,
        error:      'Bad Request',
        message:    'command is required.',
      })
    }

    try {
      // TODO: parse command intent and return structured browser actions
      // const actions = await parseCommand(command)

      return reply.status(200).send({
        success: true,
        command,
        actions: [], // replace with real actions
      })
    } catch (err) {
      request.log.error(err, 'Command execution error')
      return reply.status(500).send({
        statusCode: 500,
        error:      'Internal Server Error',
        message:    'Failed to process command.',
      })
    }
  })

}

export default voiceRoutes
