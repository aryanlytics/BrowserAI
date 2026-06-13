import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import { config } from './config/config.js'
import { connectDatabases } from './config/database.js'
import authRoutes from './routes/auth.routes.js'

async function start() {

  // 1. Connect databases
  await connectDatabases()

  // 2. Build app
  const app = Fastify({
    trustProxy: true,
    logger: {
      level: config.NODE_ENV === 'production' ? 'warn' : 'info',
      transport: config.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    },
  })

  // 3. Plugins
  await app.register(cookie)

  // 4. Routes
  await app.register(authRoutes)

  // 5. Start
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