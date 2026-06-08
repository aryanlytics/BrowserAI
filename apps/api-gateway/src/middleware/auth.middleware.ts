import { FastifyRequest, FastifyReply } from 'fastify'
import axios from 'axios'
import { config } from '../config/config.js'

interface ValidateResponse {
  user: {
    id: string
    email: string
    [key: string]: unknown
  }
}

/**
 * Auth middleware (Fastify preHandler).
 *
 * 1. Reads the `accessToken` httpOnly cookie from the request.
 * 2. Calls auth-service /auth/validate via an internal axios POST.
 * 3. If valid → attaches `user` to `request.user` and continues.
 * 4. If missing / invalid → immediately replies 401.
 * 5. If auth-service is down → replies 503.
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const token = request.cookies['accessToken']

  if (!token) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'No access token provided',
    })
  }

  try {
    const { data } = await axios.post<ValidateResponse>(
      `${config.AUTH_SERVICE_URL}/auth/validate`,
      { token },
      {
        headers: {
          // Shared secret so auth-service can reject calls that didn't
          // come through the gateway (prevents bypassing the gateway).
          'x-internal-secret': config.INTERNAL_SECRET,
        },
      },
    )

    // Attach the validated user to request so downstream handlers can use it
    request.user = data.user
  } catch (err) {
    if (axios.isAxiosError(err)) {
      // Auth-service responded with 4xx (invalid/expired token)
      if (err.response) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid or expired access token',
        })
      }
      // No response — auth-service is unreachable
      return reply.status(503).send({
        statusCode: 503,
        error: 'Service Unavailable',
        message: 'Auth service is unreachable',
      })
    }

    // Unexpected non-axios error
    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    })
  }
}
