import Fastify from 'fastify'
import config from './config/config.js'
import geminiRoutes from './routes/gemini.routes.js'
import { startGrpcServer } from './grpc/agent-server.js'

async function start() {
  // ── Fastify (HTTP) ──────────────────────────────────────────────────────────
  const app = Fastify({
    trustProxy: true,
    logger: {
      level: config.NODE_ENV === 'production' ? 'warn' : 'info',
      transport: config.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    },
  })

  app.register(geminiRoutes)

  // ── gRPC Server ─────────────────────────────────────────────────────────────
  const grpcPort = config.GRPC_PORT
  startGrpcServer(grpcPort)

  // ── Start HTTP ──────────────────────────────────────────────────────────────
  try {
    await app.listen({ port: config.PORT, host: '0.0.0.0' })
    console.log(`\n🤖 Gemini Service → http://localhost:${config.PORT}`)
    console.log(`   gRPC Agent     → 0.0.0.0:${grpcPort}\n`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`\n[Server] ❌ Failed to start — ${message}`)
    process.exit(1)
  }
}

start()
