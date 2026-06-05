import type { FastifyPluginAsync } from 'fastify'
import httpProxy from '@fastify/http-proxy'
import { config } from '../config.js'

/**
 * Auth routes plugin (PUBLIC — no authentication required).
 *
 * Forwards every request matching `/auth/*` straight to the
 * auth-service without any token validation. This is the only
 * part of the API that is reachable without a valid session.
 *
 * Routes proxied:
 *   POST /auth/register
 *   POST /auth/login
 *   POST /auth/verify-otp
 *   POST /auth/refresh
 *   POST /auth/logout
 *   GET  /auth/me
 */
const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.register(httpProxy, {
    upstream: config.AUTH_SERVICE_URL,
    prefix: '/auth',          // match incoming path prefix
    rewritePrefix: '/auth',   // keep the /auth prefix when forwarding
    http2: false,
  })
}

export default authRoutes
