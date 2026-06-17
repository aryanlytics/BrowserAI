import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import multipart from '@fastify/multipart'
import { config } from './config/config.js'
import voiceRoutes from './routes/voice.routes.js'

async function start() {

  // ── Build app ────────────────────────────────────────────────────────────────
  const app = Fastify({
    trustProxy: true,
    logger: {
      level: config.NODE_ENV === 'production' ? 'warn' : 'info',
      transport: config.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    },
  })

  // ── Plugins ──────────────────────────────────────────────────────────────────
  await app.register(cors, {
    origin:      config.ALLOWED_ORIGINS,
    credentials: true,
  })

  await app.register(cookie)

  // Allow audio file uploads up to 25 MB
  await app.register(multipart, { limits: { fileSize: 25 * 1024 * 1024 } })

  // ── Routes ───────────────────────────────────────────────────────────────────
  await app.register(voiceRoutes)

  // ── Start ────────────────────────────────────────────────────────────────────
  try {
    await app.listen({ port: config.PORT, host: '0.0.0.0' })
    console.log(`\n🎙️  Voice Service → http://localhost:${config.PORT}\n`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`\n[Server] ❌ Failed to start — ${message}`)
    console.error(`[Server]    Is port ${config.PORT} already in use?\n`)
    process.exit(1)
  }
}

start()
