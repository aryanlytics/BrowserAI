import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import { config } from './config/config.js'
import { connectDatabases } from './config/database.js'


async function start() {

  // ─── 1. Connect databases ──────────────────────────────────────────────────
  await connectDatabases()

  // ─── 2. Build app ─────────────────────────────────────────────────────────
  const app = Fastify({
    logger: {
      level: config.NODE_ENV === 'production' ? 'warn' : 'info',
      transport: config.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    },
  })

  // Plugins
  await app.register(cookie)
  await app.register(cors, {
  origin: config.ALLOWED_ORIGINS, // 'http://localhost:4000'
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-internal-secret'], // gateway sends this header
})

  // Routes
  await app.

  // ─── 3. Start listening ────────────────────────────────────────────────────
  try {
    await app.listen({ port: config.PORT, host: '0.0.0.0' })
    console.log(`\n🚀 Auth Service → http://localhost:${config.PORT}\n`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`\n[Server] ❌ Failed to start — ${message}`)
    console.error(`[Server]    Is port ${config.PORT} already in use?\n`)
    process.exit(1)
  }
}

start()