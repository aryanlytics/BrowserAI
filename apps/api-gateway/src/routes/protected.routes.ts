import type { FastifyPluginAsync } from 'fastify'
import replyFrom from '@fastify/reply-from'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { config } from '../config/config.js'

/**
 * Protected routes plugin (PRIVATE — authentication required).
 *
 * Every route registered here runs `authMiddleware` first.
 * If the token is valid, `request.user` is populated and the
 * request is forwarded to the appropriate downstream service,
 * with an `x-user-id` and `x-user-email` header injected for
 * downstream services to consume without re-validating the token.
 *
 * To add a new microservice:
 *   1. Add its URL to config.ts and .env.example
 *   2. Add a new `fastify.all('/your-prefix/*', ...)` handler below
 */
const protectedRoutes: FastifyPluginAsync = async (fastify) => {
  // Register reply-from so we can use reply.from() for proxying
  fastify.register(replyFrom)

  // Apply auth middleware to ALL routes in this plugin scope
  fastify.addHook('preHandler', authMiddleware)

  // ----------------------------------------------------------------
  // Example: Browser service (future)
  // fastify.all('/browser/*', async (request, reply) => {
  //   const downstream = request.url.replace(/^\/browser/, '')
  //   return reply.from(`${config.BROWSER_SERVICE_URL}${downstream}`, {
  //     rewriteRequestHeaders: (req, headers) => ({
  //       ...headers,
  //       'x-user-id': req.user?.id ?? '',
  //       'x-user-email': req.user?.email ?? '',
  //       'x-internal-secret': config.INTERNAL_SECRET,
  //     }),
  //   })
  // })
  // ----------------------------------------------------------------

  // Catch-all: return 404 for any unknown protected route.
  // NOTE: We intentionally exclude OPTIONS here because @fastify/cors
  // already registers its own OPTIONS handler for CORS preflight, and
  // fastify.all() would conflict with it (duplicate route error).
  const notFound = async (
    _request: import('fastify').FastifyRequest,
    reply: import('fastify').FastifyReply,
  ) => {
    return reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: 'No downstream service is registered for this path',
    })
  }
  fastify.get('/*', notFound)
  fastify.post('/*', notFound)
  fastify.put('/*', notFound)
  fastify.patch('/*', notFound)
  fastify.delete('/*', notFound)
  fastify.head('/*', notFound)
}

export default protectedRoutes
