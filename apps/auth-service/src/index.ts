import 'dotenv/config'
import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import authRoutes from './routes/auth.routes.js'
import { config } from './config.js'

// ─── App factory ──────────────────────────────────────────────────────────────

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: config.NODE_ENV === 'production' ? 'warn' : 'info',
      transport:
        config.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  })

  // ── Plugins ─────────────────────────────────────────────────────────────────

  // Cookie parser — needed for reading refreshToken on /auth/refresh
  await fastify.register(cookie)

  // CORS — auth-service receives requests forwarded by the gateway (localhost)
  // In production, lock this down to the gateway's internal IP/hostname.
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  })

  // ── Health check ─────────────────────────────────────────────────────────────
  fastify.get('/health', async () => ({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  }))

  // ── Auth routes ──────────────────────────────────────────────────────────────
  await fastify.register(authRoutes)

  return fastify
}

// ─── Start server ─────────────────────────────────────────────────────────────

const app = await buildApp()

try {
  await app.listen({ port: config.PORT, host: '0.0.0.0' })
  app.log.info(`Auth Service listening on http://localhost:${config.PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
