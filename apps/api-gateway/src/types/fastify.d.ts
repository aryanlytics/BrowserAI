import 'fastify'

// Extend Fastify's request type globally so every route
// can access `request.user` after the auth middleware runs.
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      email: string
      [key: string]: unknown
    }
  }
}
