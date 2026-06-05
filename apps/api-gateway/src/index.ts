import 'dotenv/config'
import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import authRoutes from './routes/auth.routes.js'
import protectedRoutes from './routes/protected.routes.js'
import { config } from './config.js'

// ─── App factory (exported so it can be tested) ───────────────────────────────
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

  // ── Global plugins ──────────────────────────────────────────────────────────

  // Parse httpOnly cookies on every request
  await fastify.register(cookie)

  // CORS — allow the frontend origin to send cookies cross-origin
  await fastify.register(cors, {
    origin: config.ALLOWED_ORIGINS,
    credentials: true, // required for withCredentials: true on the client
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  // ── Health check (no auth, no proxy) ───────────────────────────────────────
  fastify.get('/health', async () => ({
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
  }))

  // ── Route groups ────────────────────────────────────────────────────────────

  // PUBLIC: /auth/** → proxied straight to auth-service
  await fastify.register(authRoutes)

  // PROTECTED: everything else → auth middleware + downstream proxy
  await fastify.register(protectedRoutes)

  return fastify
}

// ─── Start server ─────────────────────────────────────────────────────────────
const app = await buildApp()

try {
  await app.listen({ port: config.PORT, host: '0.0.0.0' })
  app.log.info(`API Gateway listening on http://localhost:${config.PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
