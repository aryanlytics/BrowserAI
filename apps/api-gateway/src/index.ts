import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import authRoutes from './routes/auth.routes.js'
import protectedRoutes from './routes/protected.routes.js'
import { config } from './config/config.js'

async function start() {

  // ─── Build app ─────────────────────────────────────────────────────────────
  const app = Fastify({
    logger: {
      level: config.NODE_ENV === 'production' ? 'warn' : 'info',
      transport: config.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    },
  })

  // ─── Plugins ───────────────────────────────────────────────────────────────

  // Parse httpOnly cookies on every request
  await app.register(cookie)

  // CORS — only the frontend origin can send cookies cross-origin
  await app.register(cors, {
    origin: config.ALLOWED_ORIGINS,  // ['http://localhost:3000']
    credentials: true,               // required for withCredentials on client
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  // ─── Routes ────────────────────────────────────────────────────────────────

  // PUBLIC: /auth/* → proxied to auth-service, no token required
  await app.register(authRoutes)

  // PROTECTED: everything else → auth middleware runs first
  await app.register(protectedRoutes)

  // ─── Start ─────────────────────────────────────────────────────────────────
  try {
    await app.listen({ port: config.PORT, host: '0.0.0.0' })
    console.log(`\n🚀 API Gateway → http://localhost:${config.PORT}\n`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`\n[Server] ❌ Failed to start — ${message}`)
    console.error(`[Server]    Is port ${config.PORT} already in use?\n`)
    process.exit(1)
  }
}

start()