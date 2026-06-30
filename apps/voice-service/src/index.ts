import Fastify from 'fastify'
import { config } from './config/config.js'


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

  // ── Routes ───────────────────────────────────────────────────────────────────
  app.register(voiceRoutes)

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
