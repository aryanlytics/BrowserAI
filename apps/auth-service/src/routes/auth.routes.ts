import type { FastifyPluginAsync } from 'fastify'
import { toNodeHandler } from 'better-auth/node'
import { auth } from '../lib/auth.js'

// Better Auth handles ALL of these automatically:
//   POST /api/auth/sign-up/email
//   POST /api/auth/sign-in/email
//   POST /api/auth/sign-out
//   POST /api/auth/verify-email
//   POST /api/auth/send-verification-email
//   GET  /api/auth/session
//   POST /api/auth/forget-password
//   POST /api/auth/reset-password

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const handler = toNodeHandler(auth)

  fastify.all('/api/auth/*', async (request, reply) => {
    await handler(request.raw, reply.raw)
    reply.hijack() // Better Auth writes directly to reply.raw
  })
}

export default authRoutes   